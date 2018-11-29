/**
 * @fileoverview Enforces the use of the keyword `namespace` over `module` to declare custom TypeScript modules.
 * @author Patricio Trevino
 * @author Armano <https://github.com/armano2>
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

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser",
});

ruleTester.run("prefer-namespace-keyword", rule, {
    valid: [
        "declare module 'foo'",
        "declare module 'foo' { }",
        "namespace foo { }",
        "declare namespace foo { }",
        "declare global { }",
    ],
    invalid: [
        {
            code: "module foo { }",
            output: "namespace foo { }",
            errors: [
                {
                    message:
                        "Use 'namespace' instead of 'module' to declare custom TypeScript modules",
                    row: 1,
                    column: 1,
                },
            ],
        },
        {
            code: "declare module foo { }",
            output: "declare namespace foo { }",
            errors: [
                {
                    message:
                        "Use 'namespace' instead of 'module' to declare custom TypeScript modules",
                    row: 1,
                    column: 1,
                },
            ],
        },
        {
            code: `
declare module foo {
    declare module bar { }
}
            `,
            output: `
declare namespace foo {
    declare namespace bar { }
}
            `,
            errors: [
                {
                    message:
                        "Use 'namespace' instead of 'module' to declare custom TypeScript modules",
                    row: 2,
                    column: 1,
                },
                {
                    message:
                        "Use 'namespace' instead of 'module' to declare custom TypeScript modules",
                    row: 3,
                    column: 5,
                },
            ],
        },
    ],
});
