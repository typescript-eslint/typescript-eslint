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

const parser = "typescript-eslint-parser";

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {}
    },
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
        {
            code: [
                "import { ClassDecoratorFactory } from 'decorators'",
                "@ClassDecoratorFactory()",
                "export class Foo {}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { ClassDecorator } from 'decorators'",
                "@ClassDecorator",
                "export class Foo {}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { AccessorDecoratorFactory } from 'decorators'",
                "export class Foo {",
                "   @AccessorDecoratorFactory(true)",
                "   get bar() {}",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { AccessorDecorator } from 'decorators'",
                "export class Foo {",
                "   @AccessorDecorator",
                "   set bar() {}",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { MethodDecoratorFactory } from 'decorators'",
                "export class Foo {",
                "   @MethodDecoratorFactory(false)",
                "   bar() {}",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { MethodDecorator } from 'decorators'",
                "export class Foo {",
                "   @MethodDecorator",
                "   static bar() {}",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { ConstructorParameterDecoratorFactory } from 'decorators'",
                "export class Service {",
                "   constructor(@ConstructorParameterDecoratorFactory(APP_CONFIG) config: AppConfig) {",
                "       this.title = config.title;",
                "   }",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { ConstructorParameterDecorator } from 'decorators'",
                "export class Foo {",
                "   constructor(@ConstructorParameterDecorator bar) {",
                "       this.bar = bar;",
                "   }",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { ParameterDecoratorFactory } from 'decorators'",
                "export class Qux {",
                "   bar(@ParameterDecoratorFactory(true) baz: number) {",
                "       console.log(baz);",
                "   }",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { ParameterDecorator } from 'decorators'",
                "export class Foo {",
                "   static greet(@ParameterDecorator name: string) {",
                "       return name;",
                "   }",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Input, Output, EventEmitter } from 'decorators'",
                "export class SomeComponent {",
                "   @Input() data;",
                "   @Output()",
                "   click = new EventEmitter();",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { configurable } from 'decorators'",
                "export class A {",
                "   @configurable(true) static prop1;",
                "                                    ",
                "   @configurable(false)",
                "   static prop2;",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { foo, bar } from 'decorators'",
                "export class B {",
                "   @foo x;",
                "                ",
                "   @bar",
                "   y;",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "interface Base {}",
                "class Thing implements Base {}",
                "new Thing()"
            ].join("\n"),
            parser
        },
        {
            code: [
                "interface Base {}",
                "const a: Base = {}",
                "console.log(a);"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Foo } from 'foo'",
                "function bar<T>() {}",
                "bar<Foo>()"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Foo } from 'foo'",
                "const bar = function <T>() {}",
                "bar<Foo>()"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Foo } from 'foo'",
                "const bar = <T>() => {}",
                "bar<Foo>()"
            ].join("\n"),
            parser
        },
        {
            code: ["import { Foo } from 'foo'", "<Foo>(<T>() => {})()"].join(
                "\n"
            ),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "const a: Nullable<string> = 'hello'",
                "console.log(a)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { SomeOther } from 'other'",
                "const a: Nullable<SomeOther> = 'hello'",
                "console.log(a)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "const a: Nullable | undefined = 'hello'",
                "console.log(a)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "const a: Nullable & undefined = 'hello'",
                "console.log(a)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { SomeOther } from 'other'",
                "const a: Nullable<SomeOther[]> = 'hello'",
                "console.log(a)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { SomeOther } from 'other'",
                "const a: Nullable<Array<SomeOther>> = 'hello'",
                "console.log(a)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "const a: Array<Nullable> = 'hello'",
                "console.log(a)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "const a: Nullable[] = 'hello'",
                "console.log(a)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "const a: Array<Nullable[]> = 'hello'",
                "console.log(a)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "const a: Array<Array<Nullable>> = 'hello'",
                "console.log(a)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { SomeOther } from 'other'",
                "const a: Array<Nullable<SomeOther>> = 'hello'",
                "console.log(a)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Component } from 'react'",
                "class Foo implements Component<Nullable>{}",
                "new Foo()"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Component } from 'react'",
                "class Foo extends Component<Nullable, {}>{}",
                "new Foo()"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { SomeOther } from 'some'",
                "import { Component } from 'react'",
                "class Foo extends Component<Nullable<SomeOther>, {}>{}",
                "new Foo()"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Another } from 'some'",
                "class A {",
                "    do = (a: Nullable<Another>) => { console.log(a); }",
                "}",
                "new A();"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Another } from 'some'",
                "class A {",
                "    do(a: Nullable<Another>) { console.log(a); }",
                "}",
                "new A();"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Another } from 'some'",
                "class A {",
                "    do(): Nullable<Another> { return null; }",
                "}",
                "new A();"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Another } from 'some'",
                "interface A {",
                "    do(a: Nullable<Another>);",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Another } from 'some'",
                "interface A {",
                "    other: Nullable<Another>;",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "function foo(a: Nullable) { console.log(a); }",
                "foo()"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "function foo(): Nullable { return null; }",
                "foo()"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "const foo = ({ nullable }: Nullable) => nullable",
                "foo({ nullable: null })"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { ReproInterface } from 'ReproInterface'",
                "const x = ({ a = null } : { a: ReproInterface }) => a",
                "console.log(x)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { SomeOther } from 'some'",
                "import { Another } from 'some'",
                "class A extends Nullable<SomeOther> {",
                "    other: Nullable<Another>;",
                "}",
                "new A();"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { SomeOther } from 'some'",
                "import { Another } from 'some'",
                "class A extends Nullable<SomeOther> {",
                "    do(a: Nullable<Another>){ console.log(a); }",
                "}",
                "new A();"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { SomeOther } from 'some'",
                "import { Another } from 'some'",
                "interface A extends Nullable<SomeOther> {",
                "    other: Nullable<Another>;",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { SomeOther } from 'some'",
                "import { Another } from 'some'",
                "interface A extends Nullable<SomeOther> {",
                "    do(a: Nullable<Another>);",
                "}"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import Foo from 'foo'",
                "const bar: Foo.Bar = null",
                "console.log(bar)"
            ].join("\n"),
            parser
        },
        {
            code: [
                "import Foo from 'foo'",
                "const baz: Foo.Bar.Baz = null",
                "console.log(baz)"
            ].join("\n"),
            parser
        }
    ],

    invalid: [
        {
            code: [
                "import { ClassDecoratorFactory } from 'decorators'",
                "export class Foo {}"
            ].join("\n"),
            parser,
            errors: [
                {
                    message:
                        "'ClassDecoratorFactory' is defined but never used.",
                    line: 1,
                    column: 10
                }
            ]
        },
        {
            code: [
                "import { Foo, Bar } from 'foo';",
                "function baz<Foo>() {}",
                "baz<Bar>()"
            ].join("\n"),
            parser,
            errors: [
                {
                    message: "'Foo' is defined but never used.",
                    line: 1,
                    column: 10
                }
            ]
        },
        {
            code: [
                "import { Nullable } from 'nullable';",
                "const a: string = 'hello';",
                "console.log(a);"
            ].join("\n"),
            parser,
            errors: [
                {
                    message: "'Nullable' is defined but never used.",
                    line: 1,
                    column: 10
                }
            ]
        },
        {
            code: [
                "import { Nullable } from 'nullable';",
                "import { SomeOther } from 'other';",
                "const a: Nullable<string> = 'hello';",
                "console.log(a);"
            ].join("\n"),
            parser,
            errors: [
                {
                    message: "'SomeOther' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        },

        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Another } from 'some'",
                "class A {",
                "    do = (a: Nullable) => { console.log(a); }",
                "}",
                "new A();"
            ].join("\n"),
            parser,
            errors: [
                {
                    message: "'Another' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Another } from 'some'",
                "class A {",
                "    do(a: Nullable) { console.log(a); }",
                "}",
                "new A();"
            ].join("\n"),
            parser,
            errors: [
                {
                    message: "'Another' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Another } from 'some'",
                "class A {",
                "    do(): Nullable { return null; }",
                "}",
                "new A();"
            ].join("\n"),
            parser,
            errors: [
                {
                    message: "'Another' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Another } from 'some'",
                "interface A {",
                "    do(a: Nullable);",
                "}"
            ].join("\n"),
            parser,
            errors: [
                {
                    message: "'Another' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { Another } from 'some'",
                "interface A {",
                "    other: Nullable;",
                "}"
            ].join("\n"),
            parser,
            errors: [
                {
                    message: "'Another' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "function foo(a: string) { console.log(a); }",
                "foo()"
            ].join("\n"),
            parser,
            errors: [
                {
                    message: "'Nullable' is defined but never used.",
                    line: 1,
                    column: 10
                }
            ]
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "function foo(): string | null { return null; }",
                "foo()"
            ].join("\n"),
            parser,
            errors: [
                {
                    message: "'Nullable' is defined but never used.",
                    line: 1,
                    column: 10
                }
            ]
        },
        {
            code: [
                "import { Nullable } from 'nullable'",
                "import { SomeOther } from 'some'",
                "import { Another } from 'some'",
                "class A extends Nullable {",
                "    other: Nullable<Another>;",
                "}",
                "new A();"
            ].join("\n"),
            parser,
            errors: [
                {
                    message: "'SomeOther' is defined but never used.",
                    line: 2,
                    column: 10
                }
            ]
        }
    ]
});
