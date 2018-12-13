/**
 * @fileoverview Forbids an object literal to appear in a type assertion expression
 * @author Armano <https://github.com/armano2>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-object-literal-type-assertion"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser",
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {
            jsx: false,
        },
    },
});

ruleTester.run("no-object-literal-type-assertion", rule, {
    valid: [
        {
            code: `<T> x;`,
        },
        {
            code: `x as T;`,
        },
        {
            code: `const foo = bar;`,
        },
        {
            code: `const foo: baz = bar;`,
        },
        {
            code: `const x: T = {};`,
        },
        {
            code: `const foo = { bar: { } };`,
        },
        // Allow cast to 'any'
        {
            code: `const foo = {} as any;`,
        },
        {
            code: `const foo = <any> {};`,
        },
        // Allow cast to 'unknown'
        {
            code: `const foo = {} as unknown;`,
        },
        {
            code: `const foo = <unknown> {};`,
        },
    ],
    invalid: [
        {
            code: `<T> ({});`,
            errors: [
                {
                    messageId: "unexpectedTypeAssertion",
                    line: 1,
                    column: 1,
                },
            ],
        },
        {
            code: `({}) as T;`,
            errors: [
                {
                    messageId: "unexpectedTypeAssertion",
                    line: 1,
                    column: 1,
                },
            ],
        },
        {
            code: `const x = {} as T;`,
            errors: [
                {
                    messageId: "unexpectedTypeAssertion",
                    line: 1,
                    column: 11,
                },
            ],
        },
    ],
});
