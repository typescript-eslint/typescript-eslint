/**
 * @fileoverview Enforces PascalCased class and interface names.
 * @author Jed Fox
 * @author Armano <https://github.com/armano2>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/class-name-casing"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser",
});

ruleTester.run("class-name-casing", rule, {
    valid: [
        "class ValidClassName {}",
        {
            code: "export default class {}",
            parserOptions: {
                sourceType: "module",
            },
        },
        "var Foo = class {};",
        "interface SomeInterface {}",
        "class ClassNameWithDigit2 {}",
        "abstract class ClassNameWithDigit2 {}",
        "var ba_zz = class Foo {};",
    ],

    invalid: [
        {
            code: "class invalidClassName {}",
            errors: [
                {
                    message: "Class 'invalidClassName' must be PascalCased.",
                    line: 1,
                    column: 7,
                },
            ],
        },
        {
            code: "class Another_Invalid_Class_Name {}",
            errors: [
                {
                    message:
                        "Class 'Another_Invalid_Class_Name' must be PascalCased.",
                    line: 1,
                    column: 7,
                },
            ],
        },
        {
            code: "var foo = class {};",
            errors: [
                {
                    message: "Class 'foo' must be PascalCased.",
                    line: 1,
                    column: 5,
                },
            ],
        },
        {
            code: "const foo = class {};",
            errors: [
                {
                    message: "Class 'foo' must be PascalCased.",
                    line: 1,
                    column: 7,
                },
            ],
        },
        {
            code: "var bar = class invalidName {}",
            errors: [
                {
                    message: "Class 'invalidName' must be PascalCased.",
                    line: 1,
                    column: 17,
                },
            ],
        },
        {
            code: "interface someInterface {}",
            errors: [
                {
                    message: "Interface 'someInterface' must be PascalCased.",
                    line: 1,
                    column: 11,
                },
            ],
        },
        {
            code: "abstract class invalidClassName {}",
            errors: [
                {
                    message:
                        "Abstract class 'invalidClassName' must be PascalCased.",
                    line: 1,
                    column: 16,
                },
            ],
        },
        {
            code: "declare class invalidClassName {}",
            errors: [
                {
                    message: "Class 'invalidClassName' must be PascalCased.",
                    line: 1,
                    column: 15,
                },
            ],
        },
    ],
});
