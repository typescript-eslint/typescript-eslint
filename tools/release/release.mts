import type { ParseArgsConfig } from 'node:util';

import {
  createProjectGraphAsync,
  readJsonFile,
  workspaceRoot,
} from '@nx/devkit';
import { execa, execaSync } from 'execa';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { parseArgs } from 'node:util';
import {
  ReleaseClient,
  releaseChangelog,
  releaseVersion,
} from 'nx/release/index.js';

// npm only serves a new version after scanning it, usually ~5 but up to 15+ minutes:
// https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/
const INSTALLABLE_POLL_INTERVAL_MS = 15_000;
const INSTALLABLE_TIMEOUT_MS = 30 * 60_000;

interface PublishablePackage {
  dependencies: string[];
  packageName: string;
  projectName: string;
  version: string;
}

async function getPublishLayers(
  projectNames: string[],
): Promise<PublishablePackage[][]> {
  const projectGraph = await createProjectGraphAsync();

  const remaining = new Set(
    projectNames
      // Private packages have no publish target and are never published
      .filter(
        projectName =>
          projectGraph.nodes[projectName].data.targets?.[
            'nx-release-publish'
          ] != null,
      )
      .map((projectName): PublishablePackage => {
        const manifest = readJsonFile<{
          dependencies?: Record<string, string>;
          name: string;
          optionalDependencies?: Record<string, string>;
          peerDependencies?: Record<string, string>;
          version: string;
        }>(
          path.join(
            workspaceRoot,
            projectGraph.nodes[projectName].data.root,
            'package.json',
          ),
        );

        return {
          dependencies: Object.keys({
            ...manifest.dependencies,
            ...manifest.optionalDependencies,
            ...manifest.peerDependencies,
          }),
          packageName: manifest.name,
          projectName,
          version: manifest.version,
        };
      }),
  );

  const layers: PublishablePackage[][] = [];

  while (remaining.size > 0) {
    const remainingNames = new Set(
      [...remaining].map(({ packageName }) => packageName),
    );
    const layer = [...remaining].filter(
      ({ dependencies }) =>
        !dependencies.some(name => remainingNames.has(name)),
    );

    if (layer.length === 0) {
      throw new Error(
        `Circular dependency between packages: ${[...remainingNames].join(', ')}`,
      );
    }

    layers.push(layer);
    for (const publishablePackage of layer) {
      remaining.delete(publishablePackage);
    }
  }

  return layers;
}

async function isInstallable({
  packageName,
  version,
}: PublishablePackage): Promise<boolean> {
  const { exitCode, failed, stderr, stdout } = await execa(
    'npm',
    ['view', `${packageName}@${version}`, 'version'],
    { reject: false },
  );

  if (stdout.trim() === version) {
    return true;
  }

  // npm answers E404 while the version is being scanned; show any other failure
  if (failed && !stderr.includes('E404')) {
    console.warn(
      `⚠️ npm view ${packageName}@${version} failed (exit code ${String(exitCode)}): ${stderr}`,
    );
  }

  return false;
}

async function waitUntilInstallable(
  packages: PublishablePackage[],
): Promise<PublishablePackage[]> {
  const deadline = Date.now() + INSTALLABLE_TIMEOUT_MS;
  let pending = packages;
  let loggedNames = '';

  for (;;) {
    const installable = await Promise.all(pending.map(isInstallable));
    pending = pending.filter((_, index) => !installable[index]);

    if (pending.length === 0 || Date.now() > deadline) {
      return pending;
    }

    const pendingNames = formatPackages(pending);
    if (pendingNames !== loggedNames) {
      console.log(`⏳ Waiting for npm to make ${pendingNames} installable...`);
      loggedNames = pendingNames;
    }

    await sleep(INSTALLABLE_POLL_INTERVAL_MS);
  }
}

function formatPackages(packages: PublishablePackage[]): string {
  return packages
    .map(({ packageName, version }) => `${packageName}@${version}`)
    .join(', ');
}

function booleanOption(value: string): boolean {
  const normalizedValue = value.toLowerCase().trim();
  const allowedValues = ['', 'true', 'false'];

  if (!allowedValues.includes(normalizedValue)) {
    throw new Error(`Invalid boolean value: "${value}"`);
  }

  return normalizedValue !== 'false';
}

const parseArgsOptions = {
  'dry-run': {
    default: 'true',
    short: 'd',
    type: 'string',
  },
  'first-release': {
    default: 'false',
    type: 'string',
  },
  'force-release-without-changes': {
    default: 'false',
    type: 'string',
  },
  help: {
    default: false,
    type: 'boolean',
  },
  verbose: {
    default: false,
    type: 'boolean',
  },
  version: {
    type: 'string',
  },
} as const satisfies ParseArgsConfig['options'];

const optionDescriptions: Record<keyof typeof parseArgsOptions, string> = {
  'dry-run':
    'Whether to perform a dry-run of the release process, defaults to true',
  'first-release':
    'Whether or not one of more of the packages are being released for the first time',
  'force-release-without-changes':
    'Whether to do a release regardless of if there have been changes',
  help: 'Show help',
  verbose: 'Whether or not to enable verbose logging, defaults to false',
  version:
    'Explicit version specifier to use, if overriding conventional commits',
};

function printHelp(): void {
  console.log('Options:');
  for (const [name, config] of Object.entries(parseArgsOptions)) {
    const short = 'short' in config ? `-${config.short}, ` : '    ';
    const defaultStr =
      'default' in config ? ` [default: ${String(config.default)}]` : '';
    const description =
      optionDescriptions[name as keyof typeof optionDescriptions];

    console.log(
      `  ${short}--${name.padEnd(35)} ${description} [${config.type}]${defaultStr}`,
    );
  }
}

const { values: rawOptions } = parseArgs({
  args: process.argv.slice(2),
  options: parseArgsOptions,
});

if (rawOptions.help) {
  printHelp();
  // eslint-disable-next-line no-process-exit
  process.exit(0);
}

const options = {
  dryRun: booleanOption(rawOptions['dry-run']),
  firstRelease: booleanOption(rawOptions['first-release']),
  forceReleaseWithoutChanges: booleanOption(
    rawOptions['force-release-without-changes'],
  ),
  verbose: rawOptions.verbose,
  version: rawOptions.version,
};

if (process.env.CI !== 'true' && !options.dryRun) {
  throw new Error(
    'Releases cannot be run outside of CI, we use trusted publishing which requires an authenticated GitHub Actions environment',
  );
}

const { projectsVersionData, workspaceVersion } = await releaseVersion({
  specifier: options.version,
  // stage package.json updates to be committed later by the changelog command
  dryRun: options.dryRun,
  firstRelease: options.firstRelease,
  stageChanges: true,
  verbose: options.verbose,
});

// Update the lock file after the version bumps and stage it ready to be committed by the changelog step
if (!options.dryRun) {
  console.log('⏳ Updating pnpm-lock.yaml...');
  execaSync(`pnpm`, [`install`], {
    env: { ...process.env, SKIP_POSTINSTALL: 'true' },
  });
  execaSync(`git`, [`add`, `pnpm-lock.yaml`]);
  console.log('✅ Updated and staged pnpm-lock.yaml\n');
}

// This will create a release on GitHub
await releaseChangelog({
  dryRun: options.dryRun,
  firstRelease: options.firstRelease,
  verbose: options.verbose,
  version: workspaceVersion,
  versionData: projectsVersionData,
});

// An explicit null value here means that no changes were detected across any package
// eslint-disable-next-line eqeqeq, @typescript-eslint/internal/eqeq-nullish
if (!options.forceReleaseWithoutChanges && workspaceVersion === null) {
  console.log(
    '⏭️ No changes detected across any package, skipping publish step altogether',
  );
  // eslint-disable-next-line no-process-exit
  process.exit(0);
}

/**
 * In order for the `npm publish --dry-run` to produce any kind of valuable output, we have to
 * modify the package versions on disk to a unique version before running it, otherwise it will
 * simply print `You cannot publish over the previously published versions: X.X.X`.
 *
 * Therefore we will leverage our apply-canary-version.mts script to do this for us in this case.
 */
if (options.dryRun) {
  console.log(
    '⚠️ NOTE: Applying canary version to package.json files so that dry-run publishing produces useful output...',
  );
  execaSync('pnpm', ['exec', 'tsx', 'tools/release/apply-canary-version.mts']);
  console.log(
    '✅ Applied canary version to package.json files so that dry-run publishing produces useful output\n',
  );
}

// A new version is only installable once npm has scanned it, and each version is
// scanned separately. Publish one dependency layer at a time and wait until npm
// serves it, so a published package never points at a version npm doesn't serve.
const publishLayers = await getPublishLayers(Object.keys(projectsVersionData));
const { releasePublish: releasePublishProjects } = new ReleaseClient({
  // Nx does not allow publishing a subset of a fixed release group
  projectsRelationship: 'independent',
});
let publishFailed = false;

for (const [index, layer] of publishLayers.entries()) {
  console.log(
    `📦 Publishing layer ${index + 1} of ${publishLayers.length}: ${formatPackages(layer)}\n`,
  );

  const layerResult = await releasePublishProjects({
    dryRun: options.dryRun,
    firstRelease: options.firstRelease,
    projects: layer.map(({ projectName }) => projectName),
    verbose: options.verbose,
  });

  if (Object.values(layerResult).some(({ code }) => code !== 0)) {
    console.error(
      '❌ Publishing failed, so the remaining layers were not published',
    );
    publishFailed = true;
    break;
  }

  if (!options.dryRun) {
    const notInstallable = await waitUntilInstallable(layer);

    if (notInstallable.length > 0) {
      console.error(
        [
          `❌ npm did not make ${formatPackages(notInstallable)} installable within ${INSTALLABLE_TIMEOUT_MS / 60_000} minutes, so the remaining layers were not published.`,
          'Once npm serves these versions, re-run the Release workflow as a stable release with force_release_without_changes to publish the rest. Versions already on npm are skipped.',
        ].join('\n'),
      );
      publishFailed = true;
      break;
    }

    console.log(`✅ npm now serves layer ${index + 1}\n`);
  }
}

// Revert all temporary changes
if (options.dryRun) {
  console.log(
    '⚠️ NOTE: Reverting temporary package.json changes related to dry-run publishing...',
  );
  execaSync('git', [
    'restore',
    '--staged',
    '--worktree',
    'packages/**/package.json',
    'package.json',
    'pnpm-lock.yaml',
  ]);
  console.log(
    '✅ Reverted temporary package.json changes related to dry-run publishing\n',
  );
}

// eslint-disable-next-line no-process-exit
process.exit(publishFailed ? 1 : 0);
