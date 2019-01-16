/**
 * @fileoverview Tests for parsing and attaching comments.
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
  testUtils = require("../../tools/test-utils");

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR = "../../node_modules/@typescript-eslint/shared-fixtures/fixtures/comments";
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.js`);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("Comments", () => {
  testFiles.forEach(filename => {
    const code = fs.readFileSync(filename, 'utf8');
    const config = {
      jsx: true,
      sourceType: "module"
    };
    test(testUtils.formatSnapshotName(filename, FIXTURES_DIR), testUtils.createSnapshotTestBlock(code, config));
  });
});
