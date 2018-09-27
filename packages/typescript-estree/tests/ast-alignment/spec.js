'use strict';

const fs = require('fs');

const parse = require('./parse');
const parseUtils = require('./utils');
const fixturesToTest = require('./fixtures-to-test');

fixturesToTest.forEach(fixture => {
  const filename = fixture.filename;
  const source = fs.readFileSync(filename, 'utf8').replace(/\r\n/g, '\n');

  /**
   * Parse with typescript-estree
   */
  const typeScriptESTreeResult = parse(source, {
    parser: 'typescript-estree',
    typeScriptESTreeOptions:
      fixture.config && fixture.config.typeScriptESTreeOptions
        ? fixture.config.typeScriptESTreeOptions
        : null
  });

  /**
   * Parse the source with babylon typescript-plugin
   */
  const babylonTypeScriptPluginResult = parse(source, {
    parser: 'babylon-plugin-typescript',
    babylonParserOptions:
      fixture.config && fixture.config.babylonParserOptions
        ? fixture.config.babylonParserOptions
        : null
  });

  /**
   * If babylon fails to parse the source, ensure that typescript-estree has the same fundamental issue
   */
  if (babylonTypeScriptPluginResult.parseError) {
    /**
     * FAIL: babylon errored but typescript-estree did not
     */
    if (!typeScriptESTreeResult.parseError) {
      test(`TEST FAIL [BABYLON ERRORED, BUT TSEP DID NOT] - ${filename}`, () => {
        expect(typeScriptESTreeResult.parseError).toEqual(
          babylonTypeScriptPluginResult.parseError
        );
      });
      return;
    }
    /**
     * Both parsers errored - this is OK as long as the errors are of the same "type"
     */
    test(`[Both parsers error as expected] - ${filename}`, () => {
      expect(babylonTypeScriptPluginResult.parseError.name).toEqual(
        typeScriptESTreeResult.parseError.name
      );
    });
    return;
  }

  /**
   * FAIL: typescript-estree errored but babylon did not
   */
  if (typeScriptESTreeResult.parseError) {
    test(`TEST FAIL [TSEP ERRORED, BUT BABYLON DID NOT] - ${filename}`, () => {
      expect(babylonTypeScriptPluginResult.parseError).toEqual(
        typeScriptESTreeResult.parseError
      );
    });
    return;
  }

  /**
   * No errors, assert the two ASTs match
   */
  test(`${filename}`, () => {
    expect(babylonTypeScriptPluginResult.ast).toBeTruthy();
    expect(typeScriptESTreeResult.ast).toBeTruthy();
    /**
     * Perform some extra formatting steps on the babylon AST before comparing
     */
    expect(
      parseUtils.removeLocationDataFromProgramNode(
        parseUtils.preprocessBabylonAST(babylonTypeScriptPluginResult.ast)
      )
    ).toEqual(
      parseUtils.removeLocationDataFromProgramNode(typeScriptESTreeResult.ast)
    );
  });
});
