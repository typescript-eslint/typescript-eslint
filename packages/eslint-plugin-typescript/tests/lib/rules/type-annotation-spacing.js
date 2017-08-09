/**
 * @fileoverview Enforces spacing around type annotations
 * @author Nicholas C. Zakas
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/type-annotation-spacing"),
    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run("type-annotation-spacing", rule, {

    valid: [
        {
            code: "let foo: string;",
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
            code: "let foo : string;",
            parser: "typescript-eslint-parser",
            output: "let foo: string;",
            errors: [{
                message: "Unexpected space before the colon.",
                line: 1,
                column: 11
            }]
        },
        {
            code: "let foo:string;",
            parser: "typescript-eslint-parser",
            output: "let foo: string;",
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
            code: "let foo = function():string {}",
            parser: "typescript-eslint-parser",
            output: "let foo = function(): string {}",
            errors: [{
                message: "Expected a space after the colon.",
                line: 1,
                column: 22
            }]
        },
        {
            code: "let foo = ():string => {}",
            parser: "typescript-eslint-parser",
            output: "let foo = (): string => {}",
            errors: [{
                message: "Expected a space after the colon.",
                line: 1,
                column: 14
            }]
        }
    ]
});
