/**
 * @fileoverview Disallows the use of require statements except in import statements.
 * @author Macklin Underdown
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-var-requires"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("no-var-requires", rule, {
    valid: ["import foo = require('foo')", "require('foo')"],
    invalid: [
        {
            code: "var foo = require('foo')",
            errors: [
                {
                    message: "Require statement not part of import statement",
                    line: 1,
                    column: 11
                }
            ]
        },
        {
            code: "const foo = require('foo')",
            errors: [
                {
                    message: "Require statement not part of import statement",
                    line: 1,
                    column: 13
                }
            ]
        },
        {
            code: "let foo = require('foo')",
            errors: [
                {
                    message: "Require statement not part of import statement",
                    line: 1,
                    column: 11
                }
            ]
        }
    ]
});
