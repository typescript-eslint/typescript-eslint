/**
 * @fileoverview Enforce valid definition of `new` and `constructor`.
 * @author Armano <https://github.com/armano2>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-misused-new"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser",
});

ruleTester.run("no-misused-new", rule, {
    valid: [
        `
declare abstract class C {
    foo () {
    }
    get new ();
    bar();
}
        `,
        `
class C {
    constructor();
}
        `,
        `
class C {
    constructor() {}
}
        `,
        // OK if there's a body
        `
class C {
    new() {}
}
        `,
        // OK if return type is not the interface.
        `
interface I {
    new(): {};
}
        `,
        // 'new' OK in type literal (we don't know the type name)
        `
type T = {
    new(): T;
}
        `,
    ],
    invalid: [
        {
            code: `
interface I {
    new(): I;
    constructor(): void;
}
`,
            errors: [
                {
                    messageId: "errorMessageInterface",
                    line: 3,
                    column: 5,
                },
                {
                    messageId: "errorMessageInterface",
                    line: 4,
                    column: 5,
                },
            ],
        },
        // Works for generic type.
        {
            code: `
interface G {
    new<T>(): G<T>;
}
`,
            errors: [
                {
                    messageId: "errorMessageInterface",
                    line: 3,
                    column: 5,
                },
            ],
        },
        // 'constructor' flagged.
        {
            code: `
type T = {
    constructor(): void;
}
`,
            errors: [
                {
                    messageId: "errorMessageInterface",
                    line: 3,
                    column: 5,
                },
            ],
        },
        {
            code: `
class C {
    new(): C;
}
`,
            errors: [
                {
                    messageId: "errorMessageClass",
                    line: 3,
                    column: 5,
                },
            ],
        },
        {
            code: `
declare abstract class C {
    new(): C;
}
`,
            errors: [
                {
                    messageId: "errorMessageClass",
                    line: 3,
                    column: 5,
                },
            ],
        },
    ],
});
