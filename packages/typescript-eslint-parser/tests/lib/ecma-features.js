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

const assert = require("chai").assert,
    leche = require("leche"),
    path = require("path"),
    parser = require("../../parser"),
    shelljs = require("shelljs"),
    tester = require("./tester");

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

const FIXTURES_DIR = "./tests/fixtures/ecma-features";

// var FIXTURES_MIX_DIR = "./tests/fixtures/ecma-features-mix";

const filesWithOutsandingTSIssues = [
    "jsx/embedded-tags", // https://github.com/Microsoft/TypeScript/issues/7410
    "jsx/namespaced-attribute-and-value-inserted", // https://github.com/Microsoft/TypeScript/issues/7411
    "jsx/namespaced-name-and-attribute", // https://github.com/Microsoft/TypeScript/issues/7411
    "jsx/multiple-blank-spaces"
];

const testFiles = shelljs.find(FIXTURES_DIR)
    .filter(filename => filename.indexOf(".src.js") > -1)
    .filter(filename => filesWithOutsandingTSIssues.every(fileName => filename.indexOf(fileName) === -1))
    // strip off ".src.js"
    .map(filename => filename.substring(FIXTURES_DIR.length - 1, filename.length - 7))
    .filter(filename => !(/error-|invalid-|globalReturn/.test(filename)));

// var moduleTestFiles = testFiles.filter(function(filename) {
//     return !/jsx|globalReturn|invalid|experimental|generators|not\-strict/.test(filename);
// });

// var mixFiles = shelljs.find(FIXTURES_MIX_DIR).filter(function(filename) {
//     return filename.indexOf(".src.js") > -1;
// }).map(function(filename) {
//     return filename.substring(FIXTURES_MIX_DIR.length - 1, filename.length - 7);  // strip off ".src.js"
// // }).filter(function(filename) {
// //     return /template/.test(filename);
// });

// console.dir(moduleTestFiles);
// return;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("ecmaFeatures", () => {

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

    leche.withData(testFiles, filename => {

        // Uncomment and fill in filename to focus on a single file
        // var filename = "jsx/invalid-matching-placeholder-in-closing-tag";
        const feature = path.dirname(filename),
            code = shelljs.cat(`${path.resolve(FIXTURES_DIR, filename)}.src.js`);

        it(`should parse correctly when ${feature} is true`, () => {
            config.ecmaFeatures[feature] = true;
            const expected = require(`${path.resolve(__dirname, "../../", FIXTURES_DIR, filename)}.result.js`);
            let result;

            try {
                result = parser.parse(code, config);
                result = tester.getRaw(result);
            } catch (ex) {

                // format of error isn't exactly the same, just check if it's expected
                if (expected.message) {
                    return;
                }
                throw ex;


            }
            assert.deepEqual(result, expected);
        });

    });

    // describe("Modules", function() {

    //     leche.withData(moduleTestFiles, function(filename) {

    //         var code = shelljs.cat(path.resolve(FIXTURES_DIR, filename) + ".src.js");

    //         it("should parse correctly when sourceType is module", function() {
    //             var expected = require(path.resolve(__dirname, "../../", FIXTURES_DIR, filename) + ".result.js");
    //             var result;

    //             config.sourceType = "module";

    //             // set sourceType of program node to module
    //             if (expected.type === "Program") {
    //                 expected.sourceType = "module";
    //             }

    //             try {
    //                 result = getRaw(parser.parse(code, config));
    //             } catch (ex) {

    //                 // if the result is an error, create an error object so deepEqual works
    //                 if (expected.message || expected.description) {
    //                     result = getRaw(ex);
    //                     result.message = ex.message;
    //                 } else {
    //                     throw ex;
    //                 }

    //             }

    //             assert.deepEqual(result, expected);
    //         });

    //     });
    // });



    // leche.withData(mixFiles, function(filename) {

    //     var features = path.dirname(filename),
    //         code = shelljs.cat(path.resolve(FIXTURES_MIX_DIR, filename) + ".src.js");

    //     it("should parse correctly when " + features + " are true", function() {
    //         config.ecmaFeatures = require(path.resolve(__dirname, "../../", FIXTURES_MIX_DIR, filename) + ".config.js");

    //         var expected = require(path.resolve(__dirname, "../../", FIXTURES_MIX_DIR, filename) + ".result.js");
    //         var result;

    //         try {
    //             result = parser.parse(code, config);
    //             result = getRaw(result);
    //         } catch (ex) {

    //             // if the result is an error, create an error object so deepEqual works
    //             if (expected.message || expected.description) {
    //                 result = getRaw(ex);
    //                 result.message = ex.message;
    //             } else {
    //                 throw ex;
    //             }
    //         }

    //         assert.deepEqual(result, expected);
    //     });

    // });


});
