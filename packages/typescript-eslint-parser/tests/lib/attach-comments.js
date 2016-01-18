/**
 * @fileoverview Tests for parsing and attaching comments.
 * @author Nicholas C. Zakas
 * @copyright 2014 Nicholas C. Zakas. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require("chai").assert,
    leche = require("leche"),
    path = require("path"),
    espree = require("../../espree"),
    shelljs = require("shelljs");

//------------------------------------------------------------------------------
// Setup
//------------------------------------------------------------------------------

var testFiles = shelljs.find("./tests/fixtures/attach-comments").filter(function(filename) {
    return filename.indexOf(".src.js") > -1;
}).map(function(filename) {
    return filename.substring(0, filename.length - 7);  // strip off ".src.js"
// }).filter(function(filename) {
//     return /line-and-block/.test(filename);
});

/**
 * Returns a raw copy of the given AST
 * @param  {object} ast the AST object
 * @returns {object}     copy of the AST object
 */
function getRaw(ast) {
    return JSON.parse(JSON.stringify(ast));
}

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("attachComment: true", function() {

    leche.withData(testFiles, function(filename) {
        it("should produce correct AST when parsed with attachComments", function() {
            var output = require(path.resolve(__dirname, "../../", filename + ".result.js"));
            var input = shelljs.cat(filename + ".src.js");
            var result;

            if (output.sourceType === "script") {
                result = espree.parse(input, {
                    loc: true,
                    range: true,
                    tokens: true,
                    attachComment: true
                });
            } else {
                result = espree.parse(input, {
                    loc: true,
                    range: true,
                    tokens: true,
                    attachComment: true,
                    ecmaFeatures: {
                        classes: true,
                        modules: true
                    }
                });
            }

            assert.deepEqual(getRaw(result), output);
        });

    });


});
