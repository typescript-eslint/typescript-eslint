import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { execFile, FIXTURES_DESTINATION_DIR } from './pack-packages.js';

// make sure that vitest doesn't timeout the test
vi.setConfig({ testTimeout: 60_000 });

function integrationTest(
  testName: string,
  testFilename: string,
  executeTest: (testFolder: string) => Promise<void>,
): void {
  const fixture = path.parse(testFilename).name.replace('.test', '');

  const testFolder = path.join(FIXTURES_DESTINATION_DIR, fixture);

  describe(fixture, () => {
    describe(testName, () => {
      it('should work successfully', async () => {
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

    let stderr = '';
    try {
      await execFile(
        'pnpm',
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
    let lintOutput: unknown;
    try {
      lintOutput = JSON.parse(lintOutputRAW);
    } catch {
      throw new Error(
        `Lint output could not be parsed as JSON: \`${lintOutputRAW}\`.`,
      );
    }
    expect(lintOutput).toMatchSnapshot();
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
      execFile('pnpm', ['tsc', '--noEmit', '--skipLibCheck', ...tscArgs], {
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
