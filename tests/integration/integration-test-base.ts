import childProcess from 'child_process';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import tmp from 'tmp';
import { promisify } from 'util';

interface PackageJSON {
  name: string;
  private?: boolean;
  devDependencies: Record<string, string>;
}

const rootPackageJson: PackageJSON = require('../../package.json');

tmp.setGracefulCleanup();

const copyDir = promisify(ncp.ncp);
const execFile = promisify(childProcess.execFile);
const readFile = promisify(fs.readFile);
const tmpDir = promisify(tmp.dir);
const tmpFile = promisify(tmp.file);
const writeFile = promisify(fs.writeFile);

const BASE_DEPENDENCIES: PackageJSON['devDependencies'] = {
  // @ts-expect-error -- this is in `./pack-packages.ts`
  ...global.tseslintPackages,
  eslint: rootPackageJson.devDependencies.eslint,
  typescript: rootPackageJson.devDependencies.typescript,
  jest: rootPackageJson.devDependencies.jest,
};

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

// make sure that jest doesn't timeout the test
jest.setTimeout(60000);

export function integrationTest(testFilename: string, filesGlob: string): void {
  const fixture = path.parse(testFilename).name.replace('.test', '');
  describe(fixture, () => {
    const fixtureDir = path.join(FIXTURES_DIR, fixture);

    it('should lint successfully', async () => {
      const testFolder = await tmpDir();

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
          devDependencies: {
            ...BASE_DEPENDENCIES,
            ...fixturePackageJson.devDependencies,
            // install tslint with the base version if required
            tslint: fixturePackageJson.devDependencies.tslint
              ? rootPackageJson.devDependencies.tslint
              : undefined,
          },
          // ensure everything uses the locally packed versions instead of the NPM versions
          resolutions: {
            // @ts-expect-error -- this is in `./pack-packages.ts`
            ...global.tseslintPackages,
          },
        }),
      );
      // console.log('package.json written.');

      await new Promise<void>((resolve, reject) => {
        // we use the non-promise version so we can log everything on error
        childProcess.execFile(
          // we use yarn instead of npm as it will cache the remote packages and
          // to make installs things faster
          'yarn',
          ['install', '--no-lockfile', '--prefer-offline', '--no-progress'],
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
              reject(err);
            } else {
              resolve();
            }
          },
        );
      });
      // console.log('Install complete.');

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
            './.eslintrc.js',
            '--fix-dry-run',
            filesGlob,
          ],
          {
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
          `Lint output could not be parsed as JSON: \`${lintOutputRAW}\`. The error logs from eslint were: \`${stderr}\``,
        );
      }
    });

    afterAll(() => {});
  });
}
