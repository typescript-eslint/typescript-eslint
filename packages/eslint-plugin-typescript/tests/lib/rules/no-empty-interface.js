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

const ruleTester = new RuleTester();

ruleTester.run("no-empty-interface", rule, {
    valid: [
        {
            code: `
interface Foo {
    name: string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string;
}

interface Bar {
    age: number;
}

// valid because extending multiple interfaces can be used instead of a union type
interface Baz extends Foo, Bar {}
            `,
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: "interface Foo {}",
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
