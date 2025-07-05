import { execaSync } from 'execa';
import {
  releaseChangelog,
  releasePublish,
  releaseVersion,
} from 'nx/release/index.js';
import yargs from 'yargs';

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
  .parseAsync();

const { projectsVersionData, workspaceVersion } = await releaseVersion({
  specifier: options.version,
  // stage package.json updates to be committed later by the changelog command
  dryRun: options.dryRun,
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

const publishProjectsResult = await releasePublish({
  dryRun: options.dryRun,
  verbose: options.verbose,
});

// eslint-disable-next-line no-process-exit
process.exit(
  // If any of the individual project publish tasks returned a non-zero exit code, exit with code 1
  Object.values(publishProjectsResult).some(({ code }) => code !== 0) ? 1 : 0,
);
