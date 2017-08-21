/**
 * @fileoverview Requires the use of as Type for type assertions instead of <Type>
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-angle-bracket-type-assertion"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run("no-angle-bracket-type-assertion", rule, {
    valid: [
        {
            code: `
interface Foo {
    bar : number;
    bas : string;
}

class Generic<T> implements Foo {}

const foo = {} as Foo<int>;
const bar = new Generic<int>() as Foo;
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: "const array : Array<string> = [];",
            parser: "typescript-eslint-parser"
        },
        {
            code: "const array : Array<string> = [];",
            parser: "typescript-eslint-parser"
        },
        {
            code: "const a : number = 5 as number",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Prefer 'as number' instead of '<number>' when doing type assertions",
                    row: 1,
                    column: 20
                }
            ]
        },
        {
            code: `
const a : number = 5;
const b : number = a as number;
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Prefer 'as number' instead of '<number>' when doing type assertions",
                    row: 3,
                    column: 20
                }
            ]
        },
        {
            code: "const a : Array<number> = [1] as Array<number>;",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Prefer 'as Array<number>' instead of '<Array<number>>' when doing type assertions",
                    row: 1,
                    column: 27
                }
            ]
        },
        {
            code: `
class A {}
class B extends A {}

const b : B = new B();
const a : A = b as A;
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type A = {
    num: number
};

const b = {
    num: 5
};

const a: A = b as A;
            `,
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: `
interface Foo {
    bar : number;
    bas : string;
}

class Generic<T> implements Foo {}

const foo = <Foo>{};
const bar = <Foo>new Generic<int>();
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Prefer 'as Foo' instead of '<Foo>' when doing type assertions",
                    row: 8,
                    column: 13
                },
                {
                    message:
                        "Prefer 'as Foo' instead of '<Foo>' when doing type assertions",
                    row: 9,
                    column: 13
                }
            ]
        },
        {
            code: "const a : number = <number>5",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Prefer 'as number' instead of '<number>' when doing type assertions",
                    row: 1,
                    column: 20
                }
            ]
        },
        {
            code: `
const a : number = 5;
const b : number = <number>a;
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Prefer 'as number' instead of '<number>' when doing type assertions",
                    row: 3,
                    column: 20
                }
            ]
        },
        {
            code: "const a : Array<number> = <Array<number>>[1];",
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Prefer 'as Array<number>' instead of '<Array<number>>' when doing type assertions",
                    row: 1,
                    column: 27
                }
            ]
        },
        {
            code: `
class A {}
class B extends A {}

const b : B = new B();
const a : A = <A>b;
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Prefer 'as A' instead of '<A>' when doing type assertions",
                    row: 6,
                    column: 15
                }
            ]
        },
        {
            code: `
type A = {
    num: number
};

const b = {
    num: 5
};

const a: A = <A>b;
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message:
                        "Prefer 'as A' instead of '<A>' when doing type assertions",
                    row: 9,
                    column: 14
                }
            ]
        }
    ]
});
