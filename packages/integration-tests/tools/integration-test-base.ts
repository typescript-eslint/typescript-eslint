import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

import ncp from 'ncp';
import type { DirOptions } from 'tmp';
import tmp from 'tmp';

interface PackageJSON {
  name: string;
  private?: boolean;
  devDependencies: Record<string, string>;
}

const rootPackageJson: PackageJSON = require('../../../package.json');

tmp.setGracefulCleanup();

const copyDir = promisify(ncp.ncp);
const execFile = promisify(childProcess.execFile);
const readFile = promisify(fs.readFile);
const tmpDir = promisify(tmp.dir) as (opts?: DirOptions) => Promise<string>;
const tmpFile = promisify(tmp.file);
const writeFile = promisify(fs.writeFile);

const BASE_DEPENDENCIES: PackageJSON['devDependencies'] = {
  ...global.tseslintPackages,
  eslint: rootPackageJson.devDependencies.eslint,
  typescript: rootPackageJson.devDependencies.typescript,
  jest: rootPackageJson.devDependencies.jest,
};

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');
// an env var to persist the temp folder so that it can be inspected for debugging purposes
const KEEP_INTEGRATION_TEST_DIR =
  process.env.KEEP_INTEGRATION_TEST_DIR === 'true';

// make sure that jest doesn't timeout the test
jest.setTimeout(60000);

function integrationTest(
  testName: string,
  testFilename: string,
  executeTest: (testFolder: string) => Promise<void>,
): void {
  const fixture = path.parse(testFilename).name.replace('.test', '');
  describe(fixture, () => {
    const fixtureDir = path.join(FIXTURES_DIR, fixture);

    describe(testName, () => {
      it('should work successfully', async () => {
        const testFolder = await tmpDir({
          keep: KEEP_INTEGRATION_TEST_DIR,
        });
        if (KEEP_INTEGRATION_TEST_DIR) {
          console.error(testFolder);
        }

        // copy the fixture files to the temp folder
        await copyDir(fixtureDir, testFolder);

        // build and write the package.json for the test
        const fixturePackageJson: PackageJSON = await import(
          path.join(fixtureDir, 'package.json')
        );
        await writeFile(
          path.join(testFolder, 'package.json'),
          JSON.stringify({
            private: true,
            ...fixturePackageJson,
            devDependencies: {
              ...BASE_DEPENDENCIES,
              ...fixturePackageJson.devDependencies,
            },
            // ensure everything uses the locally packed versions instead of the NPM versions
            resolutions: {
              ...global.tseslintPackages,
            },
          }),
        );
        // console.log('package.json written.');

        // Ensure yarn uses the node-modules linker and not PnP
        await writeFile(
          path.join(testFolder, '.yarnrc.yml'),
          `nodeLinker: node-modules`,
        );

        await new Promise<void>((resolve, reject) => {
          // we use the non-promise version so we can log everything on error
          childProcess.execFile(
            // we use yarn instead of npm as it will cache the remote packages and
            // make installing things faster
            'yarn',
            // We call explicitly with --no-immutable to prevent errors related to missing lock files in CI
            ['install', '--no-immutable'],
            {
              cwd: testFolder,
            },
            (err, stdout, stderr) => {
              if (err) {
                if (stdout.length > 0) {
                  console.warn(stdout);
                }
                if (stderr.length > 0) {
                  console.error(stderr);
                }
                // childProcess.ExecFileException is an extension of Error
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject(err);
              } else {
                resolve();
              }
            },
          );
        });
        // console.log('Install complete.');

        await executeTest(testFolder);
      });

      afterAll(() => {});
    });
  });
}

export function eslintIntegrationTest(
  testFilename: string,
  filesGlob: string,
  legacyConfig = false,
): void {
  integrationTest('eslint', testFilename, async testFolder => {
    // lint, outputting to a JSON file
    const outFile = await tmpFile();
    let stderr = '';
    try {
      await execFile(
        'yarn',
        [
          'eslint',
          '--format',
          'json',
          '--output-file',
          outFile,
          '--config',
          legacyConfig ? './.eslintrc.js' : './eslint.config.js',
          '--fix-dry-run',
          filesGlob,
        ],
        {
          env: legacyConfig ? { ESLINT_USE_FLAT_CONFIG: 'false' } : undefined,
          cwd: testFolder,
        },
      );
    } catch (ex) {
      // we expect eslint will "fail" because we have intentional lint errors

      // useful for debugging
      if (typeof ex === 'object' && ex != null && 'stderr' in ex) {
        stderr = String(ex.stderr);
      }
    }
    // console.log('Lint complete.');
    expect(stderr).toHaveLength(0);

    // assert the linting state is consistent
    const lintOutputRAW = (await readFile(outFile, 'utf8'))
      // clean the output to remove any changing facets so tests are stable
      .replace(
        new RegExp(`"filePath": ?"(/private)?${testFolder}`, 'g'),
        '"filePath": "<root>',
      );
    try {
      const lintOutput = JSON.parse(lintOutputRAW);
      expect(lintOutput).toMatchSnapshot();
    } catch {
      throw new Error(
        `Lint output could not be parsed as JSON: \`${lintOutputRAW}\`.`,
      );
    }
  });
}

export function typescriptIntegrationTest(
  testName: string,
  testFilename: string,
  tscArgs: string[],
  assertOutput: (out: string) => void,
): void {
  integrationTest(testName, testFilename, async testFolder => {
    const [result] = await Promise.allSettled([
      execFile('yarn', ['tsc', '--noEmit', ...tscArgs], {
        cwd: testFolder,
      }),
    ]);

    if (result.status === 'rejected') {
      // this looks weird - but it means that we can show the stdout (the errors)
      // in the test output when typescript fails which helps with debugging
      assertOutput(
        (result.reason as { stdout: string }).stdout.replace(
          // on macos the tmp path might be shown by TS with `/private/`, but
          // the tmp util does not include that prefix folder
          new RegExp(`(/private)?${testFolder}`),
          '/<tmp_folder>',
        ),
      );
    } else {
      // TS logs nothing when it succeeds
      expect(result.value.stdout).toBe('');
      expect(result.value.stderr).toBe('');
    }
  });
}
