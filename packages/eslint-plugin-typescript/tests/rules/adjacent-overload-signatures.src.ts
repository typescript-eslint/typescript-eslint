function error(a: string);
function error(b: number);
function error(ab: string | number) { }
export { error };

import { connect } from 'react-redux';
export interface ErrorMessageModel { message: string; }
function mapStateToProps() { }
function mapDispatchToProps() { }
export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessage);

export const foo = "a", bar = "b";
export interface Foo { }
export class Foo { }

export interface Foo { }
export const foo = "a", bar = "b";
export class Foo { }

const foo = "a", bar = "b";
interface Foo { }
class Foo { }

interface Foo { }
const foo = "a", bar = "b";
class Foo { }

export class Foo { }
export class Bar { }
export type FooBar = Foo | Bar;

export interface Foo { }
export class Foo { }
export class Bar { }
export type FooBar = Foo | Bar;

export function foo(s: string);
export function foo(n: number);
export function foo(sn: string | number) { }
export function bar(): void { }
export function baz(): void { }

function foo(s: string);
function foo(n: number);
function foo(sn: string | number) { }
function bar(): void { }
function baz(): void { }

declare function foo(s: string);
declare function foo(n: number);
declare function foo(sn: string | number);
declare function bar(): void;
declare function baz(): void;

declare module "Foo" {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function foo(sn: string | number): void;
    export function bar(): void;
    export function baz(): void;
}

declare namespace Foo {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function foo(sn: string | number): void;
    export function bar(): void;
    export function baz(): void;
}

type Foo = {
    foo(s: string): void;
    foo(n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}

type Foo = {
    foo(s: string): void;
    ["foo"](n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}

interface Foo {
    (s: string): void;
    (n: number): void;
    (sn: string | number): void;
    foo(n: number): void;
    bar(): void;
    baz(): void;
}

interface Foo {
    foo(s: string): void;
    foo(n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}

interface Foo {
    foo(s: string): void;
    ["foo"](n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}

interface Foo {
    foo(): void;
    bar: {
        baz(s: string): void;
        baz(n: number): void;
        baz(sn: string | number): void;
    }
}

interface Foo {
    new(s: string);
    new(n: number);
    new(sn: string | number);
    foo(): void;
}

class Foo {
    constructor(s: string);
    constructor(n: number);
    constructor(sn: string | number) { }
    bar(): void { }
    baz(): void { }
}

class Foo {
    foo(s: string): void;
    foo(n: number): void;
    foo(sn: string | number): void { }
    bar(): void { }
    baz(): void { }
}

class Foo {
    foo(s: string): void;
    ["foo"](n: number): void;
    foo(sn: string | number): void { }
    bar(): void { }
    baz(): void { }
}

class Foo {
    name: string;
    foo(s: string): void;
    foo(n: number): void;
    foo(sn: string | number): void { }
    bar(): void { }
    baz(): void { }
}

// examples from https://github.com/nzakas/eslint-plugin-typescript/issues/138
export default function <T>(foo: T) { }
export default function named<T>(foo: T) { }

export function foo(s: string);
export function foo(n: number);
export function bar(): void { }
export function baz(): void { }
export function foo(sn: string | number) { }


export function foo(s: string);
export function foo(n: number);
export type bar = number;
export type baz = number | string;
export function foo(sn: string | number) { }


function foo(s: string);
function foo(n: number);
function bar(): void { }
function baz(): void { }
function foo(sn: string | number) { }


function foo(s: string);
function foo(n: number);
type bar = number;
type baz = number | string;
function foo(sn: string | number) { }

function foo(s: string) { }
function foo(n: number) { }
const a = "";
const b = "";
function foo(sn: string | number) { }

function foo(s: string) { }
function foo(n: number) { }
class Bar { }
function foo(sn: string | number) { }

function foo(s: string) { }
function foo(n: number) { }
function foo(sn: string | number) { }
class Bar {
    foo(s: string);
    foo(n: number);
    name: string;
    foo(sn: string | number) { }
}

declare function foo(s: string);
declare function foo(n: number);
declare function bar(): void;
declare function baz(): void;
declare function foo(sn: string | number);

declare function foo(s: string);
declare function foo(n: number);
const a = "";
const b = "";
declare function foo(sn: string | number);

declare module "Foo" {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function bar(): void;
    export function baz(): void;
    export function foo(sn: string | number): void;
}

declare module "Foo" {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function foo(sn: string | number): void;
    function baz(s: string): void;
    export function bar(): void;
    function baz(n: number): void;
    function baz(sn: string | number): void;
}

declare namespace Foo {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function bar(): void;
    export function baz(): void;
    export function foo(sn: string | number): void;
}

declare namespace Foo {
    export function foo(s: string): void;
    export function foo(n: number): void;
    export function foo(sn: string | number): void;
    function baz(s: string): void;
    export function bar(): void;
    function baz(n: number): void;
    function baz(sn: string | number): void;
}

type Foo = {
    foo(s: string): void;
    foo(n: number): void;
    bar(): void;
    baz(): void;
    foo(sn: string | number): void;
}

type Foo = {
    foo(s: string): void;
    ["foo"](n: number): void;
    bar(): void;
    baz(): void;
    foo(sn: string | number): void;
}

type Foo = {
    foo(s: string): void;
    name: string;
    foo(n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}

interface Foo {
    (s: string): void;
    foo(n: number): void;
    (n: number): void;
    (sn: string | number): void;
    bar(): void;
    baz(): void;
}

interface Foo {
    foo(s: string): void;
    foo(n: number): void;
    bar(): void;
    baz(): void;
    foo(sn: string | number): void;
}

interface Foo {
    foo(s: string): void;
    ["foo"](n: number): void;
    bar(): void;
    baz(): void;
    foo(sn: string | number): void;
}

interface Foo {
    foo(s: string): void;
    "foo"(n: number): void;
    bar(): void;
    baz(): void;
    foo(sn: string | number): void;
}

interface Foo {
    foo(s: string): void;
    name: string;
    foo(n: number): void;
    foo(sn: string | number): void;
    bar(): void;
    baz(): void;
}

interface Foo {
    foo(): void;
    bar: {
        baz(s: string): void;
        baz(n: number): void;
        foo(): void;
        baz(sn: string | number): void;
    }
}

interface Foo {
    new(s: string);
    new(n: number);
    foo(): void;
    bar(): void;
    new(sn: string | number);
}

interface Foo {
    new(s: string);
    foo(): void;
    new(n: number);
    bar(): void;
    new(sn: string | number);
}

class Foo {
    constructor(s: string);
    constructor(n: number);
    bar(): void { }
    baz(): void { }
    constructor(sn: string | number) { }
}

class Foo {
    foo(s: string): void;
    foo(n: number): void;
    bar(): void { }
    baz(): void { }
    foo(sn: string | number): void { }
}

class Foo {
    foo(s: string): void;
    ["foo"](n: number): void;
    bar(): void { }
    baz(): void { }
    foo(sn: string | number): void { }
}

class Foo {
    foo(s: string): void;
    "foo"(n: number): void;
    bar(): void { }
    baz(): void { }
    foo(sn: string | number): void { }
}

class Foo {
    constructor(s: string);
    name: string;
    constructor(n: number);
    constructor(sn: string | number) { }
    bar(): void { }
    baz(): void { }
}

class Foo {
    foo(s: string): void;
    name: string;
    foo(n: number): void;
    foo(sn: string | number): void { }
    bar(): void { }
    baz(): void { }
}
