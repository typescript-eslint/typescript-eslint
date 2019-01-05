/**
 * @fileoverview Tests for optional semantic diagnostics
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */
import path from 'path';
import shelljs from 'shelljs';
import * as parser from '../../src/parser';

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

/**
 * Process all fixtures, we will only snapshot the ones that have semantic errors
 * which are ignored by default parsing logic.
 */
const FIXTURES_DIR = './tests/fixtures/';

const testFiles = shelljs
  .find(FIXTURES_DIR)
  .filter(filename => filename.includes('.src.'))
  .map(filename => filename.substring(FIXTURES_DIR.length - 2));

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('Parse all fixtures with "errorOnTypeScriptSyntacticAndSemanticIssues" enabled', () => {
  testFiles.forEach(filename => {
    const code = shelljs.cat(`${path.resolve(FIXTURES_DIR, filename)}`);
    const config = {
      loc: true,
      range: true,
      tokens: true,
      errorOnUnknownASTType: true,
      errorOnTypeScriptSyntacticAndSemanticIssues: true
    };
    it(`fixtures/${filename}.src`, () => {
      expect.assertions(1);
      try {
        parser.parseAndGenerateServices(code, config);
        expect(
          'TEST OUTPUT: No semantic or syntactic issues found'
        ).toMatchSnapshot();
      } catch (err) {
        expect(err).toMatchSnapshot();
      }
    });
  });
});
