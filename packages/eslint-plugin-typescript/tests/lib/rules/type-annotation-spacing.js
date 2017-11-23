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

const ruleTester = new RuleTester();

ruleTester.run("type-annotation-spacing", rule, {
    valid: [
        {
            code: `
interface resolve {
    resolver: (() => PromiseLike<T>) | PromiseLike<T>;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: "const foo = {} as Foo;",
            parser: "typescript-eslint-parser"
        },
        {
            code: "let foo: string;",
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(): void {}",
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(a: string) {}",
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    name: string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    constructor(message: string);
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet(): string { return "hello"; }
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet(name: string): string { return name; }
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet(): string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet(name: string): string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    thing: { [key in string]: number };
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet(): string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet(name: string): string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = (name: string) => string;",
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet: (name: string) => string;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: "let foo: string;",
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(): string {}",
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(a: string) {}",
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    name: string;
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    constructor(message: string);
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet(): string { return "hello"; }
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet(name: string): string { return name; }
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string;
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet(): string;
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet(name: string): string;
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string;
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet(): string;
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet(name: string): string;
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = (name: string) => string;",
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet: (name: string) => string;
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "let foo: string;",
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(): string {}",
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(a: string) {}",
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    name: string;
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    constructor(message: string);
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet(): string { return "hello"; }
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet(name: string): string { return name; }
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name: string;
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet(): string;
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet(name: string): string;
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name: string;
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet(): string;
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet(name: string): string;
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = (name: string)=> string;",
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet: (name: string)=> string;
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "let foo : string;",
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo() : string {}",
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(a : string) {}",
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    name : string;
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    constructor(message : string);
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet() : string { return "hello"; }
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet(name : string) : string { return name; }
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name : string;
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet() : string;
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet(name : string) : string;
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name : string;
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet() : string;
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet(name : string) : string;
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = (name : string) => string;",
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet : (name : string) => string;
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "let foo :string;",
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo() :string {}",
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(a :string) {}",
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    name :string;
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    constructor(message :string);
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet() :string { return "hello"; }
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet(name :string) :string { return name; }
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name :string;
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet() :string;
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet(name :string) :string;
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name :string;
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet() :string;
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet(name :string) :string;
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = (name :string) =>string;",
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet :(name :string) =>string;
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "let foo : string;",
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo() : string {}",
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(a : string) {}",
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    name : string;
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    constructor(message : string);
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet() : string { return "hello"; }
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet(name : string) : string { return name; }
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    name : string;
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet() : string;
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    greet(name : string) : string;
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    name : string;
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet() : string;
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet(name : string) : string;
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = (name : string) => string;",
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    greet : (name : string) => string;
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "let foo : string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo() : string {}",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "function foo(a : string) {}",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: "type Foo = (name : string)=>string;",
            options: [
                {
                    before: false,
                    after: false,
                    overrides: { colon: { before: true, after: true } }
                }
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
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
            ],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    thing: { [key in string]: number };
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    thing: { [key in string]: number };
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    thing : { [key in string] : number };
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    thing :{ [key in string] :number };
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    thing : { [key in string] : number };
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    thing: { [key in string]: number };
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    thing: { [key in string]: number };
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    thing: { [key in string]: number };
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    thing : { [key in string] : number };
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    thing :{ [key in string] :number };
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    thing : { [key in string] : number };
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet: (name: string) => void = {}
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet: (name: string) => void = {}
}
            `,
            options: [{ after: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet: (name: string)=> void = {}
}
            `,
            options: [{ after: true, before: false }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet : (name : string) => void = {}
}
            `,
            options: [{ after: true, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet :(name :string) =>void = {}
}
            `,
            options: [{ after: false, before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    greet : (name : string) => void = {}
}
            `,
            options: [{ before: true }],
            parser: "typescript-eslint-parser"
        },
        {
            code: "let resolver: (() => PromiseLike<T>) | PromiseLike<T>;",
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface resolve {
    resolver: (() => PromiseLike<T>) | PromiseLike<T>;
}
            `,
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: "let foo : string;",
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
            parser: "typescript-eslint-parser",
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
