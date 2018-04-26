/**
 * @fileoverview Disallows explicit type declarations for inferrable types
 * @author James Garbutt <https://github.com/43081j>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-inferrable-types");
const RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("no-inferrable-types", rule, {
    valid: [
        "const a = 5",
        "const a = true",
        "const a = 'foo'",

        "const fn = (a = 5, b = true, c = 'foo') => {}",
        "const fn = function(a = 5, b = true, c = 'foo') {}",
        "function fn(a = 5, b = true, c = 'foo') {}",
        "function fn(a: number, b: boolean, c: string) {}",

        "class Foo { a = 5; b = true; c = 'foo'; }",
        "class Foo { readonly a: number = 5; }",

        "const a: any = 5",
        "const fn = function(a: any = 5, b: any = true, c: any = 'foo') {}",

        {
            code:
                "const fn = (a: number = 5, b: boolean = true, c: string = 'foo') => {}",
            options: [{ ignoreParameters: true }]
        },
        {
            code:
                "function fn(a: number = 5, b: boolean = true, c: string = 'foo') {}",
            options: [{ ignoreParameters: true }]
        },
        {
            code:
                "const fn = function(a: number = 5, b: boolean = true, c: string = 'foo') {}",
            options: [{ ignoreParameters: true }]
        },
        {
            code:
                "class Foo { a: number = 5; b: boolean = true; c: string = 'foo'; }",
            options: [{ ignoreProperties: true }]
        }
    ],

    invalid: [
        {
            code: "const a: number = 5",
            output: "const a = 5",
            errors: [
                {
                    message:
                        "Type number trivially inferred from a number literal, remove type annotation",
                    line: 1,
                    column: 7
                }
            ]
        },
        {
            code: "const a: number = Infinity",
            output: "const a = Infinity",
            errors: [
                {
                    message:
                        "Type number trivially inferred from a number literal, remove type annotation",
                    line: 1,
                    column: 7
                }
            ]
        },
        {
            code: "const a: boolean = true",
            output: "const a = true",
            errors: [
                {
                    message:
                        "Type boolean trivially inferred from a boolean literal, remove type annotation",
                    line: 1,
                    column: 7
                }
            ]
        },
        {
            code: "const a: string = 'foo'",
            output: "const a = 'foo'",
            errors: [
                {
                    message:
                        "Type string trivially inferred from a string literal, remove type annotation",
                    line: 1,
                    column: 7
                }
            ]
        },
        {
            code:
                "const fn = (a: number = 5, b: boolean = true, c: string = 'foo') => {}",
            output: "const fn = (a = 5, b = true, c = 'foo') => {}",
            errors: [
                {
                    message:
                        "Type number trivially inferred from a number literal, remove type annotation",
                    line: 1,
                    column: 13
                },
                {
                    message:
                        "Type boolean trivially inferred from a boolean literal, remove type annotation",
                    line: 1,
                    column: 28
                },
                {
                    message:
                        "Type string trivially inferred from a string literal, remove type annotation",
                    line: 1,
                    column: 47
                }
            ]
        },
        {
            code:
                "class Foo { a: number = 5; b: boolean = true; c: string = 'foo'; }",
            output: "class Foo { a = 5; b = true; c = 'foo'; }",
            errors: [
                {
                    message:
                        "Type number trivially inferred from a number literal, remove type annotation",
                    line: 1,
                    column: 13
                },
                {
                    message:
                        "Type boolean trivially inferred from a boolean literal, remove type annotation",
                    line: 1,
                    column: 28
                },
                {
                    message:
                        "Type string trivially inferred from a string literal, remove type annotation",
                    line: 1,
                    column: 47
                }
            ]
        }
    ]
});
