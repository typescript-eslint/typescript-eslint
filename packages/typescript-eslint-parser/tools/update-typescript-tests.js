/**
 * @fileoverview A simple script to update existing tests to reflect new
 *      parser changes.
 * @author Nicholas C. Zakas

"use strict";

/*
 * Usage:
 *      node tools/update-typescript-tests.js
 *
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var shelljs = require("shelljs"),
    parser = require("../parser"),
    tester = require("../tests/lib/tester"),
    path = require("path");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Returns a raw copy of the given AST
 * @param  {object} ast the AST object
 * @returns {object}     copy of the AST object
 */
function getRaw(ast) {
    return JSON.parse(JSON.stringify(ast));
}


function getExpectedResult(code, config) {
    try {
        return tester.getRaw(parser.parse(code, config));
    } catch (ex) {
        var raw = getRaw(ex);
        raw.message = ex.message;
        return raw;
    }
}

function getTestFilenames(directory) {
    return shelljs.find(directory).filter(function(filename) {
        return filename.indexOf(".src.ts") > -1;
    }).map(function(filename) {
        return filename.substring(directory.length - 1, filename.length - 7);  // strip off ".src.ts"
    });
}

function outputResult(result, testResultFilename) {
    shelljs.echo("module.exports = " + JSON.stringify(result, null, "    ") + ";").to(testResultFilename);
}

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

var FIXTURES_DIR = "./tests/fixtures/typescript";

var testFiles = getTestFilenames(FIXTURES_DIR);


// update all tests in ecma-features
testFiles.forEach(function(filename) {

    var feature = path.dirname(filename),
        code = shelljs.cat(path.resolve(FIXTURES_DIR, filename) + ".src.ts"),
        config = {
            loc: true,
            range: true,
            tokens: true,
            ecmaFeatures: {},
            errorOnUnknownASTType: true
        };

    var testResultFilename = path.resolve(__dirname, "..", FIXTURES_DIR, filename) + ".result.js";
    var result = getExpectedResult(code, config);

    outputResult(result, testResultFilename);
});
