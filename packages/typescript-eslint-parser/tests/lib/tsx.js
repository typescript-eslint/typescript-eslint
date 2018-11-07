/**
 * @fileoverview Tests for TSX-specific constructs
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

const TSX_FIXTURES_DIR = "./tests/fixtures/tsx";

const testFiles = shelljs.find(TSX_FIXTURES_DIR)
    .filter(filename => filename.indexOf(".src.tsx") > -1)
    // strip off ".src.tsx"
    .map(filename => filename.substring(TSX_FIXTURES_DIR.length - 1, filename.length - 8));

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("TSX", () => {
    testFiles.forEach(filename => {
        const code = shelljs.cat(`${path.resolve(TSX_FIXTURES_DIR, filename)}.src.tsx`);
        const config = {
            useJSXTextNode: true,
            jsx: true
        };
        test(`fixtures/${filename}.src`, testUtils.createSnapshotTestBlock(code, config));
    });
});
