/**
 * @fileoverview Requires the use of as Type for type assertions instead of <Type>
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/no-angle-bracket-type-assertion"),
    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
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
const array : Array<string> = [];
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
const array : Array<string> = [];
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "Prefer 'as Foo' instead of '<Foo>' when doing type assertions",
                    row: 8,
                    column: 13
                },
                {
                    message: "Prefer 'as Foo' instead of '<Foo>' when doing type assertions",
                    row: 9,
                    column: 13
                },
            ]
        }
    ]
});
