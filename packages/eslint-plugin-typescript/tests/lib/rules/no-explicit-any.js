/**
 * @fileoverview Enforces the any type is not used
 * @author Danny Fritz
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

let rule = require("../../../lib/rules/no-explicit-any"),
    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

let ruleTester = new RuleTester();
ruleTester.run("no-explicit-any", rule, {

    valid: [
        {
            code: "const number : number = 1",
            parser: "typescript-eslint-parser"
        },
        {
            code: "function greet () : string {}",
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: "const number : any = 1",
            parser: "typescript-eslint-parser",
            errors: [{
                message: "Unexpected any. Specify a different type.",
                line: 1,
                column: 16
            }]
        },
        {
            code: "function generic () : any {}",
            parser: "typescript-eslint-parser",
            errors: [{
                message: "Unexpected any. Specify a different type.",
                line: 1,
                column: 23
            }]
        }
    ]
});
