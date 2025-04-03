/**
 * Pack all of our packages so we can "install" them later.
 * We do this here rather than per test so that we only have
 * to do it once per test run as it takes a decent chunk of
 * time to do.
 * This also ensures all of the tests are guaranteed to run
 * against the exact same version of the package.
 */

import * as child_process from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

export const execFile = promisify(child_process.execFile);

export interface PackageJSON {
  devDependencies: Record<string, string>;
  name: string;
  private?: boolean;
}

const PACKAGES_DIR = path.resolve(__dirname, '..', '..');

export const homeOrTmpDir = os.tmpdir() || os.homedir();

const tarFolder = path.join(
  homeOrTmpDir,
  'typescript-eslint-integration-tests',
  'tarballs',
);

export const setup = async (): Promise<PackageJSON['devDependencies']> => {
  const PACKAGES = await fs.readdir(PACKAGES_DIR, {
    encoding: 'utf-8',
    withFileTypes: true,
  });

  await fs.mkdir(tarFolder, { recursive: true });

  const tseslintPackages = Object.fromEntries(
    (
      await Promise.all(
        PACKAGES.map(async ({ name: pkg }) => {
          const packageDir = path.join(PACKAGES_DIR, pkg);
          const packagePath = path.join(packageDir, 'package.json');

          try {
            if (!(await fs.lstat(packagePath)).isFile()) {
              return;
            }
          } catch {
            return;
          }

          const packageJson: PackageJSON = (
            await import(pathToFileURL(packagePath).href, {
              with: { type: 'json' },
            })
          ).default;

          if ('private' in packageJson && packageJson.private === true) {
            return;
          }

          const result = await execFile('npm', ['pack', packageDir], {
            cwd: tarFolder,
            encoding: 'utf-8',
            shell: true,
          });

          if (typeof result.stdout !== 'string') {
            return;
          }

          const stdoutLines = result.stdout.trim().split('\n');
          const tarball = stdoutLines[stdoutLines.length - 1];

          return [
            packageJson.name,
            `file:${path.join(tarFolder, tarball)}`,
          ] as const;
        }),
      )
    ).filter(e => e != null),
  );

  console.log('Finished packing local packages.');

  return tseslintPackages;
};

const teardown = async (): Promise<void> => {
  if (process.env.KEEP_INTEGRATION_TEST_DIR !== 'true') {
    await fs.rm(path.dirname(tarFolder), { recursive: true });
  }
};

// eslint-disable-next-line import/no-default-export
export default teardown;
