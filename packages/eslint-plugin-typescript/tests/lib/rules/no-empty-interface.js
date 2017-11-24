/**
 * @fileoverview Disallows the declaration of empty interfaces.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-empty-interface"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("no-empty-interface", rule, {
    valid: [
        `
interface Foo {
    name: string;
}
        `,
        `
interface Foo {
    name: string;
}

interface Bar {
    age: number;
}

// valid because extending multiple interfaces can be used instead of a union type
interface Baz extends Foo, Bar {}
        `
    ],
    invalid: [
        {
            code: "interface Foo {}",
            errors: [
                {
                    message: "An empty interface is equivalent to `{}`",
                    line: 1,
                    column: 11
                }
            ]
        },
        {
            code: "interface Foo extends {}",
            errors: [
                {
                    message: "An empty interface is equivalent to `{}`",
                    line: 1,
                    column: 11
                }
            ]
        },
        {
            code: `
interface Foo {
    name: string;
}

interface Bar extends Foo {}
            `,
            errors: [
                {
                    message:
                        "An interface declaring no members is equivalent to its supertype.",
                    line: 6,
                    column: 11
                }
            ]
        }
    ]
});
