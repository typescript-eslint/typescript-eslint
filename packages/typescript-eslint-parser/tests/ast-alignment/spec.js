"use strict";

const fs = require("fs");
const path = require("path");
const glob = require("glob");
const parse = require("./parse");
const parseUtils = require("./utils");

const fixturesDirPath = path.join(__dirname, "../fixtures");
const fixturePatternsToTest = [
    "basics/instanceof.src.js",
    "basics/update-expression.src.js",
    "basics/new-without-parens.src.js",
    "ecma-features/arrowFunctions/**/as*.src.js",
    "jsx/attributes.src.js"
];

const fixturesToTest = [];

fixturePatternsToTest.forEach(fixturePattern => {
    const matchingFixtures = glob.sync(`${fixturesDirPath}/${fixturePattern}`, {});
    matchingFixtures.forEach(filename => fixturesToTest.push(filename));
});

/**
 * - Babylon wraps the "Program" node in an extra "File" node, normalize this for simplicity for now...
 * - Remove "start" and "end" values from Babylon nodes to reduce unimportant noise in diffs ("loc" data will still be in
 * each final AST and compared).
 *
 * @param {Object} ast raw babylon AST
 * @returns {Object} processed babylon AST
 */
function preprocessBabylonAST(ast) {
    return parseUtils.omitDeep(ast.program, [
        {
            key: "start",
            predicate(val) {
                // only remove the "start" number (not the "start" object within loc)
                return typeof val === "number";
            }
        },
        {
            key: "end",
            predicate(val) {
                // only remove the "end" number (not the "end" object within loc)
                return typeof val === "number";
            }
        },
        {
            key: "identifierName",
            predicate() {
                return true;
            }
        },
        {
            key: "extra",
            predicate() {
                return true;
            }
        },
        {
            key: "directives",
            predicate() {
                return true;
            }
        },
        {
            key: "innerComments",
            predicate() {
                return true;
            }
        },
        {
            key: "leadingComments",
            predicate() {
                return true;
            }
        }
    ]);
}

fixturesToTest.forEach(filename => {

    const source = fs.readFileSync(filename, "utf8").replace(/\r\n/g, "\n");

    /**
     * Parse with typescript-eslint-parser
     */
    const typeScriptESLintParserAST = parse(source, {
        parser: "typescript-eslint-parser"
    });

    /**
     * Parse the source with babylon typescript-plugin, and perform some extra formatting steps
     */
    const babylonTypeScriptPluginAST = preprocessBabylonAST(parse(source, {
        parser: "babylon-plugin-typescript"
    }));

    /**
     * Assert the two ASTs match
     */
    test(`${filename}`, () => {
        expect(babylonTypeScriptPluginAST).toEqual(typeScriptESLintParserAST);
    });

});
