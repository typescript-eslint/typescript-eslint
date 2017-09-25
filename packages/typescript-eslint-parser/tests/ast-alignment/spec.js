"use strict";

const fs = require("fs");

const parse = require("./parse");
const parseUtils = require("./utils");
const fixturesToTest = require("./fixtures-to-test");

fixturesToTest.forEach(fixture => {

    const filename = fixture.filename;
    const source = fs.readFileSync(filename, "utf8").replace(/\r\n/g, "\n");

    /**
     * Parse with typescript-eslint-parser
     */
    const typeScriptESLintParserResult = parse(source, {
        parser: "typescript-eslint-parser",
        typeScriptESLintParserOptions: (fixture.config && fixture.config.typeScriptESLintParserOptions) ? fixture.config.typeScriptESLintParserOptions : null
    });

    /**
     * Parse the source with babylon typescript-plugin
     */
    const babylonTypeScriptPluginResult = parse(source, {
        parser: "babylon-plugin-typescript",
        babylonParserOptions: (fixture.config && fixture.config.babylonParserOptions) ? fixture.config.babylonParserOptions : null
    });

    /**
     * If babylon fails to parse the source, ensure that typescript-eslint-parser has the same fundamental issue
     */
    if (babylonTypeScriptPluginResult.parseError) {
        /**
         * FAIL: babylon errored but typescript-eslint-parser did not
         */
        if (!typeScriptESLintParserResult.parseError) {
            test(`TEST FAIL [BABYLON ERRORED, BUT TSEP DID NOT] - ${filename}`, () => {
                expect(typeScriptESLintParserResult.parseError).toEqual(babylonTypeScriptPluginResult.parseError);
            });
            return;
        }
        /**
         * Both parsers errored - this is OK as long as the errors are of the same "type"
         */
        test(`[Both parsers error as expected] - ${filename}`, () => {
            expect(babylonTypeScriptPluginResult.parseError.name).toEqual(typeScriptESLintParserResult.parseError.name);
        });
        return;
    }

    /**
     * FAIL: typescript-eslint-parser errored but babylon did not
     */
    if (typeScriptESLintParserResult.parseError) {
        test(`TEST FAIL [TSEP ERRORED, BUT BABYLON DID NOT] - ${filename}`, () => {
            expect(babylonTypeScriptPluginResult.parseError).toEqual(typeScriptESLintParserResult.parseError);
        });
        return;
    }

    /**
     * No errors, assert the two ASTs match
     */
    test(`${filename}`, () => {
        expect(babylonTypeScriptPluginResult.ast).toBeTruthy();
        expect(typeScriptESLintParserResult.ast).toBeTruthy();
        /**
         * Perform some extra formatting steps on the babylon AST before comparing
         */
        expect(
            parseUtils.removeLocationDataFromProgramNode(
                parseUtils.preprocessBabylonAST(babylonTypeScriptPluginResult.ast)
            )
        ).toEqual(
            parseUtils.removeLocationDataFromProgramNode(typeScriptESLintParserResult.ast)
        );
    });

});
