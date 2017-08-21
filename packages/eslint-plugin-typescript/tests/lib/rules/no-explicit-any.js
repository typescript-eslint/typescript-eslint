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

const ruleTester = new RuleTester();

ruleTester.run("no-explicit-any", rule, {
    valid: [
        {
            code: "const number: number = 1",
            parser: "typescript-eslint-parser"
        },
        {
            code: "function greet(): string {}",
            parser: "typescript-eslint-parser"
        },
        {
            code: "function greet(): Array<string> {}",
            parser: "typescript-eslint-parser"
        },
        {
            code: "function greet(): string[] {}",
            parser: "typescript-eslint-parser"
        },
        {
            code: "function greet(): Array<Array<string>> {}",
            parser: "typescript-eslint-parser"
        },
        {
            code: "function greet(): Array<string[]> {}",
            parser: "typescript-eslint-parser"
        },
        {
            code: "function greet(param: Array<string>): Array<string> {}",
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Greeter {
    message: string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Greeter {
    message: Array<string>;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Greeter {
    message: string[];
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Greeter {
    message: Array<Array<string>>;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Greeter {
    message: Array<string[]>;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Greeter {
    message: string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Greeter {
    message: Array<string>;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Greeter {
    message: string[];
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Greeter {
    message: Array<Array<string>>;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Greeter {
    message: Array<string[]>;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: Array<string>;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: string[];
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: Array<Array<string>>;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: Array<string[]>;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: string | number; 
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: string | Array<string>; 
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: string | string[]; 
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: string | Array<Array<string>>; 
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: string & number; 
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: string & Array<string>; 
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: string & string[]; 
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type obj = {
    message: string & Array<Array<string>>; 
}
            `,
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: "const number: any = 1",
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
