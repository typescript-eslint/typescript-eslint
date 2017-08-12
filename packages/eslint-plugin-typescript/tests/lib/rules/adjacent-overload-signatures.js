/**
 * @fileoverview Enforces member overloads to be consecutive.
 * @author Patricio Trevino
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/adjacent-overload-signatures"),
    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

ruleTester.run("adjacent-overload-signatures", rule, {
    valid: [
        {
            code: `
function foo(s: string) {}
function foo(n: number) {}
function foo(sn: string | number) {}
function bar(): void {}
function baz(): void {}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
declare function foo(s: string);
declare function foo(n: number);
declare function foo(sn: string | number);
declare function bar(): void;
declare function baz(): void;
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
declare module "Foo" {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function foo(sn: string | number): void;
    export function bar(): void;
    export function baz(): void;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
declare namespace Foo {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function foo(sn: string | number): void;
    export function bar(): void;
    export function baz(): void;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    foo(s: string): void;
    foo(n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
type Foo = {
    foo(s: string): void;
    ["foo"](n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    (s: string): void;
    (n: number): void;
    (sn: string | number): void;
    foo(n: number): void;
    bar(): void;
    baz(): void;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    foo(s: string): void;
    foo(n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    foo(s: string): void;
    ["foo"](n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
interface Foo {
    foo(): void;
    bar: {
        baz(s: string): void;
        baz(n: number): void;
        baz(sn: string | number): void;
    }
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    constructor(s: string);
    constructor(n: number);
    constructor(sn: string | number) {}
    bar(): void {}
    baz(): void {}
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    foo(s: string): void;
    foo(n: number): void;
    foo(sn: string | number): void {}
    bar(): void {}
    baz(): void {}
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    foo(s: string): void;
    ["foo"](n: number): void;
    foo(sn: string | number): void {}
    bar(): void {}
    baz(): void {}
}
            `,
            parser: "typescript-eslint-parser"
        },
        {
            code: `
class Foo {
    name: string;
    foo(s: string): void;
    foo(n: number): void;
    foo(sn: string | number): void {}
    bar(): void {}
    baz(): void {}
}
            `,
            parser: "typescript-eslint-parser"
        }
    ],
    invalid: [
        {
            code: `
function foo(s: string) {}
function foo(n: number) {}
function bar(): void {}
function baz(): void {}
function foo(sn: string | number) {}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 6,
                    column: 1
                }
            ]
        },
        {
            code: `
function foo(s: string) {}
function foo(n: number) {}
const a = "";
const b = "";
function foo(sn: string | number) {}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 6,
                    column: 1
                }
            ]
        },
        {
            code: `
declare function foo(s: string);
declare function foo(n: number);
declare function bar(): void;
declare function baz(): void;
declare function foo(sn: string | number);
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 6,
                    column: 1
                }
            ]
        },
        {
            code: `
declare function foo(s: string);
declare function foo(n: number);
const a = "";
const b = "";
declare function foo(sn: string | number);
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 6,
                    column: 1
                }
            ]
        },
        {
            code: `
declare module "Foo" {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function bar(): void;
    export function baz(): void;    
    export function foo(sn: string | number): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 7,
                    column: 5
                }
            ]
        },
        {
            code: `
declare module "Foo" {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function foo(sn: string | number): void;
    function baz(s: string): void;
    export function bar(): void;
    function baz(n: number): void;
    function baz(sn: string | number): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'baz' signatures should be adjacent",
                    line: 8,
                    column: 5
                }
            ]
        },
        {
            code: `
declare namespace Foo {
    export function foo(s: string): void;    
    export function foo(n: number): void;
    export function bar(): void;
    export function baz(): void;
    export function foo(sn: string | number): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 7,
                    column: 5
                }
            ]
        },
        {
            code: `
declare namespace Foo {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function foo(sn: string | number): void;
    function baz(s: string): void;
    export function bar(): void;
    function baz(n: number): void;
    function baz(sn: string | number): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'baz' signatures should be adjacent",
                    line: 8,
                    column: 5
                }
            ]
        },
        {
            code: `
type Foo = {
    foo(s: string): void;
    foo(n: number): void;
    bar(): void;
    baz(): void;
    foo(sn: string | number): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 7,
                    column: 5
                }
            ]
        },
        {
            code: `
type Foo = {
    foo(s: string): void;
    ["foo"](n: number): void;
    bar(): void;
    baz(): void;
    foo(sn: string | number): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 7,
                    column: 5
                }
            ]
        },
        {
            code: `
type Foo = {
    foo(s: string): void;
    name: string;
    foo(n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 5,
                    column: 5
                }
            ]
        },
        {
            code: `
interface Foo {
    (s: string): void;
    foo(n: number): void;
    (n: number): void;
    (sn: string | number): void;
    bar(): void;
    baz(): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'call' signatures should be adjacent",
                    line: 5,
                    column: 5
                }
            ]
        },
        {
            code: `
interface Foo {
    foo(s: string): void;
    foo(n: number): void;
    bar(): void;
    baz(): void;
    foo(sn: string | number): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 7,
                    column: 5
                }
            ]
        },
        {
            code: `
interface Foo {
    foo(s: string): void;
    ["foo"](n: number): void;
    bar(): void;
    baz(): void;
    foo(sn: string | number): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 7,
                    column: 5
                }
            ]
        },
        {
            code: `
interface Foo {
    foo(s: string): void;
    "foo"(n: number): void;
    bar(): void;
    baz(): void;
    foo(sn: string | number): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 7,
                    column: 5
                }
            ]
        },
        {
            code: `
interface Foo {
    foo(s: string): void;
    name: string;
    foo(n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 5,
                    column: 5
                }
            ]
        },
        {
            code: `
interface Foo {
    foo(): void;
    bar: {
        baz(s: string): void;
        baz(n: number): void;
        foo(): void;
        baz(sn: string | number): void;
    }
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'baz' signatures should be adjacent",
                    line: 8,
                    column: 9
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(s: string);
    constructor(n: number);
    bar(): void {}
    baz(): void {}
    constructor(sn: string | number) {}
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'constructor' signatures should be adjacent",
                    line: 7,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    foo(s: string): void;
    foo(n: number): void;
    bar(): void {}
    baz(): void {}
    foo(sn: string | number): void {}
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 7,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    foo(s: string): void;
    ["foo"](n: number): void;
    bar(): void {}
    baz(): void {}
    foo(sn: string | number): void {}
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 7,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    foo(s: string): void;
    "foo"(n: number): void;
    bar(): void {}
    baz(): void {}
    foo(sn: string | number): void {}
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 7,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    constructor(s: string);
    name: string;
    constructor(n: number);
    constructor(sn: string | number) {}
    bar(): void {}
    baz(): void {}
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'constructor' signatures should be adjacent",
                    line: 5,
                    column: 5
                }
            ]
        },
        {
            code: `
class Foo {
    foo(s: string): void;
    name: string;
    foo(n: number): void;
    foo(sn: string | number): void {}
    bar(): void {}
    baz(): void {}
}
            `,
            parser: "typescript-eslint-parser",
            errors: [
                {
                    message: "All 'foo' signatures should be adjacent",
                    line: 5,
                    column: 5
                }
            ]
        }
    ]
});
