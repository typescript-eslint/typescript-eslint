/**
 * @fileoverview Tests for tokenize().
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
    espree = require("../../espree");

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

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("tokenize()", function() {

    it("should produce tokens when using let", function() {
        var tokens = espree.tokenize("let foo = bar;", {
            ecmaFeatures: { blockBindings: true },
            loc: true,
            range: true
        });
        assert.deepEqual(getRaw(tokens), require("../fixtures/tokenize/let-result.tokens.js"));
    });

    it("should produce tokens when using const", function() {
        var tokens = espree.tokenize("const foo = bar;", {
            ecmaFeatures: { blockBindings: true },
            loc: true,
            range: true
        });
        assert.deepEqual(getRaw(tokens), require("../fixtures/tokenize/const-result.tokens.js"));
    });

    it("should produce tokens when using regular expression u flag", function() {
        var tokens = espree.tokenize("var foo = /foo/u;", {
            ecmaFeatures: { regexUFlag: true },
            loc: true,
            range: true
        });
        assert.deepEqual(getRaw(tokens), require("../fixtures/tokenize/regexp-u-result.tokens.js"));
    });

    it("should produce tokens when using regular expression y flag", function() {
        var tokens = espree.tokenize("var foo = /foo/y;", {
            ecmaFeatures: { regexYFlag: true },
            loc: true,
            range: true
        });
        assert.deepEqual(getRaw(tokens), require("../fixtures/tokenize/regexp-y-result.tokens.js"));
    });


    describe("templateStrings", function() {
        it("should produce tokens when tokenizing simple template string", function() {
            var tokens = espree.tokenize("var foo = `hi`;", {
                ecmaFeatures: { templateStrings: true },
                loc: true,
                range: true
            });
            assert.deepEqual(getRaw(tokens), require("../fixtures/tokenize/template-string-simple-result.tokens.js"));
        });

        it("should produce tokens when tokenizing template string with embedded variable", function() {
            var tokens = espree.tokenize("var foo = `hi${bar}`;", {
                ecmaFeatures: { templateStrings: true },
                loc: true,
                range: true
            });
            assert.deepEqual(getRaw(tokens), require("../fixtures/tokenize/template-string-embedded-result.tokens.js"));
        });

        it("should produce tokens when tokenizing template string with embedded variable in function call", function() {
            var tokens = espree.tokenize("var a; console.log(`${a}`, \"a\");", {
                ecmaFeatures: { templateStrings: true },
                loc: true,
                range: true
            });

            assert.deepEqual(getRaw(tokens), require("../fixtures/tokenize/template-string-embedded2-result.tokens.js"));
        });

        it("should produce tokens when parsing template string with embedded variable in function call and with tokens options on", function() {
            var ast = espree.parse("var a; console.log(`${a}`, \"a\");", {
                ecmaFeatures: { templateStrings: true },
                tokens: true,
                loc: true,
                range: true
            });

            assert.deepEqual(getRaw(ast.tokens), require("../fixtures/tokenize/template-string-embedded2-result.tokens.js"));
        });

        it("should produce tokens when tokenizing template string with embedded expressions", function() {
            var tokens = espree.tokenize("var foo = `Hello ${b}. a + 5 = ${a + 5}`;", {
                ecmaFeatures: { templateStrings: true },
                loc: true,
                range: true
            });
            assert.deepEqual(getRaw(tokens), require("../fixtures/tokenize/template-string-expressions-result.tokens.js"));
        });


    });

    // Make sure we don't introduce the same regex parsing error as Esprima
    it("should produce tokens when using regular expression wrapped in parens", function() {
        var tokens = espree.tokenize("(/foo/).test(bar);", {
            loc: true,
            range: true
        });
        assert.deepEqual(getRaw(tokens), require("../fixtures/tokenize/regex-in-parens-result.tokens.js"));
    });

    it("should produce tokens when using regular expression wrapped in parens using parse()", function() {
        var ast = espree.parse("(/foo/).test(bar);", {
            loc: true,
            range: true,
            tokens: true
        });
        assert.deepEqual(getRaw(ast.tokens), require("../fixtures/tokenize/regex-in-parens-result.tokens.js"));
    });

    it("should produce tokens when using a single identifier", function() {
        var tokens = espree.tokenize("a");
        assert.deepEqual(getRaw(tokens), [ { type: "Identifier", value: "a"}]);
    });

});
