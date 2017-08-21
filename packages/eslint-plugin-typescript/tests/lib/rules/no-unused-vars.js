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
        }
    ]
});
