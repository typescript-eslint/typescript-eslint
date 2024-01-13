import { execaSync } from 'execa';
import {
  releaseChangelog,
  releasePublish,
  releaseVersion,
} from 'nx/src/command-line/release';
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
    description:
      'Whether to perform a dry-run of the release process, defaults to true',
    type: 'boolean',
    default: true,
  })
  .option('verbose', {
    description: 'Whether or not to enable verbose logging, defaults to false',
    type: 'boolean',
    default: false,
  })
  .parseAsync();

const { workspaceVersion, projectsVersionData } = await releaseVersion({
  specifier: options.version,
  // stage package.json updates to be committed later by the changelog command
  stageChanges: true,
  dryRun: options.dryRun,
  verbose: options.verbose,
});

// Update the lock file after the version bumps and stage it ready to be committed by the changelog step
if (!options.dryRun) {
  console.log('⏳ Updating yarn.lock...');
  execaSync(`yarn`, [`install`], {
    env: { ...process.env, SKIP_POSTINSTALL: 'true' },
  });
  execaSync(`git`, [`add`, `yarn.lock`]);
  console.log('✅ Updated and staged yarn.lock\n');
}

// This will create a release on GitHub
await releaseChangelog({
  versionData: projectsVersionData,
  version: workspaceVersion,
  dryRun: options.dryRun,
  verbose: options.verbose,
});

// An explicit null value here means that no changes were detected across any package
// eslint-disable-next-line eqeqeq
if (workspaceVersion === null) {
  console.log(
    '⏭️ No changes detected across any package, skipping publish step altogether',
  );
} else {
  await releasePublish({
    dryRun: options.dryRun,
    verbose: options.verbose,
  });
}
