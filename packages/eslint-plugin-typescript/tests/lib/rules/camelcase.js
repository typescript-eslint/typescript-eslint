/**
 * @fileoverview Tests for camelcase rule
 * @author Guy Lilian
 * @author Shahar Or
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const ruleCamelcase = require("../../../lib/rules/camelcase");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser",
});

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

ruleTester.run("camelcase", ruleCamelcase, {
    valid: [
        {
            code: "interface Foo { b_ar: number }",
            options: [{ properties: "never" }],
        },
        {
            code: "interface Foo { bar: number }",
            options: [{ properties: "always" }],
        },
        {
            code: "class Foo { b_ar: number; }",
            options: [{ properties: "never" }],
        },
        {
            code: "class Foo { bar: number; }",
            options: [{ properties: "always" }],
        },
        {
            code: "class Foo { b_ar: number = 0; }",
            options: [{ properties: "never" }],
        },
        {
            code: "class Foo { bar: number = 0; }",
            options: [{ properties: "always" }],
        },
        {
            code: "class Foo { constructor(private b_ar: number) {} }",
            options: [{ properties: "never" }],
        },
        {
            code: "class Foo { constructor(private bar: number) {} }",
            options: [{ properties: "always" }],
        },
        {
            code: "class Foo { constructor(private b_ar: number = 0) {} }",
            options: [{ properties: "never" }],
        },
        {
            code: "class Foo { constructor(private bar: number = 0) {} }",
            options: [{ properties: "always" }],
        },
        {
            code: "abstract class Foo { b_ar: number; }",
            options: [{ properties: "never" }],
        },
        {
            code: "abstract class Foo { bar: number; }",
            options: [{ properties: "always" }],
        },
        {
            code: "abstract class Foo { b_ar: number = 0; }",
            options: [{ properties: "never" }],
        },
        {
            code: "abstract class Foo { bar: number = 0; }",
            options: [{ properties: "always" }],
        },
        {
            code: "abstract class Foo { abstract b_ar: number; }",
            options: [{ properties: "never" }],
        },
        {
            code: "abstract class Foo { abstract bar: number; }",
            options: [{ properties: "always" }],
        },
        {
            code: "abstract class Foo { abstract b_ar: number = 0; }",
            options: [{ properties: "never" }],
        },
        {
            code: "abstract class Foo { abstract bar: number = 0; }",
            options: [{ properties: "always" }],
        },
    ],

    invalid: [
        {
            code: "interface Foo { b_ar: number }",
            options: [{ properties: "always" }],
            errors: [
                {
                    message: "Identifier 'b_ar' is not in camel case.",
                    line: 1,
                    column: 17,
                },
            ],
        },
        {
            code: "class Foo { b_ar: number; }",
            options: [{ properties: "always" }],
            errors: [
                {
                    message: "Identifier 'b_ar' is not in camel case.",
                    line: 1,
                    column: 13,
                },
            ],
        },
        {
            code: "class Foo { constructor(private b_ar: number) {} }",
            options: [{ properties: "always" }],
            errors: [
                {
                    message: "Identifier 'b_ar' is not in camel case.",
                    line: 1,
                    column: 33,
                },
            ],
        },
        {
            code: "class Foo { constructor(private b_ar: number = 0) {} }",
            options: [{ properties: "always" }],
            errors: [
                {
                    message: "Identifier 'b_ar' is not in camel case.",
                    line: 1,
                    column: 33,
                },
            ],
        },
        {
            code: "abstract class Foo { b_ar: number; }",
            options: [{ properties: "always" }],
            errors: [
                {
                    message: "Identifier 'b_ar' is not in camel case.",
                    line: 1,
                    column: 22,
                },
            ],
        },
        {
            code: "abstract class Foo { b_ar: number = 0; }",
            options: [{ properties: "always" }],
            errors: [
                {
                    message: "Identifier 'b_ar' is not in camel case.",
                    line: 1,
                    column: 22,
                },
            ],
        },
        {
            code: "abstract class Foo { abstract b_ar: number; }",
            options: [{ properties: "always" }],
            errors: [
                {
                    message: "Identifier 'b_ar' is not in camel case.",
                    line: 1,
                    column: 31,
                },
            ],
        },
        {
            code: "abstract class Foo { abstract b_ar: number = 0; }",
            options: [{ properties: "always" }],
            errors: [
                {
                    message: "Identifier 'b_ar' is not in camel case.",
                    line: 1,
                    column: 31,
                },
            ],
        },
    ],
});
