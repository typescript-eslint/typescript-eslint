/**
 * @fileoverview Tests for ECMA feature flags
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const path = require("path"),
    shelljs = require("shelljs"),
    testUtils = require("../../tools/test-utils");

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR = "./tests/fixtures/ecma-features";

const testFiles = shelljs.find(FIXTURES_DIR)
    .filter(filename => filename.indexOf(".src.js") > -1)
    // strip off ".src.js"
    .map(filename => filename.substring(FIXTURES_DIR.length - 1, filename.length - 7));

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("ecmaFeatures", () => {

    testFiles.forEach(filename => {

        // Uncomment and fill in filename to focus on a single file
        // var filename = "jsx/invalid-matching-placeholder-in-closing-tag";
        const feature = path.dirname(filename),
            code = shelljs.cat(`${path.resolve(FIXTURES_DIR, filename)}.src.js`),
            config = {
                loc: true,
                range: true,
                tokens: true,
                ecmaFeatures: {},
                errorOnUnknownASTType: true
            };

        test(`fixtures/${filename}.src`, () => {
            config.ecmaFeatures[feature] = true;
            testUtils.createSnapshotTestBlock(code, config)();
        });
    });
});
