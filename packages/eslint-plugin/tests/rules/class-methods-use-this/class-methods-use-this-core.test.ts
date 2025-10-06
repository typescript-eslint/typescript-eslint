/* eslint-disable @typescript-eslint/internal/plugin-test-formatting --
keeping eslint core formatting on purpose to make upstream diffing easier and so we don't need to edit line/cols */
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/class-methods-use-this';

const ruleTester = new RuleTester();

ruleTester.run('class-methods-use-this', rule, {
  invalid: [
    {
      code: 'class A { foo() {} }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          line: 1,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo() {/**this**/} }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          line: 1,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo() {var a = function () {this};} }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          line: 1,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo() {var a = function () {var b = function(){this}};} }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          line: 1,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo() {window.this} }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          line: 1,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: "class A { foo() {that.this = 'this';} }",
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          line: 1,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo() { () => undefined; } }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          line: 1,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo() {} bar() {} }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          line: 1,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ exceptMethods: ['bar'] }],
    },
    {
      code: 'class A { foo() {} hasOwnProperty() {} }',
      errors: [
        {
          column: 20,
          data: { name: "method 'hasOwnProperty'" },
          line: 1,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ exceptMethods: ['foo'] }],
    },
    {
      code: 'class A { [foo]() {} }',
      errors: [
        {
          column: 11,
          data: { name: 'method' },
          line: 1,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ exceptMethods: ['foo'] }],
    },
    {
      code: 'class A { #foo() { } foo() {} #bar() {} }',
      errors: [
        {
          column: 22,
          data: { name: "method 'foo'" },
          line: 1,
          messageId: 'missingThis',
        },
        {
          column: 31,
          data: { name: 'private method #bar' },
          line: 1,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [{ exceptMethods: ['#foo'] }],
    },
    {
      code: "class A { foo(){} 'bar'(){} 123(){} [`baz`](){} [a](){} [f(a)](){} get quux(){} set[a](b){} *quuux(){} }",
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          messageId: 'missingThis',
        },
        {
          column: 19,
          data: { name: "method 'bar'" },
          messageId: 'missingThis',
        },
        {
          column: 29,
          data: { name: "method '123'" },
          messageId: 'missingThis',
        },
        {
          column: 37,
          data: { name: "method 'baz'" },
          messageId: 'missingThis',
        },
        {
          column: 49,
          data: { name: 'method' },
          messageId: 'missingThis',
        },
        {
          column: 57,
          data: { name: 'method' },
          messageId: 'missingThis',
        },
        {
          column: 68,
          data: { name: "getter 'quux'" },
          messageId: 'missingThis',
        },
        {
          column: 81,
          data: { name: 'setter' },
          messageId: 'missingThis',
        },
        {
          column: 93,
          data: { name: "generator method 'quuux'" },
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo = function() {} }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          endColumn: 25,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { foo = () => {} }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          endColumn: 17,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { #foo = function() {} }',
      errors: [
        {
          column: 11,
          data: { name: 'private method #foo' },
          endColumn: 26,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { #foo = () => {} }',
      errors: [
        {
          column: 11,
          data: { name: 'private method #foo' },
          endColumn: 18,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { #foo() {} }',
      errors: [
        {
          column: 11,
          data: { name: 'private method #foo' },
          endColumn: 15,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { get #foo() {} }',
      errors: [
        {
          column: 11,
          data: { name: 'private getter #foo' },
          endColumn: 19,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { set #foo(x) {} }',
      errors: [
        {
          column: 11,
          data: { name: 'private setter #foo' },
          endColumn: 19,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { foo () { return class { foo = this }; } }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          endColumn: 15,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { foo () { return function () { foo = this }; } }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          endColumn: 15,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { foo () { return class { static { this; } } } }',
      errors: [
        {
          column: 11,
          data: { name: "method 'foo'" },
          endColumn: 15,
          messageId: 'missingThis',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
  ],
  valid: [
    {
      code: 'class A { constructor() {} }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo() {this} }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: "class A { foo() {this.bar = 'bar';} }",
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo() {bar(this);} }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A extends B { foo() {super.foo();} }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo() { if(true) { return this; } } }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { static foo() {} }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: '({ a(){} });',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo() { () => this; } }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: '({ a: function () {} });',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { foo() {this} bar() {} }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ exceptMethods: ['bar'] }],
    },
    {
      code: 'class A { "foo"() { } }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ exceptMethods: ['foo'] }],
    },
    {
      code: 'class A { 42() { } }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ exceptMethods: ['42'] }],
    },
    {
      code: 'class A { foo = function() {this} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { foo = () => {this} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { foo = () => {super.toString} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { static foo = function() {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { static foo = () => {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { #bar() {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [{ exceptMethods: ['#bar'] }],
    },
    {
      code: 'class A { foo = function () {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [{ enforceForClassFields: false }],
    },
    {
      code: 'class A { foo = () => {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [{ enforceForClassFields: false }],
    },
    {
      code: 'class A { foo() { return class { [this.foo] = 1 }; } }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { static {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
  ],
});
