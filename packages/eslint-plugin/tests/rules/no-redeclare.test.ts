import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-redeclare';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 6,
      sourceType: 'script',
    },
  },
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
      languageOptions: {
        parserOptions: {
          ecmaVersion: 6,
        },
      },
    },
    { code: 'var Object = 0;', options: [{ builtinGlobals: false }] },
    {
      code: 'var Object = 0;',
      languageOptions: { parserOptions: { sourceType: 'module' } },
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var Object = 0;',
      languageOptions: {
        parserOptions: { ecmaFeatures: { globalReturn: true } },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: false }],
    },
    { code: 'var top = 0;', options: [{ builtinGlobals: true }] },
    {
      code: 'var top = 0;',
      languageOptions: {
        parserOptions: { ecmaFeatures: { globalReturn: true } },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var top = 0;',
      languageOptions: { parserOptions: { sourceType: 'module' } },
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var self = 1;',
      options: [{ builtinGlobals: true }],
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
enum A {}
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
      errors: [
        {
          column: 5,
          data: {
            id: 'a',
          },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
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
          column: 9,
          data: {
            id: 'b',
          },
          endColumn: 10,
          endLine: 6,
          line: 6,
          messageId: 'redeclared',
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
          column: 5,
          data: {
            id: 'a',
          },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
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
          column: 5,
          data: {
            id: 'a',
          },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
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
          column: 10,
          data: {
            id: 'a',
          },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
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
          column: 10,
          data: {
            id: 'a',
          },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
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
          column: 5,
          data: {
            id: 'a',
          },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
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
          column: 5,
          data: {
            id: 'a',
          },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
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
          column: 5,
          data: {
            id: 'a',
          },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
        {
          column: 5,
          data: {
            id: 'a',
          },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'redeclared',
        },
      ],
    },
    {
      code: `
var a;
var a;
      `,
      errors: [
        {
          column: 5,
          data: {
            id: 'a',
          },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      languageOptions: { parserOptions: { sourceType: 'module' } },
    },
    {
      code: `
export var a;
var a;
      `,
      errors: [
        {
          column: 5,
          data: {
            id: 'a',
          },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      languageOptions: { parserOptions: { sourceType: 'module' } },
    },
    {
      code: 'var Object = 0;',
      errors: [
        {
          column: 5,
          data: {
            id: 'Object',
          },
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'redeclaredAsBuiltin',
        },
      ],
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var top = 0;',
      errors: [
        {
          column: 5,
          data: {
            id: 'top',
          },
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'redeclaredAsBuiltin',
        },
      ],
      languageOptions: {
        globals: { top: 'readonly' },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
var a;
var { a = 0, b: Object = 0 } = {};
      `,
      errors: [
        {
          column: 7,
          data: {
            id: 'a',
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
        {
          column: 17,
          data: {
            id: 'Object',
          },
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'redeclaredAsBuiltin',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
var a;
var { a = 0, b: Object = 0 } = {};
      `,
      errors: [
        {
          column: 7,
          data: {
            id: 'a',
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
var a;
var { a = 0, b: Object = 0 } = {};
      `,
      errors: [
        {
          column: 7,
          data: {
            id: 'a',
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      languageOptions: {
        parserOptions: { ecmaFeatures: { globalReturn: true }, ecmaVersion: 6 },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
var a;
var { a = 0, b: Object = 0 } = {};
      `,
      errors: [
        {
          column: 7,
          data: {
            id: 'a',
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ builtinGlobals: false }],
    },

    // Notifications of readonly are moved from no-undef: https://github.com/eslint/eslint/issues/4504
    {
      code: '/*global b:false*/ var b = 1;',
      errors: [
        {
          column: 24,
          data: {
            id: 'b',
          },
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'redeclaredBySyntax',
        },
      ],
      options: [{ builtinGlobals: true }],
    },

    {
      code: `
type T = 1;
type T = 2;
      `,
      errors: [
        {
          column: 6,
          data: {
            id: 'T',
          },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
    },
    {
      code: `
type NodeListOf = 1;
      `,
      errors: [
        {
          column: 6,
          data: {
            id: 'NodeListOf',
          },
          endColumn: 16,
          endLine: 2,
          line: 2,
          messageId: 'redeclaredAsBuiltin',
        },
      ],
      languageOptions: {
        parserOptions: {
          lib: ['dom'],
          sourceType: 'script',
        },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
interface A {}
interface A {}
      `,
      errors: [
        {
          column: 11,
          data: {
            id: 'A',
          },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      options: [{ ignoreDeclarationMerge: false }],
    },
    {
      code: `
interface A {}
class A {}
      `,
      errors: [
        {
          column: 7,
          data: {
            id: 'A',
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      options: [{ ignoreDeclarationMerge: false }],
    },
    {
      code: `
class A {}
namespace A {}
      `,
      errors: [
        {
          column: 11,
          data: {
            id: 'A',
          },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      options: [{ ignoreDeclarationMerge: false }],
    },
    {
      code: `
interface A {}
class A {}
namespace A {}
      `,
      errors: [
        {
          column: 7,
          data: {
            id: 'A',
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
        {
          column: 11,
          data: {
            id: 'A',
          },
          endColumn: 12,
          endLine: 4,
          line: 4,
          messageId: 'redeclared',
        },
      ],
      options: [{ ignoreDeclarationMerge: false }],
    },
    {
      code: `
class A {}
class A {}
namespace A {}
      `,
      errors: [
        {
          column: 7,
          data: {
            id: 'A',
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      options: [{ ignoreDeclarationMerge: true }],
    },
    {
      code: `
function A() {}
namespace A {}
      `,
      errors: [
        {
          column: 11,
          data: {
            id: 'A',
          },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      options: [{ ignoreDeclarationMerge: false }],
    },
    {
      code: `
function A() {}
function A() {}
namespace A {}
      `,
      errors: [
        {
          column: 10,
          data: {
            id: 'A',
          },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      options: [{ ignoreDeclarationMerge: true }],
    },
    {
      code: `
function A() {}
class A {}
      `,
      errors: [
        {
          column: 7,
          data: {
            id: 'A',
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
      options: [{ ignoreDeclarationMerge: false }],
    },
    {
      code: `
enum A {}
namespace A {}
enum A {}
      `,
      errors: [
        {
          column: 6,
          data: {
            id: 'A',
          },
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'redeclared',
        },
      ],
      options: [{ ignoreDeclarationMerge: true }],
    },
    {
      code: `
function A() {}
class A {}
namespace A {}
      `,
      errors: [
        {
          column: 7,
          data: {
            id: 'A',
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
        {
          column: 11,
          data: {
            id: 'A',
          },
          endColumn: 12,
          endLine: 4,
          line: 4,
          messageId: 'redeclared',
        },
      ],
      options: [{ ignoreDeclarationMerge: false }],
    },
    {
      code: `
type something = string;
const something = 2;
      `,
      errors: [
        {
          column: 7,
          data: {
            id: 'something',
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'redeclared',
        },
      ],
    },
  ],
});
