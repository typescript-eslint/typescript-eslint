/**
 * @fileoverview Enforces explicit return type for functions
 * @author Scott O'Hara
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/explicit-function-return-type"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("explicit-function-return-type", rule, {
    valid: [
        {
            filename: "test.ts",
            code: `
function test(): void {
    return;
}
            `
        },
        {
            filename: "test.ts",
            code: `
var fn = function(): number {
    return 1;
};
            `
        },
        {
            filename: "test.ts",
            code: `
var arrowFn = (): string => 'test';
            `
        },
        {
            filename: "test.ts",
            code: `
class Test {
  constructor() {}
  get prop(): number {
    return 1;
  }
  set prop() {}
  method(): void {
    return;
  }
}
            `
        },
        {
            filename: "test.js",
            code: `
function test() {
    return;
}
            `
        },
        {
            code: `fn(() => {});`,
            options: [
                {
                    allowExpressions: true
                }
            ]
        },
        {
            code: `fn(function() {});`,
            options: [
                {
                    allowExpressions: true
                }
            ]
        },
        {
            code: `[function() {}, () => {}]`,
            options: [
                {
                    allowExpressions: true
                }
            ]
        },
        {
            code: `(function() {});`,
            options: [
                {
                    allowExpressions: true
                }
            ]
        },
        {
            code: `(() => {})();`,
            options: [
                {
                    allowExpressions: true
                }
            ]
        }
    ],
    invalid: [
        {
            filename: "test.ts",
            code: `
function test() {
    return;
}
            `,
            errors: [
                {
                    message: "Missing return type on function.",
                    line: 2,
                    column: 1
                }
            ]
        },
        {
            filename: "test.ts",
            code: `
var fn = function() {
    return 1;
};
            `,
            errors: [
                {
                    message: "Missing return type on function.",
                    line: 2,
                    column: 10
                }
            ]
        },
        {
            filename: "test.ts",
            code: `
var arrowFn = () => 'test';
            `,
            errors: [
                {
                    message: "Missing return type on function.",
                    line: 2,
                    column: 15
                }
            ]
        },
        {
            filename: "test.ts",
            code: `
class Test {
  constructor() {}
  get prop() {
      return 1;
  }
  set prop() {}
  method() {
    return;
  }
}
            `,
            errors: [
                {
                    message: "Missing return type on function.",
                    line: 4,
                    column: 11
                },
                {
                    message: "Missing return type on function.",
                    line: 8,
                    column: 9
                }
            ]
        },
        {
            filename: "test.ts",
            code: `const foo = () => {};`,
            options: [{ allowExpressions: true }],
            errors: [
                {
                    message: "Missing return type on function.",
                    line: 1,
                    column: 13
                }
            ]
        },
        {
            filename: "test.ts",
            code: `const foo = function() {};`,
            options: [{ allowExpressions: true }],
            errors: [
                {
                    message: "Missing return type on function.",
                    line: 1,
                    column: 13
                }
            ]
        }
    ]
});
