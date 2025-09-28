import { execaSync } from 'execa';
import {
  releaseChangelog,
  releasePublish,
  releaseVersion,
} from 'nx/release/index.js';
import yargs from 'yargs';

if (process.env.CI !== 'true') {
  throw new Error(
    'Releases cannot be run outside of CI, we use trusted publishing which requires an authenticated GitHub Actions environment',
  );
}

const options = await yargs(process.argv.slice(2))
  .version(false)
  .option('version', {
    description:
      'Explicit version specifier to use, if overriding conventional commits',
    type: 'string',
  })
  .option('dryRun', {
    alias: 'd',
    default: true,
    description:
      'Whether to perform a dry-run of the release process, defaults to true',
    type: 'boolean',
  })
  .option('forceReleaseWithoutChanges', {
    default: false,
    description:
      'Whether to do a release regardless of if there have been changes',
    type: 'boolean',
  })
  .option('verbose', {
    default: false,
    description: 'Whether or not to enable verbose logging, defaults to false',
    type: 'boolean',
  })
  .option('firstRelease', {
    default: false,
    description:
      'Whether or not one of more of the packages are being released for the first time',
    type: 'boolean',
  })
  .parseAsync();

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
  execaSync('yarn', ['tsx', 'tools/release/apply-canary-version.mts']);
  console.log(
    '✅ Applied canary version to package.json files so that dry-run publishing produces useful output\n',
  );
}

const publishProjectsResult = await releasePublish({
  dryRun: options.dryRun,
  firstRelease: options.firstRelease,
  verbose: options.verbose,
});

// Revert all temporary changes
if (options.dryRun) {
  console.log(
    '⚠️ NOTE: Reverting temporary package.json changes related to dry-run publishing...',
  );
  execaSync('git', [
    'checkout',
    'packages/**/package.json',
    'package.json',
    'yarn.lock',
  ]);
  console.log(
    '✅ Reverted temporary package.json changes related to dry-run publishing\n',
  );
}

// eslint-disable-next-line no-process-exit
process.exit(
  // If any of the individual project publish tasks returned a non-zero exit code, exit with code 1
  Object.values(publishProjectsResult).some(({ code }) => code !== 0) ? 1 : 0,
);
