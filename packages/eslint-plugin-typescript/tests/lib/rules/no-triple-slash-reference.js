/**
 * @fileoverview Enforces triple slash references are not used
 * @author Danny Fritz
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

let rule = require("../../../lib/rules/no-triple-slash-reference"),
    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

let ruleTester = new RuleTester();
ruleTester.run("no-triple-slash-reference", rule, {

    valid: [
        {
            code: "/// Non-reference triple-slash comment",
            parser: "typescript-eslint-parser"
        },
        {
            code: "// <reference path=\"Animal\" />",
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: "/// <reference path=\"Animal\" />",
            parser: "typescript-eslint-parser",
            errors: [{
                message: "Do not use a triple slash reference",
                line: 1,
                column: 1
            }]
        }
    ]
});
