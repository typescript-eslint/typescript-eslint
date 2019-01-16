/**
 * @fileoverview Tests for TypeScript-specific constructs
 * @author Benjamin Lichtman
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const path = require("path"),
  fs = require("fs"),
  glob = require('glob'),
  testUtils = require("../../tools/test-utils");

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR = "./tests/fixtures/services";
const testFiles = glob.sync(`${FIXTURES_DIR}/**/*.src.ts`);

/**
* @param {string} filename Full path to file being tested
* @returns {Object} Config object
*/
function createConfig(filename) {
  return {
    filePath: filename,
    generateServices: true,
    project: "./tsconfig.json",
    tsconfigRootDir: path.resolve(FIXTURES_DIR)
  };
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("services", () => {
  testFiles.forEach(filename => {
    const code = fs.readFileSync(filename, 'utf8');
    const config = createConfig(filename);
    test(testUtils.formatSnapshotName(filename, FIXTURES_DIR, '.ts'), testUtils.createSnapshotTestBlock(code, config));
    test(`${testUtils.formatSnapshotName(filename, FIXTURES_DIR, '.ts')} services`, () => {
        testUtils.testServices(code, config);
    });
  });

});
