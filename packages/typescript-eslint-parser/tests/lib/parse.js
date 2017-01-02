/**
 * @fileoverview Tests for tokenize().
 * @author Nicholas C. Zakas
 * @copyright jQuery Foundation and other contributors, https://jquery.org/
 * MIT License
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require("chai").assert,
    parser = require("../../parser");

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

describe("parse()", function() {


    describe("basic functionality", function() {

        it("should parse an empty string", function() {
            assert.deepEqual(parser.parse("").body, []);
            assert.deepEqual(parser.parse("", {}).body, []);
        });

    });

    describe("modules", function() {

        it("should have correct column number when strict mode error occurs", function() {
            try {
                parser.parse("function fn(a, a) {\n}", { sourceType: "module" });
            } catch (err) {
                assert.equal(err.column, 16);
            }
        });

    });

    describe("general", function() {

        it("should output tokens, comments, locs, and ranges when called with those options", function() {
            var ast = parser.parse("let foo = bar;", {
                ecmaFeatures: {
                    blockBindings: true
                },
                comment: true,
                tokens: true,
                range: true,
                loc: true
            });

            assert.deepEqual(getRaw(ast), require("../fixtures/parse/all-pieces.json"));
        });

    });


});
