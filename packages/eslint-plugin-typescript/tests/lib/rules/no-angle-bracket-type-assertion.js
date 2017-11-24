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

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("no-angle-bracket-type-assertion", rule, {
    valid: [
        `
interface Foo {
    bar : number;
    bas : string;
}

class Generic<T> implements Foo {}

const foo = {} as Foo<int>;
const bar = new Generic<int>() as Foo;
        `,
        "const array : Array<string> = [];",
        "const array : Array<string> = [];",
        `
class A {}
class B extends A {}

const b : B = new B();
const a : A = b as A;
        `,
        `
type A = {
    num: number
};

const b = {
    num: 5
};

const a: A = b as A;
        `,
        "const a : number = 5 as number",
        `
const a : number = 5;
const b : number = a as number;
        `,
        "const a : Array<number> = [1] as Array<number>;"
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
