/**
 * @fileoverview Enforces the any type is not used
 * @author Danny Fritz
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-explicit-any"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("no-explicit-any", rule, {
    valid: [
        "const number: number = 1",
        "function greet(): string {}",
        "function greet(): Array<string> {}",
        "function greet(): string[] {}",
        "function greet(): Array<Array<string>> {}",
        "function greet(): Array<string[]> {}",
        "function greet(param: Array<string>): Array<string> {}",
        `
class Greeter {
    message: string;
}
        `,
        `
class Greeter {
    message: Array<string>;
}
        `,
        `
class Greeter {
    message: string[];
}
        `,
        `
class Greeter {
    message: Array<Array<string>>;
}
        `,
        `
class Greeter {
    message: Array<string[]>;
}
        `,
        `
interface Greeter {
    message: string;
}
        `,
        `
interface Greeter {
    message: Array<string>;
}
        `,
        `
interface Greeter {
    message: string[];
}
        `,
        `
interface Greeter {
    message: Array<Array<string>>;
}
        `,
        `
interface Greeter {
    message: Array<string[]>;
}
        `,
        `
type obj = {
    message: string;
}
        `,
        `
type obj = {
    message: Array<string>;
}
        `,
        `
type obj = {
    message: string[];
}
        `,
        `
type obj = {
    message: Array<Array<string>>;
}
        `,
        `
type obj = {
    message: Array<string[]>;
}
        `,
        `
type obj = {
    message: string | number;
}
        `,
        `
type obj = {
    message: string | Array<string>;
}
        `,
        `
type obj = {
    message: string | string[];
}
        `,
        `
type obj = {
    message: string | Array<Array<string>>;
}
        `,
        `
type obj = {
    message: string & number;
}
        `,
        `
type obj = {
    message: string & Array<string>;
}
        `,
        `
type obj = {
    message: string & string[];
}
        `,
        `
type obj = {
    message: string & Array<Array<string>>;
}
        `
    ],
    invalid: [
        {
            code: "const number: any = 1",
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 1,
                    column: 15
                }
            ]
        },
        {
            code: "function generic(): any {}",
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 1,
                    column: 21
                }
            ]
        },
        {
            code: "function generic(): Array<any> {}",
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 1,
                    column: 27
                }
            ]
        },
        {
            code: "function generic(): any[] {}",
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 1,
                    column: 21
                }
            ]
        },
        {
            code: "function generic(param: Array<any>): number {}",
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 1,
                    column: 31
                }
            ]
        },
        {
            code: "function generic(param: any[]): number {}",
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 1,
                    column: 25
                }
            ]
        },
        {
            code: "function generic(param: Array<any>): Array<any> {}",
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 1,
                    column: 31
                },
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 1,
                    column: 44
                }
            ]
        },
        {
            code: "function generic(): Array<Array<any>> {}",
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 1,
                    column: 33
                }
            ]
        },
        {
            code: "function generic(): Array<any[]> {}",
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 1,
                    column: 27
                }
            ]
        },
        {
            code: `
class Greeter {
    constructor(param: Array<any>) {}
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 30
                }
            ]
        },
        {
            code: `
class Greeter {
    message: any;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 14
                }
            ]
        },
        {
            code: `
class Greeter {
    message: Array<any>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 20
                }
            ]
        },
        {
            code: `
class Greeter {
    message: any[];
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 14
                }
            ]
        },
        {
            code: `
class Greeter {
    message: Array<Array<any>>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: `
class Greeter {
    message: Array<any[]>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 20
                }
            ]
        },
        {
            code: `
interface Greeter {
    message: any;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 14
                }
            ]
        },
        {
            code: `
interface Greeter {
    message: Array<any>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 20
                }
            ]
        },
        {
            code: `
interface Greeter {
    message: any[];
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 14
                }
            ]
        },
        {
            code: `
interface Greeter {
    message: Array<Array<any>>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: `
interface Greeter {
    message: Array<any[]>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 20
                }
            ]
        },
        {
            code: `
type obj = {
    message: any;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 14
                }
            ]
        },
        {
            code: `
type obj = {
    message: Array<any>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 20
                }
            ]
        },
        {
            code: `
type obj = {
    message: any[];
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 14
                }
            ]
        },
        {
            code: `
type obj = {
    message: Array<Array<any>>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: `
type obj = {
    message: Array<any[]>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 20
                }
            ]
        },
        {
            code: `
type obj = {
    message: string | any;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
type obj = {
    message: string | Array<any>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 29
                }
            ]
        },
        {
            code: `
type obj = {
    message: string | any[];
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
type obj = {
    message: string | Array<Array<any>>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 35
                }
            ]
        },
        {
            code: `
type obj = {
    message: string | Array<any[]>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 29
                }
            ]
        },
        {
            code: `
type obj = {
    message: string & any;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
type obj = {
    message: string & Array<any>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 29
                }
            ]
        },
        {
            code: `
type obj = {
    message: string & any[];
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
type obj = {
    message: string & Array<Array<any>>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 35
                }
            ]
        },
        {
            code: `
type obj = {
    message: string & Array<any[]>;
}
            `,
            errors: [
                {
                    message: "Unexpected any. Specify a different type.",
                    line: 3,
                    column: 29
                }
            ]
        }
    ]
});
