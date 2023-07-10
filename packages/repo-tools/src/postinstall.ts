import * as execa from 'execa';
import path from 'path';

/**
 * In certain circumstances we want to skip the below the steps and it may not always
 * be possible to use --ignore-scripts (e.g. if another tool is what is invoking the
 * install command, such as when nx migrate runs). We therefore use and env var for this.
 */

if (process.env.SKIP_POSTINSTALL) {
  console.log(
    '\nSkipping postinstall script because $SKIP_POSTINSTALL is set...\n',
  );
  // eslint-disable-next-line no-process-exit
  process.exit(0);
}

const REPO_ROOT = path.resolve(__dirname, '..', '..');

void (async function (): Promise<void> {
  // make sure we're running from the root
  process.chdir(REPO_ROOT);

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

async function $(cmd: TemplateStringsArray): Promise<execa.ExecaChildProcess> {
  const command = cmd.join();
  console.log(`\n$ ${command}`);
  return execa.command(command, {
    stdio: 'inherit',
  });
}
