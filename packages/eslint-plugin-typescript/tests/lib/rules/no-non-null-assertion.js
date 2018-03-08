/**
 * @fileoverview Disallows non-null assertions using the `!` postfix operator.
 * @author Macklin Underdown
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-non-null-assertion"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("no-non-null-assertion", rule, {
    valid: ["const x = { y: 1 }; x.y;"],
    invalid: [
        {
            code: "const x = null; x!.y;",
            errors: [
                { message: "Forbidden non-null assertion", line: 1, column: 17 }
            ]
        }
    ]
});
