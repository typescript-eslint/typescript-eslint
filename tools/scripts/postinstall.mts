import { $ as $_config } from 'execa';

const $ = $_config({
  env: {
    /**
     * Do not apply the special GitHub Actions group markers within the
     * postinstall logging, it cannot work correctly when nested within
     * pnpm's output and therefore just adds visual noise.
     */
    NX_SKIP_LOG_GROUPING: 'true',
  },
  stderr: 'inherit',
  stdout: 'inherit',
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

// make sure we're running from the workspace root
const { workspaceRoot } = await import('@nx/devkit');
process.chdir(workspaceRoot);

// Install git hooks
await $`pnpx husky`;

if (!process.env.SKIP_POSTINSTALL_BUILD) {
  // Clean any caches that may be invalid now
  await $`pnpm run clean`;

  // Build all the packages ready for use
  await $`pnpm run build`;
  await $`pnpm exec nx typecheck ast-spec`;
}
