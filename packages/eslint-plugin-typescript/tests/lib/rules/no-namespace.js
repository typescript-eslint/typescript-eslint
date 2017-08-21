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

const ruleTester = new RuleTester();

ruleTester.run("no-namespace", rule, {
    valid: [
        {
            code: "declare module 'foo' { }",
            parser: "typescript-eslint-parser"
        },
        {
            code: "declare module foo { }",
            options: [{ allowDeclarations: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "declare namespace foo { }",
            options: [{ allowDeclarations: true }],
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: "module foo {}",
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
