import {
  releaseChangelog,
  releasePublish,
  releaseVersion,
} from 'nx/src/command-line/release';
// eslint-disable-next-line import/no-extraneous-dependencies
import yargs from 'yargs';

void (async () => {
  try {
    const options = await yargs
      .version(false)
      .option('version', {
        description:
          'Explicit version specifier to use, if overriding conventional commits',
        type: 'string',
      })
      .option('dryRun', {
        alias: 'd',
        description:
          'Whether or not to perform a dry-run of the release process, defaults to true',
        type: 'boolean',
        default: true,
      })
      .option('verbose', {
        description:
          'Whether or not to enable verbose logging, defaults to false',
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

    // This will create a release on GitHub
    await releaseChangelog({
      versionData: projectsVersionData,
      version: workspaceVersion,
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    await releasePublish({
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    // eslint-disable-next-line no-process-exit
    process.exit(0);
  } catch (err) {
    console.error(err);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
})();
