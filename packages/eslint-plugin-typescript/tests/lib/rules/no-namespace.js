/**
 * @fileoverview Disallows the use of custom TypeScript modules and namespaces.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-namespace"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("no-namespace", rule, {
    valid: [
        "declare module 'foo' { }",
        {
            code: "declare module foo { }",
            options: [{ allowDeclarations: true }]
        },
        {
            code: "declare namespace foo { }",
            options: [{ allowDeclarations: true }]
        }
    ],
    invalid: [
        {
            code: "module foo {}",
            errors: [
                {
                    message:
                        "ES2015 module syntax is preferred over custom TypeScript modules and namespaces",
                    row: 1,
                    column: 1
                }
            ]
        },
        {
            code: "namespace foo {}",
            errors: [
                {
                    message:
                        "ES2015 module syntax is preferred over custom TypeScript modules and namespaces",
                    row: 1,
                    column: 1
                }
            ]
        },
        {
            code: "module foo {}",
            options: [{ allowDeclarations: false }],
            errors: [
                {
                    message:
                        "ES2015 module syntax is preferred over custom TypeScript modules and namespaces",
                    row: 1,
                    column: 1
                }
            ]
        },
        {
            code: "namespace foo {}",
            options: [{ allowDeclarations: false }],
            errors: [
                {
                    message:
                        "ES2015 module syntax is preferred over custom TypeScript modules and namespaces",
                    row: 1,
                    column: 1
                }
            ]
        },
        {
            code: "declare module foo { }",
            errors: [
                {
                    message:
                        "ES2015 module syntax is preferred over custom TypeScript modules and namespaces",
                    row: 1,
                    column: 1
                }
            ]
        },
        {
            code: "declare namespace foo { }",
            errors: [
                {
                    message:
                        "ES2015 module syntax is preferred over custom TypeScript modules and namespaces",
                    row: 1,
                    column: 1
                }
            ]
        },
        {
            code: "declare module foo {}",
            options: [{ allowDeclarations: false }],
            errors: [
                {
                    message:
                        "ES2015 module syntax is preferred over custom TypeScript modules and namespaces",
                    row: 1,
                    column: 1
                }
            ]
        },
        {
            code: "declare namespace foo {}",
            options: [{ allowDeclarations: false }],
            errors: [
                {
                    message:
                        "ES2015 module syntax is preferred over custom TypeScript modules and namespaces",
                    row: 1,
                    column: 1
                }
            ]
        }
    ]
});
