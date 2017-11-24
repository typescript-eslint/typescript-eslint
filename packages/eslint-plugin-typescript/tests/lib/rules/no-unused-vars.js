/**
 * @fileoverview Prevent variables used in TypeScript being marked as unused
 * @author James Henry
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/no-unused-vars");
const ruleNoUnusedVars = require("eslint/lib/rules/no-unused-vars");
const RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {}
    },
    parser: "typescript-eslint-parser",
    rules: {
        "typescript/no-unused-vars": "error"
    }
});

ruleTester.defineRule("typescript/no-unused-vars", rule);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

ruleTester.run("no-unused-vars", ruleNoUnusedVars, {
    valid: [
        `
import { ClassDecoratorFactory } from 'decorators';
@ClassDecoratorFactory()
export class Foo {}
        `,
        `
import { ClassDecorator } from 'decorators';
@ClassDecorator
export class Foo {}
        `,
        `
import { AccessorDecoratorFactory } from 'decorators';
export class Foo {
    @AccessorDecoratorFactory(true)
    get bar() {}
}
        `,
        `
import { AccessorDecorator } from 'decorators';
export class Foo {
    @AccessorDecorator
    set bar() {}
}
        `,
        `
import { MethodDecoratorFactory } from 'decorators';
export class Foo {
    @MethodDecoratorFactory(false)
    bar() {}
}
        `,
        `
import { MethodDecorator } from 'decorators';
export class Foo {
    @MethodDecorator
    static bar() {}
}
        `,
        `
import { ConstructorParameterDecoratorFactory } from 'decorators';
export class Service {
    constructor(@ConstructorParameterDecoratorFactory(APP_CONFIG) config: AppConfig) {
        this.title = config.title;
    }
}
        `,
        `
import { ConstructorParameterDecorator } from 'decorators';
export class Foo {
   constructor(@ConstructorParameterDecorator bar) {
       this.bar = bar;
   }
}
        `,
        `
import { ParameterDecoratorFactory } from 'decorators';
export class Qux {
   bar(@ParameterDecoratorFactory(true) baz: number) {
       console.log(baz);
   }
}
        `,
        `
import { ParameterDecorator } from 'decorators';
export class Foo {
   static greet(@ParameterDecorator name: string) {
       return name;
   }
}
        `,
        `
import { Input, Output, EventEmitter } from 'decorators';
export class SomeComponent {
   @Input() data;
   @Output()
   click = new EventEmitter();
}
        `,
        `
import { configurable } from 'decorators';
export class A {
   @configurable(true) static prop1;

   @configurable(false)
   static prop2;
}
        `,
        `
import { foo, bar } from 'decorators';
export class B {
   @foo x;

   @bar
   y;
}
        `,
        `
interface Base {}
class Thing implements Base {}
new Thing()
		`,
        `
interface Base {}
const a: Base = {}
console.log(a);
        `,
        `
import { Foo } from 'foo'
function bar<T>() {}
bar<Foo>()
        `,
        `
import { Foo } from 'foo'
const bar = function <T>() {}
bar<Foo>()
        `,
        `
import { Foo } from 'foo'
const bar = <T>() => {}
bar<Foo>()
        `,
        `
import { Foo } from 'foo'
<Foo>(<T>() => {})()
        `,
        `
import { Nullable } from 'nullable';
const a: Nullable<string> = 'hello';
console.log(a);
		`,
        `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
const a: Nullable<SomeOther> = 'hello';
console.log(a);
		`,
        `
import { Nullable } from 'nullable';
const a: Nullable | undefined = 'hello';
console.log(a);
		`,
        `
import { Nullable } from 'nullable';
const a: Nullable & undefined = 'hello';
console.log(a);
		`,
        `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
const a: Nullable<SomeOther[]> = 'hello';
console.log(a);
		`,
        `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
const a: Nullable<Array<SomeOther>> = 'hello';
console.log(a);
		`,
        `
import { Nullable } from 'nullable';
const a: Array<Nullable> = 'hello';
console.log(a);
		`,
        `
import { Nullable } from 'nullable';
const a: Nullable[] = 'hello';
console.log(a);
		`,
        `
import { Nullable } from 'nullable';
const a: Array<Nullable[]> = 'hello';
console.log(a);
		`,
        `
import { Nullable } from 'nullable';
const a: Array<Array<Nullable>> = 'hello';
console.log(a);
		`,
        `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
const a: Array<Nullable<SomeOther>> = 'hello';
console.log(a);
		`,
        `
import { Nullable } from 'nullable';
import { Component } from 'react';
class Foo implements Component<Nullable>{};
new Foo();
		`,
        `
import { Nullable } from 'nullable';
import { Component } from 'react';
class Foo extends Component<Nullable, {}>{}
new Foo();
		`,
        `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Component } from 'react';
class Foo extends Component<Nullable<SomeOther>, {}>{}
new Foo();
		`,
        `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do = (a: Nullable<Another>) => { console.log(a); }
}
new A();
		`,
        `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do(a: Nullable<Another>) { console.log(a); }
}
new A();
		`,
        `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do(): Nullable<Another> { return null; }
}
new A();
		`,
        `
import { Nullable } from 'nullable';
import { Another } from 'some';
interface A {
    do(a: Nullable<Another>);
}
		`,
        `
import { Nullable } from 'nullable';
import { Another } from 'some';
interface A {
    other: Nullable<Another>;
}
		`,
        `
import { Nullable } from 'nullable';
function foo(a: Nullable) { console.log(a); }
foo();
		`,
        `
import { Nullable } from 'nullable';
function foo(): Nullable { return null; }
foo();
		`,
        `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
class A extends Nullable<SomeOther> {
    other: Nullable<Another>;
}
new A();
		`,
        `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
class A extends Nullable<SomeOther> {
    do(a: Nullable<Another>){ console.log(a); }
}
new A();
		`,
        `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
interface A extends Nullable<SomeOther> {
    other: Nullable<Another>;
}
		`,
        `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
interface A extends Nullable<SomeOther> {
    do(a: Nullable<Another>);
}
        `
    ],

    invalid: [
        {
            code: `
import { ClassDecoratorFactory } from 'decorators';
export class Foo {}
            `,
            errors: [
                {
                    message:
                        "'ClassDecoratorFactory' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        },
        {
            code: `
import { Foo, Bar } from 'foo';
function baz<Foo>() {}
baz<Bar>()
            `,
            errors: [
                {
                    message: "'Foo' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        },
        {
            code: `
import { Nullable } from 'nullable';
const a: string = 'hello';
console.log(a);
            `,
            errors: [
                {
                    message: "'Nullable' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        },
        {
            code: `
import { Nullable } from 'nullable';
import { SomeOther } from 'other';
const a: Nullable<string> = 'hello';
console.log(a);
            `,
            errors: [
                {
                    message: "'SomeOther' is defined but never used.",
                    line: 3,
                    column: 10
                }
            ]
        },

        {
            code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do = (a: Nullable) => { console.log(a); }
}
new A();
            `,
            errors: [
                {
                    message: "'Another' is defined but never used.",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do(a: Nullable) { console.log(a); }
}
new A();
            `,
            errors: [
                {
                    message: "'Another' is defined but never used.",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
class A {
    do(): Nullable { return null; }
}
new A();
            `,
            errors: [
                {
                    message: "'Another' is defined but never used.",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
interface A {
    do(a: Nullable);
}
            `,
            errors: [
                {
                    message: "'Another' is defined but never used.",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
import { Nullable } from 'nullable';
import { Another } from 'some';
interface A {
    other: Nullable;
}
            `,
            errors: [
                {
                    message: "'Another' is defined but never used.",
                    line: 3,
                    column: 10
                }
            ]
        },
        {
            code: `
import { Nullable } from 'nullable';
function foo(a: string) { console.log(a); }
foo();
            `,
            errors: [
                {
                    message: "'Nullable' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        },
        {
            code: `
import { Nullable } from 'nullable';
function foo(): string | null { return null; }
foo();
            `,
            errors: [
                {
                    message: "'Nullable' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        },
        {
            code: `
import { Nullable } from 'nullable';
import { SomeOther } from 'some';
import { Another } from 'some';
class A extends Nullable {
    other: Nullable<Another>;
}
new A();
            `,
            errors: [
                {
                    message: "'SomeOther' is defined but never used.",
                    line: 3,
                    column: 10
                }
            ]
        }
    ]
});
