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

const assert = require("chai").assert,
    parser = require("../../parser"),
    tester = require("./tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("parse()", () => {


    describe("basic functionality", () => {

        it("should parse an empty string", () => {
            assert.deepEqual(parser.parse("").body, []);
            assert.deepEqual(parser.parse("", {}).body, []);
        });

    });

    describe("modules", () => {

        it("should have correct column number when strict mode error occurs", () => {
            try {
                parser.parse("function fn(a, a) {\n}", { sourceType: "module" });
            } catch (err) {
                assert.equal(err.column, 16);
            }
        });

    });

    describe("general", () => {

        it("should output tokens, comments, locs, and ranges when called with those options", () => {
            const ast = parser.parse("let foo = bar;", {
                ecmaFeatures: {
                    blockBindings: true
                },
                comment: true,
                tokens: true,
                range: true,
                loc: true
            });

            assert.deepEqual(tester.getRaw(ast), require("../fixtures/parse/all-pieces.json"));
        });

    });


});
