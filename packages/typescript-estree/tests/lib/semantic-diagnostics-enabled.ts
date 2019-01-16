/**
 * @fileoverview Tests for optional semantic diagnostics
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import { readFileSync } from 'fs';
import glob from 'glob';
import * as parser from '../../src/parser';
import { extname } from 'path';
import { formatSnapshotName } from '../../tools/test-utils';

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

/**
 * Process all fixtures, we will only snapshot the ones that have semantic errors
 * which are ignored by default parsing logic.
 */
const FIXTURES_DIR =
  '../../node_modules/@typescript-eslint/shared-fixtures/fixtures';
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.*`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('Parse all fixtures with "errorOnTypeScriptSyntacticAndSemanticIssues" enabled', () => {
  testFiles.forEach(filename => {
    const code = readFileSync(filename, 'utf8');
    const fileExtension = extname(filename);
    const config = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true,
      errorOnTypeScriptSyntacticAndSemanticIssues: true
    };
    it(
      formatSnapshotName(filename, FIXTURES_DIR, fileExtension) +
        `${fileExtension}.src`,
      () => {
        expect.assertions(1);
        try {
          parser.parseAndGenerateServices(code, config);
          expect(
            'TEST OUTPUT: No semantic or syntactic issues found'
          ).toMatchSnapshot();
        } catch (err) {
          expect(err).toMatchSnapshot();
        }
      }
    );
  });
});
