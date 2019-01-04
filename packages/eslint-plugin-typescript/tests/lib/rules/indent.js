/**
 * @fileoverview Check internal rule
 * @author Armano <https://github.com/armano2>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/indent"),
    RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {},
    },
    parser: "typescript-eslint-parser",
});

ruleTester.run("indent", rule, {
    valid: [
        `
@Component({
    components: {
        ErrorPage: () => import('@/components/ErrorPage.vue'),
    },
    head: {
        titleTemplate(title) {
            if (title) {
                return \`test\`
            }
            return 'Title'
        },
        htmlAttrs: {
            lang: 'en',
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        ],
    },
})
export default class App extends Vue
{
    get error()
    {
        return this.$store.state.errorHandler.error
    }
}
        `,
        // https://github.com/eslint/typescript-eslint-parser/issues/474
        `
/**
 * @param {string} name
 * @param {number} age
 * @returns {string}
 */
function foo(name: string, age: number): string {}
        `,
        `
const firebaseApp = firebase.apps.length
    ? firebase.app()
    : firebase.initializeApp({
        apiKey: __FIREBASE_API_KEY__,
        authDomain: __FIREBASE_AUTH_DOMAIN__,
        databaseURL: __FIREBASE_DATABASE_URL__,
        projectId: __FIREBASE_PROJECT_ID__,
        storageBucket: __FIREBASE_STORAGE_BUCKET__,
        messagingSenderId: __FIREBASE_MESSAGING_SENDER_ID__,
    })
        `,
        // https://github.com/bradzacher/eslint-plugin-typescript/issues/271
        {
            code: `
const foo = {
                a: 1,
                b: 2
            },
            bar = 1;
            `,
            options: [4, { VariableDeclarator: { const: 3 } }],
        },
        {
            code: `
const foo : Foo = {
                a: 1,
                b: 2
            },
            bar = 1;
            `,
            options: [4, { VariableDeclarator: { const: 3 } }],
        },
    ],
    invalid: [
        {
            code: `
type Foo = {
bar : string,
age : number,
}
            `,
            output: `
type Foo = {
    bar : string,
    age : number,
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
            ],
        },
        {
            code: `
interface Foo {
bar : string,
age : number,
foo(): boolean,
baz(
asdf: string,
): boolean,
new(): Foo,
new(
asdf: string,
): Foo,
}
            `,
            output: `
interface Foo {
    bar : string,
    age : number,
    foo(): boolean,
    baz(
        asdf: string,
    ): boolean,
    new(): Foo,
    new(
        asdf: string,
    ): Foo,
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 5,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 6,
                    column: 1,
                },
                {
                    message: `Expected indentation of 8 spaces but found 0.`,
                    line: 7,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 8,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 9,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 10,
                    column: 1,
                },
                {
                    message: `Expected indentation of 8 spaces but found 0.`,
                    line: 11,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 12,
                    column: 1,
                },
            ],
        },
        {
            code: `
interface Foo {
bar : {
baz : string,
},
age : number,
}
            `,
            output: `
interface Foo {
    bar : {
        baz : string,
    },
    age : number,
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 8 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 5,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 6,
                    column: 1,
                },
            ],
        },
        {
            code: `
interface Foo extends Bar {
bar : string,
age : number,
}
            `,
            output: `
interface Foo extends Bar {
    bar : string,
    age : number,
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
            ],
        },
        // this is just to show how eslint handles class with extends on a new line so we can keep the interface indent
        // handling the same
        {
            code: `
class Foo
extends Bar {
bar : string = "asdf";
age : number = 1;
}
            `,
            output: `
class Foo
    extends Bar {
    bar : string = "asdf";
    age : number = 1;
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 5,
                    column: 1,
                },
            ],
        },
        {
            code: `
interface Foo
extends Bar {
bar : string,
age : number,
}
            `,
            output: `
interface Foo
    extends Bar {
    bar : string,
    age : number,
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 5,
                    column: 1,
                },
            ],
        },
        {
            code: `
const foo : Foo<{
bar : string,
age : number,
}>
            `,
            output: `
const foo : Foo<{
    bar : string,
    age : number,
}>
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
            ],
        },
        {
            code: `
type T = {
bar : string,
age : number,
} | {
bar : string,
age : number,
}
            `,
            output: `
type T = {
    bar : string,
    age : number,
} | {
    bar : string,
    age : number,
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 6,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 7,
                    column: 1,
                },
            ],
        },
        {
            code: `
type T =
    | {
bar : string,
age : number,
}
    | {
    bar : string,
    age : number,
}
            `,
            output: `
type T =
    | {
        bar : string,
        age : number,
    }
    | {
        bar : string,
        age : number,
    }
            `,
            errors: [
                {
                    message: `Expected indentation of 8 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
                {
                    message: `Expected indentation of 8 spaces but found 0.`,
                    line: 5,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 6,
                    column: 1,
                },
                {
                    message: `Expected indentation of 8 spaces but found 4.`,
                    line: 8,
                    column: 1,
                },
                {
                    message: `Expected indentation of 8 spaces but found 4.`,
                    line: 9,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 10,
                    column: 1,
                },
            ],
        },
        {
            code: `
    import Dialogs = require("widgets/Dialogs");
            `,
            output: `
import Dialogs = require("widgets/Dialogs");
            `,
            errors: [
                {
                    message: `Expected indentation of 0 spaces but found 4.`,
                    line: 2,
                    column: 1,
                },
            ],
        },
        {
            code: `
class Foo {
public bar : string;
private bar : string;
protected bar : string;
abstract bar : string;
foo : string;
constructor() {
const foo = "";
}
constructor(
asdf : number,
private test : boolean,
) {}
}
            `,
            output: `
class Foo {
    public bar : string;
    private bar : string;
    protected bar : string;
    abstract bar : string;
    foo : string;
    constructor() {
        const foo = "";
    }
    constructor(
        asdf : number,
        private test : boolean,
    ) {}
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 5,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 6,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 7,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 8,
                    column: 1,
                },
                {
                    message: `Expected indentation of 8 spaces but found 0.`,
                    line: 9,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 10,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 11,
                    column: 1,
                },
                {
                    message: `Expected indentation of 8 spaces but found 0.`,
                    line: 12,
                    column: 1,
                },
                {
                    message: `Expected indentation of 8 spaces but found 0.`,
                    line: 13,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 14,
                    column: 1,
                },
            ],
        },
        {
            code: `
    abstract class Foo {}
    class Foo {}
            `,
            output: `
abstract class Foo {}
class Foo {}
            `,
            errors: [
                {
                    message: `Expected indentation of 0 spaces but found 4.`,
                    line: 2,
                    column: 1,
                },
                {
                    message: `Expected indentation of 0 spaces but found 4.`,
                    line: 3,
                    column: 1,
                },
            ],
        },
        {
            code: `
enum Foo {
bar,
baz = 1,
buzz = '',
}
            `,
            output: `
enum Foo {
    bar,
    baz = 1,
    buzz = '',
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 5,
                    column: 1,
                },
            ],
        },
        {
            code: `
const enum Foo {
bar,
baz = 1,
buzz = '',
}
            `,
            output: `
const enum Foo {
    bar,
    baz = 1,
    buzz = '',
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 5,
                    column: 1,
                },
            ],
        },
        {
            code: `
    export = Foo;
            `,
            output: `
export = Foo;
            `,
            errors: [
                {
                    message: `Expected indentation of 0 spaces but found 4.`,
                    line: 2,
                    column: 1,
                },
            ],
        },
        {
            code: `
    declare function h(x: number): number;
            `,
            output: `
declare function h(x: number): number;
            `,
            errors: [
                {
                    message: `Expected indentation of 0 spaces but found 4.`,
                    line: 2,
                    column: 1,
                },
            ],
        },
        {
            code: `
declare function h(
x: number,
): number;
            `,
            output: `
declare function h(
    x: number,
): number;
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
            ],
        },
        {
            code: `
namespace Validation {
export interface StringValidator {
isAcceptable(s: string): boolean;
}
}
            `,
            output: `
namespace Validation {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 8 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 5,
                    column: 1,
                },
            ],
        },
        {
            code: `
declare module "Validation" {
export interface StringValidator {
isAcceptable(s: string): boolean;
}
}
            `,
            output: `
declare module "Validation" {
    export interface StringValidator {
        isAcceptable(s: string): boolean;
    }
}
            `,
            errors: [
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 3,
                    column: 1,
                },
                {
                    message: `Expected indentation of 8 spaces but found 0.`,
                    line: 4,
                    column: 1,
                },
                {
                    message: `Expected indentation of 4 spaces but found 0.`,
                    line: 5,
                    column: 1,
                },
            ],
        },
    ],
});
