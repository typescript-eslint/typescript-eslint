/**
 * @fileoverview Enforces spacing around type annotations
 * @author Nicholas C. Zakas
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/type-annotation-spacing"),
    RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
    parser: "typescript-eslint-parser"
});

ruleTester.run("type-annotation-spacing", rule, {
    valid: [
        `
interface resolve {
    resolver: (() => PromiseLike<T>) | PromiseLike<T>;
}
        `,
        "const foo = {} as Foo;",
        "let foo: string;",
        "function foo(): void {}",
        "function foo(a: string) {}",
        `
class Foo {
    name: string;
}
        `,
        `
class Foo {
    constructor(message: string);
}
        `,
        `
class Foo {
    greet(): string { return "hello"; }
}
        `,
        `
class Foo {
    greet(name: string): string { return name; }
}
        `,
        `
interface Foo {
    name: string;
}
        `,
        `
interface Foo {
    greet(): string;
}
        `,
        `
interface Foo {
    greet(name: string): string;
}
        `,
        `
interface Foo {
    thing: { [key in string]: number };
}
        `,
        `
type Foo = {
    name: string;
}
        `,
        `
type Foo = {
    greet(): string;
}
        `,
        `
type Foo = {
    greet(name: string): string;
}
        `,
        "type Foo = (name: string) => string;",
        `
type Foo = {
    greet: (name: string) => string;
}
        `,
        {
            code: "let foo: string;",
            options: [{ after: true }]
        },
        {
            code: "function foo(): string {}",
            options: [{ after: true }]
        },
        {
            code: "function foo(a: string) {}",
            options: [{ after: true }]
        },
        {
            code: `
class Foo {
    name: string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
class Foo {
    constructor(message: string);
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
class Foo {
    greet(): string { return "hello"; }
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
class Foo {
    greet(name: string): string { return name; }
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
interface Foo {
    name: string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
interface Foo {
    greet(): string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
interface Foo {
    greet(name: string): string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
type Foo = {
    name: string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
type Foo = {
    greet(): string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
type Foo = {
    greet(name: string): string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: "type Foo = (name: string) => string;",
            options: [{ after: true }]
        },
        {
            code: `
type Foo = {
    greet: (name: string) => string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: "let foo: string;",
            options: [{ after: true, before: false }]
        },
        {
            code: "function foo(): string {}",
            options: [{ after: true, before: false }]
        },
        {
            code: "function foo(a: string) {}",
            options: [{ after: true, before: false }]
        },
        {
            code: `
class Foo {
    name: string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
class Foo {
    constructor(message: string);
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
class Foo {
    greet(): string { return "hello"; }
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
class Foo {
    greet(name: string): string { return name; }
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
interface Foo {
    name: string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
interface Foo {
    greet(): string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
interface Foo {
    greet(name: string): string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
type Foo = {
    name: string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
type Foo = {
    greet(): string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
type Foo = {
    greet(name: string): string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: "type Foo = (name: string)=> string;",
            options: [{ after: true, before: false }]
        },
        {
            code: `
type Foo = {
    greet: (name: string)=> string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: "let foo : string;",
            options: [{ after: true, before: true }]
        },
        {
            code: "function foo() : string {}",
            options: [{ after: true, before: true }]
        },
        {
            code: "function foo(a : string) {}",
            options: [{ after: true, before: true }]
        },
        {
            code: `
class Foo {
    name : string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
class Foo {
    constructor(message : string);
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
class Foo {
    greet() : string { return "hello"; }
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
class Foo {
    greet(name : string) : string { return name; }
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
interface Foo {
    name : string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
interface Foo {
    greet() : string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
interface Foo {
    greet(name : string) : string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
type Foo = {
    name : string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
type Foo = {
    greet() : string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
type Foo = {
    greet(name : string) : string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: "type Foo = (name : string) => string;",
            options: [{ after: true, before: true }]
        },
        {
            code: `
type Foo = {
    greet : (name : string) => string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: "let foo :string;",
            options: [{ after: false, before: true }]
        },
        {
            code: "function foo() :string {}",
            options: [{ after: false, before: true }]
        },
        {
            code: "function foo(a :string) {}",
            options: [{ after: false, before: true }]
        },
        {
            code: `
class Foo {
    name :string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
class Foo {
    constructor(message :string);
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
class Foo {
    greet() :string { return "hello"; }
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
class Foo {
    greet(name :string) :string { return name; }
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
interface Foo {
    name :string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
interface Foo {
    greet() :string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
interface Foo {
    greet(name :string) :string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
type Foo = {
    name :string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
type Foo = {
    greet() :string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
type Foo = {
    greet(name :string) :string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: "type Foo = (name :string) =>string;",
            options: [{ after: false, before: true }]
        },
        {
            code: `
type Foo = {
    greet :(name :string) =>string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: "let foo : string;",
            options: [{ before: true }]
        },
        {
            code: "function foo() : string {}",
            options: [{ before: true }]
        },
        {
            code: "function foo(a : string) {}",
            options: [{ before: true }]
        },
        {
            code: `
class Foo {
    name : string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
class Foo {
    constructor(message : string);
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
class Foo {
    greet() : string { return "hello"; }
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
class Foo {
    greet(name : string) : string { return name; }
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
interface Foo {
    name : string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
interface Foo {
    greet() : string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
interface Foo {
    greet(name : string) : string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
type Foo = {
    name : string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
type Foo = {
    greet() : string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
type Foo = {
    greet(name : string) : string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: "type Foo = (name : string) => string;",
            options: [{ before: true }]
        },
        {
            code: `
type Foo = {
    greet : (name : string) => string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: "let foo : string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: "function foo() : string {}",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: "function foo(a : string) {}",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
class Foo {
    name : string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message : string);
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
class Foo {
    greet() : string { return "hello"; }
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name : string) : string { return name; }
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
interface Foo {
    name : string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
interface Foo {
    greet() : string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name : string) : string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
type Foo = {
    name : string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
type Foo = {
    greet() : string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name : string) : string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: "type Foo = (name : string)=>string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
type Foo = {
    greet : (name : string)=>string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: "type Foo = (name : string) => string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true,
                            after: true
                        }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    greet : (name : string) => string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true,
                            after: true
                        }
                    }
                }
            ]
        },
        {
            code: "type Foo = (name : string) =>string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true
                        }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    greet : (name : string) =>string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true
                        }
                    }
                }
            ]
        },
        {
            code: `
interface Foo {
    thing: { [key in string]: number };
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
interface Foo {
    thing: { [key in string]: number };
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
interface Foo {
    thing : { [key in string] : number };
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
interface Foo {
    thing :{ [key in string] :number };
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
interface Foo {
    thing : { [key in string] : number };
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
type Foo = {
    thing: { [key in string]: number };
}
            `
        },
        {
            code: `
type Foo = {
    thing: { [key in string]: number };
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
type Foo = {
    thing: { [key in string]: number };
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
type Foo = {
    thing : { [key in string] : number };
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
type Foo = {
    thing :{ [key in string] :number };
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
type Foo = {
    thing : { [key in string] : number };
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
class Foo {
    greet: (name: string) => void = {}
}
            `
        },
        {
            code: `
class Foo {
    greet: (name: string) => void = {}
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
class Foo {
    greet: (name: string)=> void = {}
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
class Foo {
    greet : (name : string) => void = {}
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
class Foo {
    greet :(name :string) =>void = {}
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
class Foo {
    greet : (name : string) => void = {}
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
interface Foo { a: string }
type Bar = Record<keyof Foo, string>
            `,
            options: [
                {
                    after: true,
                    before: false,
                    overrides: {
                        arrow: {
                            after: true,
                            before: true
                        }
                    }
                }
            ],
            parser: "typescript-eslint-parser"
        },
        "let resolver: (() => PromiseLike<T>) | PromiseLike<T>;",
        `
interface resolve {
    resolver: (() => PromiseLike<T>) | PromiseLike<T>;
}
        `
    ],
    invalid: [
        {
            code: "let foo : string;",
            output: "let foo: string;",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 9
                }
            ]
        },
        {
            code: "function foo() : string {}",
            output: "function foo(): string {}",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: "function foo(a : string) {}",
            output: "function foo(a: string) {}",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: `
class Foo {
    name : string;
}
            `,
            output: `
class Foo {
    name: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message : string);
}
            `,
            output: `
class Foo {
    constructor(message: string);
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 25
                }
            ]
        },
        {
            code: `
class Foo {
    greet() : string { return "hello"; }
}
            `,
            output: `
class Foo {
    greet(): string { return "hello"; }
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 13
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name : string) : string { return name; }
}
            `,
            output: `
class Foo {
    greet(name: string): string { return name; }
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: `
interface Foo {
    name : string;
}
            `,
            output: `
interface Foo {
    name: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
interface Foo {
    greet() : string;
}
            `,
            output: `
interface Foo {
    greet(): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 13
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name : string) : string;
}
            `,
            output: `
interface Foo {
    greet(name: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: `
type Foo = {
    name : string;
}
            `,
            output: `
type Foo = {
    name: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
type Foo = {
    greet() : string;
}
            `,
            output: `
type Foo = {
    greet(): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 13
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name : string) : string;
}
            `,
            output: `
type Foo = {
    greet(name: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: "type Foo = (name : string) => string;",
            output: "type Foo = (name: string) => string;",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = (name : string)=> string;",
            output: "type Foo = (name: string) => string;",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 18
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 27
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name : string) => string;
}
            `,
            output: `
type Foo = {
    greet: (name: string) => string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name : string)=> string;
}
            `,
            output: `
type Foo = {
    greet: (name: string) => string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 27
                }
            ]
        },
        {
            code: "let foo : string;",
            options: [{ after: true }],
            output: "let foo: string;",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 9
                }
            ]
        },
        {
            code: "function foo() : string {}",
            options: [{ after: true }],
            output: "function foo(): string {}",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: "function foo(a : string) {}",
            options: [{ after: true }],
            output: "function foo(a: string) {}",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: `
class Foo {
    name : string;
}
            `,
            options: [{ after: true }],
            output: `
class Foo {
    name: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message : string);
}
            `,
            options: [{ after: true }],
            output: `
class Foo {
    constructor(message: string);
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 25
                }
            ]
        },
        {
            code: `
class Foo {
    greet() : string { return "hello"; }
}
            `,
            options: [{ after: true }],
            output: `
class Foo {
    greet(): string { return "hello"; }
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 13
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name : string) : string { return name; }
}
            `,
            options: [{ after: true }],
            output: `
class Foo {
    greet(name: string): string { return name; }
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: `
interface Foo {
    name : string;
}
            `,
            options: [{ after: true }],
            output: `
interface Foo {
    name: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
interface Foo {
    greet() : string;
}
            `,
            options: [{ after: true }],
            output: `
interface Foo {
    greet(): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 13
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name : string) : string;
}
            `,
            options: [{ after: true }],
            output: `
interface Foo {
    greet(name: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: `
type Foo = {
    name : string;
}
            `,
            options: [{ after: true }],
            output: `
type Foo = {
    name: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
type Foo = {
    greet() : string;
}
            `,
            options: [{ after: true }],
            output: `
type Foo = {
    greet(): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 13
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name : string) : string;
}
            `,
            options: [{ after: true }],
            output: `
type Foo = {
    greet(name: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: "type Foo = (name : string) => string;",
            options: [{ after: true }],
            output: "type Foo = (name: string) => string;",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = (name : string)=> string;",
            options: [{ after: true }],
            output: "type Foo = (name: string) => string;",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 18
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 27
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name : string) => string;
}
            `,
            options: [{ after: true }],
            output: `
type Foo = {
    greet: (name: string) => string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name : string)=> string;
}
            `,
            options: [{ after: true }],
            output: `
type Foo = {
    greet: (name: string) => string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 27
                }
            ]
        },
        {
            code: "let foo : string;",
            options: [{ after: true, before: false }],
            output: "let foo: string;",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 9
                }
            ]
        },
        {
            code: "function foo() : string {}",
            options: [{ after: true, before: false }],
            output: "function foo(): string {}",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: "function foo(a : string) {}",
            options: [{ after: true, before: false }],
            output: "function foo(a: string) {}",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: `
class Foo {
    name : string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
class Foo {
    name: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message : string);
}
            `,
            options: [{ after: true, before: false }],
            output: `
class Foo {
    constructor(message: string);
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 25
                }
            ]
        },
        {
            code: `
class Foo {
    greet() : string { return "hello"; }
}
            `,
            options: [{ after: true, before: false }],
            output: `
class Foo {
    greet(): string { return "hello"; }
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 13
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name : string) : string { return name; }
}
            `,
            options: [{ after: true, before: false }],
            output: `
class Foo {
    greet(name: string): string { return name; }
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: `
interface Foo {
    name : string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
interface Foo {
    name: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
interface Foo {
    greet() : string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
interface Foo {
    greet(): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 13
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name : string) : string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
interface Foo {
    greet(name: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: `
type Foo = {
    name : string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
type Foo = {
    name: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
type Foo = {
    greet() : string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
type Foo = {
    greet(): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 13
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name : string) : string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
type Foo = {
    greet(name: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: "type Foo = (name : string) => string;",
            options: [{ after: true, before: false }],
            output: "type Foo = (name: string)=> string;",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 18
                },
                {
                    message: "Unexpected space before the '=>'",
                    line: 1,
                    column: 28
                }
            ]
        },
        {
            code: "type Foo = (name : string)=> string;",
            options: [{ after: true, before: false }],
            output: "type Foo = (name: string)=> string;",
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name : string) => string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
type Foo = {
    greet: (name: string)=> string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected space before the '=>'",
                    line: 3,
                    column: 28
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name : string)=> string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
type Foo = {
    greet: (name: string)=> string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: "let foo:string;",
            options: [{ after: true, before: true }],
            output: "let foo : string;",
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 1,
                    column: 8
                },
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 8
                }
            ]
        },
        {
            code: "function foo():string {}",
            options: [{ after: true, before: true }],
            output: "function foo() : string {}",
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 1,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 15
                }
            ]
        },
        {
            code: "function foo(a:string) {}",
            options: [{ after: true, before: true }],
            output: "function foo(a : string) {}",
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 1,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 15
                }
            ]
        },
        {
            code: `
class Foo {
    name:string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
class Foo {
    name : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 9
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message:string);
}
            `,
            options: [{ after: true, before: true }],
            output: `
class Foo {
    constructor(message : string);
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: `
class Foo {
    greet():string { return "hello"; }
}
            `,
            options: [{ after: true, before: true }],
            output: `
class Foo {
    greet() : string { return "hello"; }
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 12
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 12
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name:string):string { return name; }
}
            `,
            options: [{ after: true, before: true }],
            output: `
class Foo {
    greet(name : string) : string { return name; }
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 23
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
interface Foo {
    name:string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
interface Foo {
    name : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 9
                }
            ]
        },
        {
            code: `
interface Foo {
    greet():string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
interface Foo {
    greet() : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 12
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 12
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name:string):string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
interface Foo {
    greet(name : string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 23
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
type Foo = {
    name:string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
type Foo = {
    name : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 9
                }
            ]
        },
        {
            code: `
type Foo = {
    greet():string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
type Foo = {
    greet() : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 12
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 12
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name:string):string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
type Foo = {
    greet(name : string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 23
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: "type Foo = (name: string)=> string;",
            options: [{ after: true, before: true }],
            output: "type Foo = (name : string) => string;",
            errors: [
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 17
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 26
                }
            ]
        },
        {
            code: "type Foo = (name : string)=> string;",
            options: [{ after: true, before: true }],
            output: "type Foo = (name : string) => string;",
            errors: [
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 27
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name: string)=> string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
type Foo = {
    greet : (name : string) => string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 10
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: `
type Foo = {
    greet : (name : string)=> string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
type Foo = {
    greet : (name : string) => string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 28
                }
            ]
        },
        {
            code: "let foo:string;",
            options: [{ before: true }],
            output: "let foo : string;",
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 1,
                    column: 8
                },
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 8
                }
            ]
        },
        {
            code: "function foo():string {}",
            options: [{ before: true }],
            output: "function foo() : string {}",
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 1,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 15
                }
            ]
        },
        {
            code: "function foo(a:string) {}",
            options: [{ before: true }],
            output: "function foo(a : string) {}",
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 1,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 15
                }
            ]
        },
        {
            code: `
class Foo {
    name:string;
}
            `,
            options: [{ before: true }],
            output: `
class Foo {
    name : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 9
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message:string);
}
            `,
            options: [{ before: true }],
            output: `
class Foo {
    constructor(message : string);
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: `
class Foo {
    greet():string { return "hello"; }
}
            `,
            options: [{ before: true }],
            output: `
class Foo {
    greet() : string { return "hello"; }
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 12
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 12
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name:string):string { return name; }
}
            `,
            options: [{ before: true }],
            output: `
class Foo {
    greet(name : string) : string { return name; }
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 23
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
interface Foo {
    name:string;
}
            `,
            options: [{ before: true }],
            output: `
interface Foo {
    name : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 9
                }
            ]
        },
        {
            code: `
interface Foo {
    greet():string;
}
            `,
            options: [{ before: true }],
            output: `
interface Foo {
    greet() : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 12
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 12
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name:string):string;
}
            `,
            options: [{ before: true }],
            output: `
interface Foo {
    greet(name : string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 23
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
type Foo = {
    name:string;
}
            `,
            options: [{ before: true }],
            output: `
type Foo = {
    name : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 9
                }
            ]
        },
        {
            code: `
type Foo = {
    greet():string;
}
            `,
            options: [{ before: true }],
            output: `
type Foo = {
    greet() : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 12
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 12
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name:string):string;
}
            `,
            options: [{ before: true }],
            output: `
type Foo = {
    greet(name : string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 23
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: "type Foo = (name: string)=> string;",
            options: [{ before: true }],
            output: "type Foo = (name : string) => string;",
            errors: [
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 17
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 26
                }
            ]
        },
        {
            code: "type Foo = (name : string)=> string;",
            options: [{ before: true }],
            output: "type Foo = (name : string) => string;",
            errors: [
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 27
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name: string)=> string;
}
            `,
            options: [{ before: true }],
            output: `
type Foo = {
    greet : (name : string) => string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 10
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 17
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 26
                }
            ]
        },
        {
            code: `
type Foo = {
    greet : (name : string)=> string;
}
            `,
            options: [{ before: true }],
            output: `
type Foo = {
    greet : (name : string) => string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 28
                }
            ]
        },
        {
            code: "let foo:string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: "let foo : string;",
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 1,
                    column: 8
                },
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 8
                }
            ]
        },
        {
            code: "function foo():string {}",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: "function foo() : string {}",
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 1,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 15
                }
            ]
        },
        {
            code: "function foo(a:string) {}",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: "function foo(a : string) {}",
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 1,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 15
                }
            ]
        },
        {
            code: `
class Foo {
    name:string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
class Foo {
    name : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 9
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message:string);
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
class Foo {
    constructor(message : string);
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: `
class Foo {
    greet():string { return "hello"; }
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
class Foo {
    greet() : string { return "hello"; }
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 12
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 12
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name:string):string { return name; }
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
class Foo {
    greet(name : string) : string { return name; }
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 23
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
interface Foo {
    name:string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
interface Foo {
    name : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 9
                }
            ]
        },
        {
            code: `
interface Foo {
    greet():string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
interface Foo {
    greet() : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 12
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 12
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name:string):string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
interface Foo {
    greet(name : string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 23
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: `
type Foo = {
    name:string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
type Foo = {
    name : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 9
                }
            ]
        },
        {
            code: `
type Foo = {
    greet():string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
type Foo = {
    greet() : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 12
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 12
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name:string):string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
type Foo = {
    greet(name : string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 23
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 23
                }
            ]
        },
        {
            code: "type Foo = (name:string)=>string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: "type Foo = (name : string)=>string;",
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 1,
                    column: 17
                },
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 17
                }
            ]
        },
        {
            code: `
type Foo = {
    greet : (name:string)=>string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
type Foo = {
    greet : (name : string)=>string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = (name:string)=>string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true,
                            after: true
                        }
                    }
                }
            ],
            output: "type Foo = (name : string) => string;",
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 1,
                    column: 17
                },
                {
                    message: "Expected a space before the ':'",
                    line: 1,
                    column: 17
                },
                {
                    message: "Expected a space after the '=>'",
                    line: 1,
                    column: 25
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 25
                }
            ]
        },
        {
            code: `
type Foo = {
    greet : (name:string)=>string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true,
                            after: true
                        }
                    }
                }
            ],
            output: `
type Foo = {
    greet : (name : string) => string;
}
            `,
            errors: [
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a space after the '=>'",
                    line: 3,
                    column: 26
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 26
                }
            ]
        }
    ]
});

//------------------------------------------------------------------------------
// Optional Annotation Tests
//------------------------------------------------------------------------------

ruleTester.run("type-annotation-spacing", rule, {
    valid: [
        `
interface resolve {
    resolver?: (() => PromiseLike<T>) | PromiseLike<T>;
}
        `,
        "function foo(a?: string) {}",
        `
class Foo {
    name?: string;
}
        `,
        `
class Foo {
    constructor(message?: string);
}
        `,
        `
class Foo {
    greet(name?: string): string { return name; }
}
        `,
        `
interface Foo {
    name?: string;
}
        `,
        `
interface Foo {
    greet(name?: string): string;
}
        `,
        `
interface Foo {
    thing?: { [key in string]?: number };
}
        `,
        `
type Foo = {
    name?: string;
}
        `,
        `
type Foo = {
    greet(name?: string): string;
}
        `,
        "type Foo = (name?: string) => string;",
        `
type Foo = {
    greet?: (name?: string) => string;
}
        `,
        {
            code: "function foo(a?: string) {}",
            options: [{ after: true }]
        },
        {
            code: `
class Foo {
    name?: string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
class Foo {
    constructor(message?: string);
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
class Foo {
    greet(name?: string): string { return name; }
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
interface Foo {
    name?: string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
interface Foo {
    greet(name?: string): string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
type Foo = {
    name?: string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
type Foo = {
    greet(name?: string): string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: "type Foo = (name?: string) => string;",
            options: [{ after: true }]
        },
        {
            code: `
type Foo = {
    greet?: (name?: string) => string;
}
            `,
            options: [{ after: true }]
        },
        {
            code: "function foo(a?: string) {}",
            options: [{ after: true, before: false }]
        },
        {
            code: `
class Foo {
    name?: string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
class Foo {
    constructor(message?: string);
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
class Foo {
    greet(name?: string): string { return name; }
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
interface Foo {
    name?: string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
interface Foo {
    greet(name?: string): string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
type Foo = {
    name?: string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
type Foo = {
    greet(name?: string): string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: "type Foo = (name?: string)=> string;",
            options: [{ after: true, before: false }]
        },
        {
            code: `
type Foo = {
    greet?: (name?: string)=> string;
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: "function foo(a ?: string) {}",
            options: [{ after: true, before: true }]
        },
        {
            code: `
class Foo {
    name ?: string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
class Foo {
    constructor(message ?: string);
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
interface Foo {
    name ?: string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
interface Foo {
    greet(name ?: string) : string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
type Foo = {
    name ?: string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
type Foo = {
    greet(name ?: string) : string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: "type Foo = (name ?: string) => string;",
            options: [{ after: true, before: true }]
        },
        {
            code: `
type Foo = {
    greet ?: (name : string) => string;
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: "function foo(a ?:string) {}",
            options: [{ after: false, before: true }]
        },
        {
            code: `
class Foo {
    name ?:string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
class Foo {
    constructor(message ?:string);
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
class Foo {
    greet(name ?:string) :string { return name; }
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
interface Foo {
    name ?:string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
interface Foo {
    greet(name ?:string) :string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
type Foo = {
    name ?:string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
type Foo = {
    greet(name ?:string) :string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: "type Foo = (name ?:string) =>string;",
            options: [{ after: false, before: true }]
        },
        {
            code: `
type Foo = {
    greet :(name ?:string) =>string;
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: "function foo(a ?: string) {}",
            options: [{ before: true }]
        },
        {
            code: `
class Foo {
    name ?: string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
class Foo {
    constructor(message ?: string);
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
interface Foo {
    name ?: string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
interface Foo {
    greet(name ?: string) : string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
type Foo = {
    name ?: string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
type Foo = {
    greet(name ?: string) : string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: "type Foo = (name ?: string) => string;",
            options: [{ before: true }]
        },
        {
            code: `
type Foo = {
    greet : (name ?: string) => string;
}
            `,
            options: [{ before: true }]
        },
        {
            code: "function foo(a ?: string) {}",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
class Foo {
    name ?: string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message ?: string);
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
interface Foo {
    name ?: string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name ?: string) : string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
type Foo = {
    name ?: string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name ?: string) : string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: "type Foo = (name ?: string)=>string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: `
type Foo = {
    greet ?: (name ?: string)=>string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ]
        },
        {
            code: "type Foo = (name ?: string) => string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true,
                            after: true
                        }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    greet ?: (name ?: string) => string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true,
                            after: true
                        }
                    }
                }
            ]
        },
        {
            code: "type Foo = (name ?: string) =>string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true
                        }
                    }
                }
            ]
        },
        {
            code: `
type Foo = {
    greet : (name ?: string) =>string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true
                        }
                    }
                }
            ]
        },
        {
            code: `
interface Foo {
    thing?: { [key in string]?: number };
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
interface Foo {
    thing?: { [key in string]?: number };
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
interface Foo {
    thing ?: { [key in string] ?: number };
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
interface Foo {
    thing ?:{ [key in string] ?:number };
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
interface Foo {
    thing ?: { [key in string] ?: number };
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
type Foo = {
    thing?: { [key in string]?: number };
}
            `
        },
        {
            code: `
type Foo = {
    thing?: { [key in string]?: number };
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
type Foo = {
    thing?: { [key in string]?: number };
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
type Foo = {
    thing ?: { [key in string] ?: number };
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
type Foo = {
    thing ?:{ [key in string] ?:number };
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
type Foo = {
    thing ?: { [key in string] ?: number };
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
class Foo {
    greet: (name?: string) => void = {}
}
            `
        },
        {
            code: `
class Foo {
    greet: (name?: string) => void = {}
}
            `,
            options: [{ after: true }]
        },
        {
            code: `
class Foo {
    greet: (name?: string)=> void = {}
}
            `,
            options: [{ after: true, before: false }]
        },
        {
            code: `
class Foo {
    greet : (name ?: string) => void = {}
}
            `,
            options: [{ after: true, before: true }]
        },
        {
            code: `
class Foo {
    greet :(name ?:string) =>void = {}
}
            `,
            options: [{ after: false, before: true }]
        },
        {
            code: `
class Foo {
    greet : (name ?: string) => void = {}
}
            `,
            options: [{ before: true }]
        },
        {
            code: `
interface Foo { a?: string }
type Bar = Record<keyof Foo, string>
            `,
            options: [
                {
                    after: true,
                    before: false,
                    overrides: {
                        arrow: {
                            after: true,
                            before: true
                        }
                    }
                }
            ],
            parser: "typescript-eslint-parser"
        },
        `
interface resolve {
    resolver?: (() => PromiseLike<T>) | PromiseLike<T>;
}
        `
    ],
    invalid: [
        {
            code: "function foo(a ?: string) {}",
            output: "function foo(a?: string) {}",
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: `
class Foo {
    name ?: string;
}
            `,
            output: `
class Foo {
    name?: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message ?: string);
}
            `,
            output: `
class Foo {
    constructor(message?: string);
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 25
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
            `,
            output: `
class Foo {
    greet(name?: string): string { return name; }
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 27
                }
            ]
        },
        {
            code: `
interface Foo {
    name ?: string;
}
            `,
            output: `
interface Foo {
    name?: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name ?: string) : string;
}
            `,
            output: `
interface Foo {
    greet(name?: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 27
                }
            ]
        },
        {
            code: `
type Foo = {
    name ?: string;
}
            `,
            output: `
type Foo = {
    name?: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name ?: string) : string;
}
            `,
            output: `
type Foo = {
    greet(name?: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 27
                }
            ]
        },
        {
            code: "type Foo = (name ?: string) => string;",
            output: "type Foo = (name?: string) => string;",
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = (name ?: string)=> string;",
            output: "type Foo = (name?: string) => string;",
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 1,
                    column: 18
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 28
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name ?: string) => string;
}
            `,
            output: `
type Foo = {
    greet: (name?: string) => string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name ?: string)=> string;
}
            `,
            output: `
type Foo = {
    greet: (name?: string) => string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 28
                }
            ]
        },
        {
            code: "function foo(a ?: string) {}",
            options: [{ after: true }],
            output: "function foo(a?: string) {}",
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: `
class Foo {
    name ?: string;
}
            `,
            options: [{ after: true }],
            output: `
class Foo {
    name?: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message ?: string);
}
            `,
            options: [{ after: true }],
            output: `
class Foo {
    constructor(message?: string);
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 25
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
            `,
            options: [{ after: true }],
            output: `
class Foo {
    greet(name?: string): string { return name; }
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 27
                }
            ]
        },
        {
            code: `
interface Foo {
    name ?: string;
}
            `,
            options: [{ after: true }],
            output: `
interface Foo {
    name?: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name ?: string) : string;
}
            `,
            options: [{ after: true }],
            output: `
interface Foo {
    greet(name?: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 27
                }
            ]
        },
        {
            code: `
type Foo = {
    name ?: string;
}
            `,
            options: [{ after: true }],
            output: `
type Foo = {
    name?: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name ?: string) : string;
}
            `,
            options: [{ after: true }],
            output: `
type Foo = {
    greet(name?: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 27
                }
            ]
        },
        {
            code: "type Foo = (name ?: string) => string;",
            options: [{ after: true }],
            output: "type Foo = (name?: string) => string;",
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 1,
                    column: 18
                }
            ]
        },
        {
            code: "type Foo = (name ?: string)=> string;",
            options: [{ after: true }],
            output: "type Foo = (name?: string) => string;",
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 1,
                    column: 18
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 28
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name ?: string) => string;
}
            `,
            options: [{ after: true }],
            output: `
type Foo = {
    greet: (name?: string) => string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name ?: string)=> string;
}
            `,
            options: [{ after: true }],
            output: `
type Foo = {
    greet: (name?: string) => string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 28
                }
            ]
        },
        {
            code: "function foo(a ?: string) {}",
            options: [{ after: true, before: false }],
            output: "function foo(a?: string) {}",
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: `
class Foo {
    name ?: string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
class Foo {
    name?: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message ?: string);
}
            `,
            options: [{ after: true, before: false }],
            output: `
class Foo {
    constructor(message?: string);
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 25
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
            `,
            options: [{ after: true, before: false }],
            output: `
class Foo {
    greet(name?: string): string { return name; }
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 27
                }
            ]
        },
        {
            code: `
interface Foo {
    name ?: string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
interface Foo {
    name?: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name ?: string) : string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
interface Foo {
    greet(name?: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 27
                }
            ]
        },
        {
            code: `
type Foo = {
    name ?: string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
type Foo = {
    name?: string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name ?: string) : string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
type Foo = {
    greet(name?: string): string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Unexpected space before the ':'",
                    line: 3,
                    column: 27
                }
            ]
        },
        {
            code: "type Foo = (name ?: string) => string;",
            options: [{ after: true, before: false }],
            output: "type Foo = (name?: string)=> string;",
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 1,
                    column: 18
                },
                {
                    message: "Unexpected space before the '=>'",
                    line: 1,
                    column: 29
                }
            ]
        },
        {
            code: "type Foo = (name ?: string)=> string;",
            options: [{ after: true, before: false }],
            output: "type Foo = (name?: string)=> string;",
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name ?: string) => string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
type Foo = {
    greet: (name?: string)=> string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 18
                },
                {
                    message: "Unexpected space before the '=>'",
                    line: 3,
                    column: 29
                }
            ]
        },
        {
            code: `
type Foo = {
    greet: (name ?: string)=> string;
}
            `,
            options: [{ after: true, before: false }],
            output: `
type Foo = {
    greet: (name?: string)=> string;
}
            `,
            errors: [
                {
                    message: "Unexpected space before the '?:'",
                    line: 3,
                    column: 18
                }
            ]
        },
        {
            code: "function foo(a?:string) {}",
            options: [{ after: true, before: true }],
            output: "function foo(a ?: string) {}",
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 1,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: `
class Foo {
    name?:string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
class Foo {
    name ?: string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message?:string);
}
            `,
            options: [{ after: true, before: true }],
            output: `
class Foo {
    constructor(message ?: string);
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 25
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name?:string):string { return name; }
}
            `,
            options: [{ after: true, before: true }],
            output: `
class Foo {
    greet(name ?: string) : string { return name; }
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: `
interface Foo {
    name?:string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
interface Foo {
    name ?: string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name?:string):string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
interface Foo {
    greet(name ?: string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: `
type Foo = {
    name?:string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
type Foo = {
    name ?: string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name?:string):string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
type Foo = {
    greet(name ?: string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = (name?: string)=> string;",
            options: [{ after: true, before: true }],
            output: "type Foo = (name ?: string) => string;",
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 1,
                    column: 17
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 27
                }
            ]
        },
        {
            code: "type Foo = (name ?: string)=> string;",
            options: [{ after: true, before: true }],
            output: "type Foo = (name ?: string) => string;",
            errors: [
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 28
                }
            ]
        },
        {
            code: `
type Foo = {
    greet?: (name?: string)=> string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
type Foo = {
    greet ?: (name ?: string) => string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 10
                },
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 28
                }
            ]
        },
        {
            code: `
type Foo = {
    greet ?: (name ?: string)=> string;
}
            `,
            options: [{ after: true, before: true }],
            output: `
type Foo = {
    greet ?: (name ?: string) => string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 30
                }
            ]
        },
        {
            code: "function foo(a?:string) {}",
            options: [{ before: true }],
            output: "function foo(a ?: string) {}",
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 1,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: `
class Foo {
    name?:string;
}
            `,
            options: [{ before: true }],
            output: `
class Foo {
    name ?: string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message?:string);
}
            `,
            options: [{ before: true }],
            output: `
class Foo {
    constructor(message ?: string);
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 25
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name?:string):string { return name; }
}
            `,
            options: [{ before: true }],
            output: `
class Foo {
    greet(name ?: string) : string { return name; }
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: `
interface Foo {
    name?:string;
}
            `,
            options: [{ before: true }],
            output: `
interface Foo {
    name ?: string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name?:string):string;
}
            `,
            options: [{ before: true }],
            output: `
interface Foo {
    greet(name ?: string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: `
type Foo = {
    name?:string;
}
            `,
            options: [{ before: true }],
            output: `
type Foo = {
    name ?: string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name?:string):string;
}
            `,
            options: [{ before: true }],
            output: `
type Foo = {
    greet(name ?: string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = (name?: string)=> string;",
            options: [{ before: true }],
            output: "type Foo = (name ?: string) => string;",
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 1,
                    column: 17
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 27
                }
            ]
        },
        {
            code: "type Foo = (name : string)=> string;",
            options: [{ before: true }],
            output: "type Foo = (name : string) => string;",
            errors: [
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 27
                }
            ]
        },
        {
            code: `
type Foo = {
    greet?: (name?: string)=> string;
}
            `,
            options: [{ before: true }],
            output: `
type Foo = {
    greet ?: (name ?: string) => string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 10
                },
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 18
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 28
                }
            ]
        },
        {
            code: `
type Foo = {
    greet ?: (name ?: string)=> string;
}
            `,
            options: [{ before: true }],
            output: `
type Foo = {
    greet ?: (name ?: string) => string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 30
                }
            ]
        },
        {
            code: "function foo(a?:string) {}",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: "function foo(a ?: string) {}",
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 1,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 1,
                    column: 16
                }
            ]
        },
        {
            code: `
class Foo {
    name?:string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
class Foo {
    name ?: string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(message?:string);
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
class Foo {
    constructor(message ?: string);
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 25
                }
            ]
        },
        {
            code: `
class Foo {
    greet(name?:string):string { return name; }
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
class Foo {
    greet(name ?: string) : string { return name; }
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: `
interface Foo {
    name?:string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
interface Foo {
    name ?: string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
interface Foo {
    greet(name?:string):string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
interface Foo {
    greet(name ?: string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: `
type Foo = {
    name?:string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
type Foo = {
    name ?: string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 9
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
type Foo = {
    greet(name?:string):string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
type Foo = {
    greet(name ?: string) : string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 15
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 16
                },
                {
                    message: "Expected a space after the ':'",
                    line: 3,
                    column: 24
                },
                {
                    message: "Expected a space before the ':'",
                    line: 3,
                    column: 24
                }
            ]
        },
        {
            code: "type Foo = (name?:string)=>string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: "type Foo = (name ?: string)=>string;",
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 1,
                    column: 17
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 1,
                    column: 18
                }
            ]
        },
        {
            code: `
type Foo = {
    greet ?: (name?:string)=>string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            output: `
type Foo = {
    greet ?: (name ?: string)=>string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 19
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 20
                }
            ]
        },
        {
            code: "type Foo = (name?:string)=>string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true,
                            after: true
                        }
                    }
                }
            ],
            output: "type Foo = (name ?: string) => string;",
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 1,
                    column: 17
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 1,
                    column: 18
                },
                {
                    message: "Expected a space after the '=>'",
                    line: 1,
                    column: 26
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 1,
                    column: 26
                }
            ]
        },
        {
            code: `
type Foo = {
    greet ?: (name?:string)=>string;
}
            `,
            options: [
                {
                    before: false,
                    after: false,
                    overrides: {
                        colon: {
                            before: true,
                            after: true
                        },
                        arrow: {
                            before: true,
                            after: true
                        }
                    }
                }
            ],
            output: `
type Foo = {
    greet ?: (name ?: string) => string;
}
            `,
            errors: [
                {
                    message: "Expected a space before the '?:'",
                    line: 3,
                    column: 19
                },
                {
                    message: "Expected a space after the '?:'",
                    line: 3,
                    column: 20
                },
                {
                    message: "Expected a space after the '=>'",
                    line: 3,
                    column: 28
                },
                {
                    message: "Expected a space before the '=>'",
                    line: 3,
                    column: 28
                }
            ]
        }
    ]
});
