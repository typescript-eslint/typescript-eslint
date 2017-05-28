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

const parser = require("../../parser"),
    testUtils = require("../../tools/test-utils");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe("parse()", () => {


    describe("basic functionality", () => {

        it("should parse an empty string", () => {
            expect(parser.parse("").body).toEqual([]);
            expect(parser.parse("", {}).body).toEqual([]);
        });

    });

    describe("modules", () => {

        it("should have correct column number when strict mode error occurs", () => {
            try {
                parser.parse("function fn(a, a) {\n}", { sourceType: "module" });
            } catch (err) {
                expect(err.column).toEqual(16);
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

            expect(testUtils.getRaw(ast)).toEqual(require("../fixtures/parse/all-pieces.json"));
        });

    });


});
