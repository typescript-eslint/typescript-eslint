/**
 * @fileoverview Enforces interface names are prefixed with "I"
 * @author Danny Fritz
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/interface-name-prefix"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run("interface-name-prefix", rule, {
    valid: [
        {
            code: `
interface Animal {
    name: string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            options: ["always"],
            code: `
interface IAnimal {
    name: string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            options: ["always"],
            code: `
interface IIguana {
    name: string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            options: ["never"],
            code: `
interface Iguana {
    name: string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            options: ["never"],
            code: `
interface Animal {
    name: string;
}
            `,
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: `
interface IAnimal {
    name: string;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: 'Interface name must not be prefixed with "I"',
                    line: 2,
                    column: 11
                }
            ]
        },
        {
            options: ["always"],
            code: `
interface Animal {
    name: string;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: 'Interface name must be prefixed with "I"',
                    line: 2,
                    column: 11
                }
            ]
        },
        {
            options: ["always"],
            code: `
interface Iguana {
    name: string;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: 'Interface name must be prefixed with "I"',
                    line: 2,
                    column: 11
                }
            ]
        },
        {
            options: ["never"],
            code: `
interface IIguana {
    name: string;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: 'Interface name must not be prefixed with "I"',
                    line: 2,
                    column: 11
                }
            ]
        },
        {
            options: ["never"],
            code: `
interface IAnimal {
    name: string;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: 'Interface name must not be prefixed with "I"',
                    line: 2,
                    column: 11
                }
            ]
        }
    ]
});
