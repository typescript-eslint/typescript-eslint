/**
 * @fileoverview Enforces that types will not to be used
 * @author Armano <https://github.com/armano2>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/ban-types"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser",
});

const options = [
    {
        types: {
            String: {
                message: "Use string instead.",
                fixWith: "string",
            },
            Object: "Use '{}' instead.",
            Array: null,
            F: null,
        },
    },
];

ruleTester.run("ban-types", rule, {
    valid: [
        "let f = Object();", // Should not fail if there is no options set
        {
            code: "let f = Object();",
            options,
        },
        {
            code: "let g = Object.create(null);",
            options,
        },
        {
            code: "let h = String(false);",
            options,
        },
        {
            code: "let e: foo.String;",
            options,
        },
    ],
    invalid: [
        {
            code: "let a: Object;",
            errors: [
                {
                    message: "Don't use 'Object' as a type. Use '{}' instead.",
                    line: 1,
                    column: 8,
                },
            ],
            options,
        },
        {
            code: "let b: {c: String};",
            output: "let b: {c: string};",
            errors: [
                {
                    message:
                        "Don't use 'String' as a type. Use string instead.",
                    line: 1,
                    column: 12,
                },
            ],
            options,
        },
        {
            code: "function foo(a: String) {}",
            output: "function foo(a: string) {}",
            errors: [
                {
                    message:
                        "Don't use 'String' as a type. Use string instead.",
                    line: 1,
                    column: 17,
                },
            ],
            options,
        },
        {
            code: "'a' as String;",
            output: "'a' as string;",
            errors: [
                {
                    message:
                        "Don't use 'String' as a type. Use string instead.",
                    line: 1,
                    column: 8,
                },
            ],
            options,
        },
        {
            code: "let c: F;",
            errors: [
                {
                    message: "Don't use 'F' as a type.",
                    line: 1,
                    column: 8,
                },
            ],
            options,
        },
        {
            code: `
            class Foo<F = String> extends Bar<String> implements Baz<Object> {
                constructor (foo: String | Object) {
                }

                exit () : Array<String> {
                    const foo: String = 1 as String
                }
            }
            `,
            output: `
            class Foo<F = string> extends Bar<string> implements Baz<Object> {
                constructor (foo: string | Object) {
                }

                exit () : Array<string> {
                    const foo: string = 1 as string
                }
            }
            `,
            errors: [
                {
                    message:
                        "Don't use 'String' as a type. Use string instead.",
                    line: 2,
                    column: 27,
                },
                {
                    message:
                        "Don't use 'String' as a type. Use string instead.",
                    line: 2,
                    column: 47,
                },
                {
                    message: "Don't use 'Object' as a type. Use '{}' instead.",
                    line: 2,
                    column: 70,
                },
                {
                    message:
                        "Don't use 'String' as a type. Use string instead.",
                    line: 3,
                    column: 35,
                },
                {
                    message: "Don't use 'Object' as a type. Use '{}' instead.",
                    line: 3,
                    column: 44,
                },
                {
                    message: "Don't use 'Array' as a type.",
                    line: 6,
                    column: 27,
                },
                {
                    message:
                        "Don't use 'String' as a type. Use string instead.",
                    line: 6,
                    column: 33,
                },
                {
                    message:
                        "Don't use 'String' as a type. Use string instead.",
                    line: 7,
                    column: 32,
                },
                {
                    message:
                        "Don't use 'String' as a type. Use string instead.",
                    line: 7,
                    column: 46,
                },
            ],
            options,
        },
    ],
});
