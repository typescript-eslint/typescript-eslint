/**
 * @fileoverview Enforces spacing around type annotations
 * @author Nicholas C. Zakas
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/type-annotation-spacing"),
    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("type-annotation-spacing", rule, {

    valid: [
        {
            code: "var foo: string;",
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(): string {}",
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(a: string) {}",
            parser: "typescript-eslint-parser"
        }
    ],

    invalid: [
        {
            code: "var foo : string;",
            parser: "typescript-eslint-parser",
            output: "var foo: string;",
            errors: [{
                message: "Unexpected space before the colon.",
                line: 1,
                column: 11
            }]
        },
        {
            code: "var foo:string;",
            parser: "typescript-eslint-parser",
            output: "var foo: string;",
            errors: [{
                message: "Expected a space after the colon.",
                line: 1,
                column: 9
            }]
        },
        {
            code: "function foo():string {}",
            parser: "typescript-eslint-parser",
            output: "function foo(): string {}",
            errors: [{
                message: "Expected a space after the colon.",
                line: 1,
                column: 16
            }]
        },
        {
            code: "var foo = function():string {}",
            parser: "typescript-eslint-parser",
            output: "var foo = function(): string {}",
            errors: [{
                message: "Expected a space after the colon.",
                line: 1,
                column: 22
            }]
        },
        {
            code: "var foo = ():string => {}",
            parser: "typescript-eslint-parser",
            output: "var foo = (): string => {}",
            errors: [{
                message: "Expected a space after the colon.",
                line: 1,
                column: 14
            }]
        }
    ]
});
