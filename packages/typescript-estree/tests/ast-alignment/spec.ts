import fs from 'fs';
import { fixturesToTest } from './fixtures-to-test';
import { parse } from './parse';
import * as parseUtils from './utils';

fixturesToTest.forEach(fixture => {
  const filename = fixture.filename;
  const source = fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n');

  /**
   * Parse with typescript-estree
   */
  const typeScriptESTreeResult = parse(source, {
    parser: '@typescript-eslint/typescript-estree',
    jsx: fixture.jsx,
  });

  /**
   * Parse the source with @babel/parser typescript-plugin
   */
  const babelParserResult = parse(source, {
    parser: '@babel/parser',
    jsx: fixture.jsx,
  });

  /**
   * If babel fails to parse the source, ensure that typescript-estree has the same fundamental issue
   */
  if (babelParserResult.parseError) {
    /**
     * FAIL: babel errored but typescript-estree did not
     */
    if (!typeScriptESTreeResult.parseError) {
      it(`TEST FAIL [BABEL ERRORED, BUT TS-ESTREE DID NOT] - ${filename}`, () => {
        expect(typeScriptESTreeResult.parseError).toEqual(
          babelParserResult.parseError,
        );
      });
      return;
    }
    /**
     * Both parsers errored - this is OK as long as the errors are of the same "type"
     * E.g. Both must be a SyntaxError, or both must be a RangeError etc.
     */
    it(`[Both parsers error as expected] - ${filename}`, () => {
      expect(babelParserResult.parseError.name).toEqual(
        typeScriptESTreeResult.parseError.name,
      );
    });
    return;
  }

  /**
   * FAIL: typescript-estree errored but babel did not
   */
  if (typeScriptESTreeResult.parseError) {
    it(`TEST FAIL [TS-ESTREE ERRORED, BUT BABEL DID NOT] - ${filename}`, () => {
      expect(babelParserResult.parseError).toEqual(
        typeScriptESTreeResult.parseError,
      );
    });
    return;
  }

  /**
   * No errors, assert the two ASTs match
   */
  it(`${filename}`, () => {
    expect(babelParserResult.ast).toBeTruthy();
    expect(typeScriptESTreeResult.ast).toBeTruthy();
    /**
     * Perform some extra formatting steps on the babel AST before comparing
     */
    expect(
      parseUtils.removeLocationDataAndSourceTypeFromProgramNode(
        parseUtils.preprocessBabylonAST(babelParserResult.ast),
        fixture.ignoreSourceType,
      ),
    ).toEqual(
      parseUtils.removeLocationDataAndSourceTypeFromProgramNode(
        parseUtils.preprocessTypescriptAST(typeScriptESTreeResult.ast),
        fixture.ignoreSourceType,
      ),
    );
  });
});
