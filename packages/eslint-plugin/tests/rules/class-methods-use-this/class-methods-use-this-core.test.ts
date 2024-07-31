/* eslint-disable @typescript-eslint/internal/plugin-test-formatting --
keeping eslint core formatting on purpose to make upstream diffing easier and so we don't need to edit line/cols */
import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../../src/rules/class-methods-use-this';

const ruleTester = new RuleTester();

ruleTester.run('class-methods-use-this', rule, {
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
      options: [{ exceptMethods: ['bar'] }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { "foo"() { } }',
      options: [{ exceptMethods: ['foo'] }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A { 42() { } }',
      options: [{ exceptMethods: ['42'] }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
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
      options: [{ exceptMethods: ['#bar'] }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { foo = function () {} }',
      options: [{ enforceForClassFields: false }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: 'class A { foo = () => {} }',
      options: [{ enforceForClassFields: false }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
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
  invalid: [
    {
      code: 'class A { foo() {} }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 11,
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
        },
      ],
    },
    {
      code: 'class A { foo() {/**this**/} }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 11,
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
        },
      ],
    },
    {
      code: 'class A { foo() {var a = function () {this};} }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 11,
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
        },
      ],
    },
    {
      code: 'class A { foo() {var a = function () {var b = function(){this}};} }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 11,
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
        },
      ],
    },
    {
      code: 'class A { foo() {window.this} }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 11,
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
        },
      ],
    },
    {
      code: "class A { foo() {that.this = 'this';} }",
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 11,
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
        },
      ],
    },
    {
      code: 'class A { foo() { () => undefined; } }',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 11,
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
        },
      ],
    },
    {
      code: 'class A { foo() {} bar() {} }',
      options: [{ exceptMethods: ['bar'] }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 11,
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
        },
      ],
    },
    {
      code: 'class A { foo() {} hasOwnProperty() {} }',
      options: [{ exceptMethods: ['foo'] }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 20,
          messageId: 'missingThis',
          data: { name: "method 'hasOwnProperty'" },
        },
      ],
    },
    {
      code: 'class A { [foo]() {} }',
      options: [{ exceptMethods: ['foo'] }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 11,
          messageId: 'missingThis',
          data: { name: 'method' },
        },
      ],
    },
    {
      code: 'class A { #foo() { } foo() {} #bar() {} }',
      options: [{ exceptMethods: ['#foo'] }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 22,
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          line: 1,
          column: 31,
          messageId: 'missingThis',
          data: { name: 'private method #bar' },
        },
      ],
    },
    {
      code: "class A { foo(){} 'bar'(){} 123(){} [`baz`](){} [a](){} [f(a)](){} get quux(){} set[a](b){} *quuux(){} }",
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
          type: AST_NODE_TYPES.FunctionExpression,
          column: 11,
        },
        {
          messageId: 'missingThis',
          data: { name: "method 'bar'" },
          type: AST_NODE_TYPES.FunctionExpression,
          column: 19,
        },
        {
          messageId: 'missingThis',
          data: { name: "method '123'" },
          type: AST_NODE_TYPES.FunctionExpression,
          column: 29,
        },
        {
          messageId: 'missingThis',
          data: { name: "method 'baz'" },
          type: AST_NODE_TYPES.FunctionExpression,
          column: 37,
        },
        {
          messageId: 'missingThis',
          data: { name: 'method' },
          type: AST_NODE_TYPES.FunctionExpression,
          column: 49,
        },
        {
          messageId: 'missingThis',
          data: { name: 'method' },
          type: AST_NODE_TYPES.FunctionExpression,
          column: 57,
        },
        {
          messageId: 'missingThis',
          data: { name: "getter 'quux'" },
          type: AST_NODE_TYPES.FunctionExpression,
          column: 68,
        },
        {
          messageId: 'missingThis',
          data: { name: 'setter' },
          type: AST_NODE_TYPES.FunctionExpression,
          column: 81,
        },
        {
          messageId: 'missingThis',
          data: { name: "generator method 'quuux'" },
          type: AST_NODE_TYPES.FunctionExpression,
          column: 93,
        },
      ],
    },
    {
      code: 'class A { foo = function() {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [
        {
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
          column: 11,
          endColumn: 25,
        },
      ],
    },
    {
      code: 'class A { foo = () => {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [
        {
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
          column: 11,
          endColumn: 17,
        },
      ],
    },
    {
      code: 'class A { #foo = function() {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [
        {
          messageId: 'missingThis',
          data: { name: 'private method #foo' },
          column: 11,
          endColumn: 26,
        },
      ],
    },
    {
      code: 'class A { #foo = () => {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [
        {
          messageId: 'missingThis',
          data: { name: 'private method #foo' },
          column: 11,
          endColumn: 18,
        },
      ],
    },
    {
      code: 'class A { #foo() {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [
        {
          messageId: 'missingThis',
          data: { name: 'private method #foo' },
          column: 11,
          endColumn: 15,
        },
      ],
    },
    {
      code: 'class A { get #foo() {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [
        {
          messageId: 'missingThis',
          data: { name: 'private getter #foo' },
          column: 11,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'class A { set #foo(x) {} }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [
        {
          messageId: 'missingThis',
          data: { name: 'private setter #foo' },
          column: 11,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'class A { foo () { return class { foo = this }; } }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [
        {
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
          column: 11,
          endColumn: 15,
        },
      ],
    },
    {
      code: 'class A { foo () { return function () { foo = this }; } }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [
        {
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
          column: 11,
          endColumn: 15,
        },
      ],
    },
    {
      code: 'class A { foo () { return class { static { this; } } } }',
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [
        {
          messageId: 'missingThis',
          data: { name: "method 'foo'" },
          column: 11,
          endColumn: 15,
        },
      ],
    },
  ],
});
