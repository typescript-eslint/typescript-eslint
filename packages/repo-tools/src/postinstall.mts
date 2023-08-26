import { $ as $_config } from 'execa';

const $ = $_config({
  stdout: 'inherit',
  stderr: 'inherit',
  verbose: true,
});

/**
 * In certain circumstances we might want to skip the below the steps when another
 * tool is invoking the install command (such as when nx migrate runs).
 * We therefore use an env var for this.
 */

if (process.env.SKIP_POSTINSTALL) {
  console.log(
    '\nSkipping postinstall script because $SKIP_POSTINSTALL is set...\n',
  );
  // eslint-disable-next-line no-process-exit
  process.exit(0);
}

void (async function (): Promise<void> {
  // make sure we're running from the workspace root
  const {
    default: { workspaceRoot },
  } = await import('@nx/devkit');
  process.chdir(workspaceRoot);

  // Apply patches to installed node_modules
  await $`yarn patch-package`;

  // Install git hooks
  await $`yarn husky install`;

  if (!process.env.SKIP_POSTINSTALL_BUILD) {
    // Clean any caches that may be invalid now
    await $`yarn clean`;

    // Build all the packages ready for use
    await $`yarn build`;
  }
})();
