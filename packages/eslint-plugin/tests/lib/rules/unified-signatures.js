/**
 * @fileoverview Warns for any two overloads that could be unified into one by using a union or an optional/rest parameter.
 * @author Armando Aguirre
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/unified-signatures"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester({ parser: '@typescript-eslint/parser' });

ruleTester.run("unified-signatures", rule, {
    valid: [
        `
function g(): void;
function g(a: number, b: number): void;
function g(a?: number, b?: number): void {}
 `,
        `
function rest(...xs: number[]): void;
function rest(xs: number[], y: string): void;
function rest(...args: any[]) {}
`,
        `
class C {
    constructor();
    constructor(a: number, b: number);
    constructor(a?: number, b?: number) {}

    a(): void;
    a(a: number, b: number): void;
    a(a?: number, b?: number): void {}
}
`,
        // No error for arity difference greater than 1.
        `
interface I {
    a2(): void;
    a2(x: number, y: number): void;
}
`,
        // No error for different return types.
        `
interface I {
    a4(): void;
    a4(x: number): number;
}
`,
        // No error if one takes a type parameter and the other doesn't.
        `
interface I {
    a5<T>(x: T): T;
    a5(x: number): number;
}
`,
        // No error if one is a rest parameter and other isn't.
        `
interface I {
    b2(x: string): void;
    b2(...x: number[]): void;
}
`,
        // No error if both are rest parameters. (https://github.com/Microsoft/TypeScript/issues/5077)
        `
interface I {
    b3(...x: number[]): void;
    b3(...x: string[]): void;
}
`,
        // No error if one is optional and the other isn't.
        `
interface I {
    c3(x: number): void;
    c3(x?: string): void;
}
`,
        // No error if they differ by 2 or more parameters.
        `
interface I {
    d2(x: string, y: number): void;
    d2(x: number, y: string): void;
}
`,
        // No conflict between static/non-static members.
        `
declare class D {
    static a();
    a(x: number);
}
`,
        // Allow separate overloads if one is generic and the other isn't.
        `
interface Generic<T> {
    x(): void;
    x(x: T[]): void;
}
`],
    invalid: [{
        code: `
function f(x: number): void;
function f(x: string): void;
function f(x: any): any {
    return x;
}
`,
        errors: [{
            message: "These overloads can be combined into one signature taking `number | string`.",
            line: 3,
            column: 12,
            endLine: 3,
            endColumn: 21
        }]
    }, {
        code: `
function opt(xs?: number[]): void;
function opt(xs: number[], y: string): void;
function opt(...args: any[]) {}
`,
        errors: [{
            message: "These overloads can be combined into one signature with an optional parameter.",
            line: 3,
            column: 28,
            endLine: 3,
            endColumn: 37
        }]
    }, {
        // For 3 or more overloads, mentions the line.
        code: `
interface I {
    a0(): void;
    a0(x: string): string;
    a0(x: number): void;
}
`,
        errors: [{
            message: "This overload and the one on line 3 can be combined into one signature with an optional parameter.",
            line: 5,
            column: 8,
            endLine: 5,
            endColumn: 17
        }]
    }, {
        // Error for extra parameter.
        code: `
interface I {
    a1(): void;
    a1(x: number): void;
}
`,
        errors: [{
            message: "These overloads can be combined into one signature with an optional parameter.",
            line: 4,
            column: 8,
            endLine: 4,
            endColumn: 17
        }]
    }, {
        // Error for arity difference greater than 1 if the additional parameters are all optional/rest.
        code: `
interface I {
    a3(): void;
    a3(x: number, y?: number, ...z: number[]): void;
}
`,
        errors: [{
            message: "These overloads can be combined into one signature with a rest parameter.",
            line: 4,
            column: 31,
            endLine: 4,
            endColumn: 45
        }]
    }, {
        // Error if only one defines a rest parameter.
        code: `
interface I {
    b(): void;
    b(...x: number[]): void;
}
`,
        errors: [{
            message: "These overloads can be combined into one signature with a rest parameter.",
            line: 4,
            column: 7,
            endLine: 4,
            endColumn: 21
        }]
    }, {
        // Error if only one defines an optional parameter.
        code: `
interface I {
    c(): void;
    c(x?: number): void;
}
`,
        errors: [{
            message: "These overloads can be combined into one signature with an optional parameter.",
            line: 4,
            column: 7,
            endLine: 4,
            endColumn: 17
        }]
    }, {
        // Error if both are optional.
        code: `
interface I {
    c2(x?: number): void;
    c2(x?: string): void;
}
`,
        errors: [{
            message: "These overloads can be combined into one signature taking `number | string`.",
            line: 4,
            column: 8,
            endLine: 4,
            endColumn: 18
        }]
    }, {
        // Error for different types (could be a union)
        code: `
interface I {
    d(x: string): void;
    d(x: number): void;
}
`,
        errors: [{
            message: "These overloads can be combined into one signature taking `string | number`.",
            line: 4,
            column: 7,
            endLine: 4,
            endColumn: 16
        }]
    }, {
        // Works for type literal and call signature too.
        code: `
type T = {
    (): void;
    (x: number): void;
}
`,
        errors: [{
            message: "These overloads can be combined into one signature with an optional parameter.",
            line: 4,
            column: 6,
            endLine: 4,
            endColumn: 15
        }]
    }, {
        // Works for constructor.
        code: `
declare class C {
    constructor();
    constructor(x: number);
}
`,
        errors: [{
            message: "These overloads can be combined into one signature with an optional parameter.",
            line: 4,
            column: 17,
            endLine: 4,
            endColumn: 26
        }]
    }, {
        // Works with unions.
        code: `
interface I {
    f(x: number);
    f(x: string | boolean);
}
`,
        errors: [{
            message: "These overloads can be combined into one signature taking `number | string | boolean`.",
            line: 4,
            column: 7,
            endLine: 4,
            endColumn: 26
        }]
    }, {
        // Works with tuples.
        code: `
interface I {
    f(x: number);
    f(x: [string, boolean]);
}
`,
        errors: [{
            message: "These overloads can be combined into one signature taking `number | [string, boolean]`.",
            line: 4,
            column: 7,
            endLine: 4,
            endColumn: 27
        }]
    }, {
        code: `
interface Generic<T> {
    y(x: T[]): void;
    y(x: T): void;
}
`,
        errors: [{
            message: "These overloads can be combined into one signature taking `T[] | T`.",
            line: 4,
            column: 7,
            endLine: 4,
            endColumn: 11
        }]
    }]
});
