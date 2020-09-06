import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/experimental-utils';
import { RuleTester } from '../RuleTester';
import rule from '../../src/rules/no-redeclare';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-redeclare', rule, {
  valid: [
    `
var a = 3;
var b = function () {
  var a = 10;
};
    `,
    `
var a = 3;
a = 10;
    `,
    {
      code: `
if (true) {
  let b = 2;
} else {
  let b = 3;
}
      `,
      parserOptions: {
        ecmaVersion: 6,
      },
    },
    { code: 'var Object = 0;', options: [{ builtinGlobals: false }] },
    {
      code: 'var Object = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { sourceType: 'module' },
    },
    {
      code: 'var Object = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaFeatures: { globalReturn: true } },
    },
    {
      code: 'var top = 0;',
      env: { browser: true },
      options: [{ builtinGlobals: false }],
    },
    { code: 'var top = 0;', options: [{ builtinGlobals: true }] },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaFeatures: { globalReturn: true } },
      env: { browser: true },
    },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { sourceType: 'module' },
      env: { browser: true },
    },
    {
      code: 'var self = 1;',
      options: [{ builtinGlobals: true }],
      env: { browser: false },
    },
    // https://github.com/eslint/typescript-eslint-parser/issues/535
    `
function foo({ bar }: { bar: string }) {
  console.log(bar);
}
    `,
    `
type AST<T extends ParserOptions> = TSESTree.Program &
  (T['range'] extends true ? { range: [number, number] } : {}) &
  (T['tokens'] extends true ? { tokens: TSESTree.Token[] } : {}) &
  (T['comment'] extends true ? { comments: TSESTree.Comment[] } : {});
interface ParseAndGenerateServicesResult<T extends ParserOptions> {
  ast: AST<T>;
  services: ParserServices;
}
    `,
    `
function A<T>() {}
interface B<T> {}
type C<T> = Array<T>;
class D<T> {}
    `,
    `
function a(): string;
function a(): number;
function a() {}
    `,
    {
      code: `
interface A {}
interface A {}
      `,
      options: [{ ignoreDeclarationMerge: true }],
    },
    {
      code: `
interface A {}
class A {}
      `,
      options: [{ ignoreDeclarationMerge: true }],
    },
    {
      code: `
class A {}
namespace A {}
      `,
      options: [{ ignoreDeclarationMerge: true }],
    },
    {
      code: `
interface A {}
class A {}
namespace A {}
      `,
      options: [{ ignoreDeclarationMerge: true }],
    },
    {
      code: `
function A() {}
namespace A {}
      `,
      options: [{ ignoreDeclarationMerge: true }],
    },
  ],
  invalid: [
    {
      code: `
var a = 3;
var a = 10;
      `,
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
switch (foo) {
  case a:
    var b = 3;
  case b:
    var b = 4;
}
      `,
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'b',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a = 3;
var a = 10;
      `,
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a = {};
var a = [];
      `,
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a;
function a() {}
      `,
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function a() {}
function a() {}
      `,
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a = function () {};
var a = function () {};
      `,
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a = function () {};
var a = new Date();
      `,
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a = 3;
var a = 10;
var a = 15;
      `,
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a;
var a;
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
export var a;
var a;
      `,
      parserOptions: { sourceType: 'module' },
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var Object = 0;',
      options: [{ builtinGlobals: true }],
      errors: [
        {
          messageId: 'redeclaredAsBuiltin',
          data: {
            id: 'Object',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: true }],
      errors: [
        {
          messageId: 'redeclaredAsBuiltin',
          data: {
            id: 'top',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
      env: { browser: true },
    },
    {
      code: `
var a;
var { a = 0, b: Object = 0 } = {};
      `,
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
        {
          messageId: 'redeclaredAsBuiltin',
          data: {
            id: 'Object',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a;
var { a = 0, b: Object = 0 } = {};
      `,
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a;
var { a = 0, b: Object = 0 } = {};
      `,
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaVersion: 6, ecmaFeatures: { globalReturn: true } },
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
var a;
var { a = 0, b: Object = 0 } = {};
      `,
      options: [{ builtinGlobals: false }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'a',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },

    // Notifications of readonly are moved from no-undef: https://github.com/eslint/eslint/issues/4504
    {
      code: '/*global b:false*/ var b = 1;',
      options: [{ builtinGlobals: true }],
      errors: [
        {
          messageId: 'redeclaredBySyntax',
          data: {
            id: 'b',
          },
          type: AST_TOKEN_TYPES.Identifier,
        },
      ],
    },

    {
      code: `
type T = 1;
type T = 2;
      `,
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'T',
          },
          line: 3,
        },
      ],
    },
    {
      code: `
type NodeListOf = 1;
      `,
      options: [{ builtinGlobals: true }],
      parserOptions: {
        lib: ['dom'],
      },
      errors: [
        {
          messageId: 'redeclaredAsBuiltin',
          data: {
            id: 'NodeListOf',
          },
        },
      ],
    },
    {
      code: `
interface A {}
interface A {}
      `,
      options: [{ ignoreDeclarationMerge: false }],
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'A',
          },
          line: 3,
        },
      ],
    },
    {
      code: `
interface A {}
class A {}
      `,
      options: [{ ignoreDeclarationMerge: false }],
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'A',
          },
          line: 3,
        },
      ],
    },
    {
      code: `
class A {}
namespace A {}
      `,
      options: [{ ignoreDeclarationMerge: false }],
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'A',
          },
          line: 3,
        },
      ],
    },
    {
      code: `
interface A {}
class A {}
namespace A {}
      `,
      options: [{ ignoreDeclarationMerge: false }],
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'A',
          },
          line: 3,
        },
        {
          messageId: 'redeclared',
          data: {
            id: 'A',
          },
          line: 4,
        },
      ],
    },
    {
      code: `
class A {}
class A {}
namespace A {}
      `,
      options: [{ ignoreDeclarationMerge: true }],
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'A',
          },
          line: 3,
        },
      ],
    },
    {
      code: `
function A() {}
namespace A {}
      `,
      options: [{ ignoreDeclarationMerge: false }],
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'A',
          },
          line: 3,
        },
      ],
    },
    {
      code: `
function A() {}
function A() {}
namespace A {}
      `,
      options: [{ ignoreDeclarationMerge: true }],
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'A',
          },
          line: 3,
        },
      ],
    },
    {
      code: `
function A() {}
class A {}
      `,
      options: [{ ignoreDeclarationMerge: false }],
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'A',
          },
          line: 3,
        },
      ],
    },
    {
      code: `
function A() {}
class A {}
namespace A {}
      `,
      options: [{ ignoreDeclarationMerge: false }],
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'A',
          },
          line: 3,
        },
        {
          messageId: 'redeclared',
          data: {
            id: 'A',
          },
          line: 4,
        },
      ],
    },
    {
      code: `
type something = string;
const something = 2;
      `,
      errors: [
        {
          messageId: 'redeclared',
          data: {
            id: 'something',
          },
          line: 3,
        },
      ],
    },
  ],
});
