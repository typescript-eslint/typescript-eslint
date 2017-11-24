/**
 * @fileoverview Enforces triple slash references are not used
 * @author Danny Fritz
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-triple-slash-reference"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("no-triple-slash-reference", rule, {
    valid: [
        "/// Non-reference triple-slash comment",
        "// <reference path='Animal' />"
    ],
    invalid: [
        {
            code: '/// <reference path="Animal" />',
            errors: [
                {
                    message: "Do not use a triple slash reference",
                    line: 1,
                    column: 1
                }
            ]
        },
        {
            code: `
/// <reference path="Animal" />
let a
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Do not use a triple slash reference",
                    line: 2,
                    column: 1
                }
            ]
        }
    ]
});
