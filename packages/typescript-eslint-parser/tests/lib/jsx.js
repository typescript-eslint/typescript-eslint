/**
 * @fileoverview Tests for JSX
 * @author Nicholas C. Zakas
 * @author James Henry <https://github.com/JamesHenry>
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const fs = require("fs"),
    glob = require('glob'),
    testUtils = require("../../tools/test-utils"),
    filesWithKnownIssues = require("../jsx-known-issues");

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const JSX_FIXTURES_DIR = "../../node_modules/@typescript-eslint/shared-fixtures/fixtures/jsx";
const jsxTestFiles = glob.sync(`${JSX_FIXTURES_DIR}/**/*.src.js`)
    .filter(filename => filesWithKnownIssues.every(fileName => !filename.includes(fileName)));

const JSX_JSXTEXT_FIXTURES_DIR = "../../node_modules/@typescript-eslint/shared-fixtures/fixtures/jsx-useJSXTextNode";
const jsxTextTestFiles = glob.sync(`${JSX_JSXTEXT_FIXTURES_DIR}/**/*.src.js`)

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("JSX", () => {

    /**
     * Test each fixture file
     * @param {string} fixturesDir Fixtures Directory
     * @param {boolean} useJSXTextNode Use JSX Text Node
     * @returns {void}
     */
    function testFixture(fixturesDir, useJSXTextNode) {

        return filename => {
            const code = fs.readFileSync(filename, 'utf8');
            const config = {
                useJSXTextNode,
                jsx: true
            };
            test(testUtils.formatSnapshotName(filename, fixturesDir), testUtils.createSnapshotTestBlock(code, config));
        };
    }

    describe("useJSXTextNode: false", () => {
        jsxTestFiles.forEach(testFixture(JSX_FIXTURES_DIR, false));
    });
    describe("useJSXTextNode: true", () => {
        jsxTextTestFiles.forEach(testFixture(JSX_JSXTEXT_FIXTURES_DIR, true));
    });
});
