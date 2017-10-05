/**
 * @fileoverview Enforces the use of the keyword `namespace` over `module` to declare custom TypeScript modules.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/prefer-namespace-keyword"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run("prefer-namespace-keyword", rule, {
    valid: [
        {
            code: "declare module 'foo' { }",
            parser: "typescript-eslint-parser"
        },
        {
            code: "namespace foo { }",
            parser: "typescript-eslint-parser"
        },
        {
            code: "declare namespace foo { }",
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: "module foo { }",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Use 'namespace' instead of 'module' to declare custom TypeScript modules",
                    output: "namespace foo { }",
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
                        "Use 'namespace' instead of 'module' to declare custom TypeScript modules",
                    output: "declare namespace foo { }",
                    row: 1,
                    column: 1
                }
            ]
        },
        {
            code: `
declare module foo {
    declare module bar { }
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Use 'namespace' instead of 'module' to declare custom TypeScript modules",
                    output: "declare namespace foo { }",
                    row: 2,
                    column: 1
                },
                {
                    message:
                        "Use 'namespace' instead of 'module' to declare custom TypeScript modules",
                    output: `
declare namespace foo {
    declare namespace bar { }
}
            `,
                    row: 3,
                    column: 5
                }
            ]
        }
    ]
});
