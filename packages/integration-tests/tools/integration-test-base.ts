import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import type { PackageJSON } from './pack-packages.js';

import rootPackageJson from '../../../package.json';
import { execFile, homeOrTmpDir } from './pack-packages';

const { tseslintPackages } = global;

const BASE_DEPENDENCIES: PackageJSON['devDependencies'] = {
  ...tseslintPackages,
  eslint: rootPackageJson.devDependencies.eslint,
  jest: rootPackageJson.devDependencies.jest,
  typescript: rootPackageJson.devDependencies.typescript,
};

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

// make sure that jest doesn't timeout the test
jest.setTimeout(60_000);

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
        const testFolder = path.join(
          homeOrTmpDir,
          'typescript-eslint-integration-tests',
          fixture,
        );

        await fs.mkdir(testFolder, { recursive: true });

        // copy the fixture files to the temp folder
        await fs.cp(fixtureDir, testFolder, { recursive: true });

        // build and write the package.json for the test
        const fixturePackageJson: PackageJSON = (
          await import(path.join(fixtureDir, 'package.json'), {
            with: { type: 'json' },
          })
        ).default;

        await fs.writeFile(
          path.join(testFolder, 'package.json'),
          JSON.stringify(
            {
              private: true,
              ...fixturePackageJson,
              devDependencies: {
                ...BASE_DEPENDENCIES,
                ...fixturePackageJson.devDependencies,
              },
              // ensure everything uses the locally packed versions instead of the NPM versions
              resolutions: {
                ...tseslintPackages,
              },
            },
            null,
            2,
          ),
          { encoding: 'utf-8' },
        );
        // console.log('package.json written.');

        // Ensure yarn uses the node-modules linker and not PnP
        await fs.writeFile(
          path.join(testFolder, '.yarnrc.yml'),
          `nodeLinker: node-modules\n`,
          { encoding: 'utf-8' },
        );

        await execFile('yarn', ['install', '--no-immutable'], {
          cwd: testFolder,
          shell: true,
        });

        await executeTest(testFolder);
      });
    });
  });
}

export function eslintIntegrationTest(
  testFilename: string,
  filesGlob: string,
): void {
  integrationTest('eslint', testFilename, async testFolder => {
    // lint, outputting to a JSON file
    const outFile = path.join(testFolder, 'eslint.json');

    await fs.writeFile(outFile, '', { encoding: 'utf-8' });
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
          '--fix-dry-run',
          filesGlob,
        ],
        {
          cwd: testFolder,
          shell: true,
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
    const lintOutputRAW = (await fs.readFile(outFile, { encoding: 'utf-8' }))
      // clean the output to remove any changing facets so tests are stable
      .replaceAll(
        new RegExp(`"filePath": ?"(/private)?${testFolder}`, 'g'),
        '"filePath": "<root>',
      )
      .replaceAll(
        /"filePath":"([^"]*)"/g,
        (_, testFile: string) =>
          `"filePath": "<root>/${path.relative(testFolder, testFile)}"`,
      )
      .replaceAll(/C:\\\\(usr)\\\\(linked)\\\\(tsconfig.json)/g, '/$1/$2/$3');
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
      execFile('yarn', ['tsc', '--noEmit', '--skipLibCheck', ...tscArgs], {
        cwd: testFolder,
        shell: true,
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
