/**
 * @fileoverview Tests for ECMA feature flags
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const path = require("path"),
    parser = require("../../parser"),
    shelljs = require("shelljs"),
    testUtils = require("../../tools/test-utils");

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR = "./tests/fixtures/typescript";

const testFiles = shelljs.find(FIXTURES_DIR)
    .filter(filename => filename.indexOf(".src.ts") > -1)
     // strip off ".src.ts"
    .map(filename => filename.substring(FIXTURES_DIR.length - 1, filename.length - 7));

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("typescript", () => {

    let config;

    beforeEach(() => {
        config = {
            loc: true,
            range: true,
            tokens: true,
            ecmaFeatures: {},
            errorOnUnknownASTType: true
        };
    });

    testFiles.forEach(filename => {

        // Uncomment and fill in filename to focus on a single file
        // var filename = "jsx/invalid-matching-placeholder-in-closing-tag";
        const code = shelljs.cat(`${path.resolve(FIXTURES_DIR, filename)}.src.ts`);

        it("should parse correctly", () => {
            const expected = require(`${path.resolve(__dirname, "../../", FIXTURES_DIR, filename)}.result.js`);
            let result;

            try {
                result = parser.parse(code, config);
                result = testUtils.getRaw(result);
            } catch (ex) {

                // format of error isn't exactly the same, just check if it's expected
                if (expected.message) {
                    return;
                }
                throw ex;


            }

            // console.log(JSON.stringify(result, null, 4));
            expect(result).toEqual(expected);

        });

    });


});
