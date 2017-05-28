/**
 * @fileoverview A simple script to update existing tests to reflect new
 * parser changes.
 * @author Nicholas C. Zakas
 */
"use strict";


//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const shelljs = require("shelljs"),
    parser = require("../parser"),
    tester = require("../tests/lib/tester"),
    path = require("path");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Returns a raw copy of the given AST
 * @param  {Object} ast the AST object
 * @returns {Object}     copy of the AST object
 */
function getRaw(ast) {
    return JSON.parse(JSON.stringify(ast));
}

/**
 * Returns the expected AST
 * @param  {string} code the source code
 * @param {Object} config the parser config
 * @returns {Object}     the expected AST object
 */
function getExpectedResult(code, config) {
    try {
        return tester.getRaw(parser.parse(code, config));
    } catch (ex) {
        const raw = getRaw(ex);
        raw.message = ex.message;
        return raw;
    }
}

/**
 * Returns an array of relevant filenames within the directory
 * @param {string} directory path of the directory to scan
 * @returns {string[]} list of relevant filenames
 */
function getTestFilenames(directory) {
    return shelljs.find(directory).filter(filename => filename.indexOf(".src.ts") > -1).map(filename => filename.substring(directory.length - 1, filename.length - 7)  // strip off ".src.ts"
    );
}

/**
 * Writes the given AST to the given filename
 * @param {*} result the AST to write to a file
 * @param {*} testResultFilename name of the file to write to
 * @returns {void}
 */
function outputResult(result, testResultFilename) {
    shelljs.echo(`module.exports = ${JSON.stringify(result, null, "    ")};`).to(testResultFilename);
}

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR = "./tests/fixtures/typescript";
const testFiles = getTestFilenames(FIXTURES_DIR);
const assert = require("chai").assert;

testFiles.forEach(filename => {

    const code = shelljs.cat(`${path.resolve(FIXTURES_DIR, filename)}.src.ts`),
        config = {
            loc: true,
            range: true,
            tokens: true,
            ecmaFeatures: {},
            errorOnUnknownASTType: true
        };

    const testResultFilename = `${path.resolve(__dirname, "..", FIXTURES_DIR, filename)}.result.js`;
    const result = getExpectedResult(code, config);

    const expected = require(testResultFilename);

    try {
        assert.deepEqual(result, expected);
    } catch (e) {
        shelljs.echo("DIFFERENT", e);
        outputResult(result, testResultFilename);
    }

});
