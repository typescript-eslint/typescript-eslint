/**
 * @fileoverview Tests for basic expressions
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require("chai").assert,
    leche = require("leche"),
    path = require("path"),
    parser = require("../../parser"),
    shelljs = require("shelljs"),
    tester = require("./tester");

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

var FIXTURES_DIR = "./tests/fixtures/basics";

var testFiles = shelljs.find(FIXTURES_DIR).filter(function(filename) {
    return filename.indexOf(".src.js") > -1;
}).map(function(filename) {
    return filename.substring(FIXTURES_DIR.length - 1, filename.length - 7);  // strip off ".src.js"
});

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("basics", function() {

    var config;

    beforeEach(function() {
        config = {
            loc: true,
            range: true,
            tokens: true,
            ecmaFeatures: {}
        };
    });

    leche.withData(testFiles, function(filename) {
        // Uncomment and fill in filename to focus on a single file
        // var filename = "jsx/invalid-matching-placeholder-in-closing-tag";
        var code = shelljs.cat(path.resolve(FIXTURES_DIR, filename) + ".src.js");

        it("should parse correctly", function() {
            var expected = require(path.resolve(__dirname, "../../", FIXTURES_DIR, filename) + ".result.js");
            var result;

            try {
                result = parser.parse(code, config);
                result = tester.getRaw(result);
            } catch (ex) {

                // format of error isn't exactly the same, just check if it's expected
                if (expected.message) {
                    return;
                } else {
                    throw ex;
                }

            }
            // console.log(JSON.stringify(result, null, 4));
            assert.deepEqual(result, expected);

        });

    });


});
