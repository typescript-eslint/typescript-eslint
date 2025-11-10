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
          data: {
            id: 'a',
          },
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
          data: {
            id: 'b',
          },
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
          data: {
            id: 'a',
          },
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
          data: {
            id: 'a',
          },
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
          data: {
            id: 'a',
          },
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
          data: {
            id: 'a',
          },
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
          data: {
            id: 'a',
          },
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
          data: {
            id: 'a',
          },
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
          data: {
            id: 'a',
          },
          messageId: 'redeclared',
        },
        {
          data: {
            id: 'a',
          },
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
          data: {
            id: 'a',
          },
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
          data: {
            id: 'a',
          },
          messageId: 'redeclared',
        },
      ],
      languageOptions: { parserOptions: { sourceType: 'module' } },
    },
    {
      code: 'var Object = 0;',
      errors: [
        {
          data: {
            id: 'Object',
          },
          messageId: 'redeclaredAsBuiltin',
        },
      ],
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var top = 0;',
      errors: [
        {
          data: {
            id: 'top',
          },
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
          data: {
            id: 'a',
          },
          messageId: 'redeclared',
        },
        {
          data: {
            id: 'Object',
          },
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
          data: {
            id: 'a',
          },
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
          data: {
            id: 'a',
          },
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
          data: {
            id: 'a',
          },
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
          data: {
            id: 'b',
          },
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
          data: {
            id: 'T',
          },
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
          data: {
            id: 'NodeListOf',
          },
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
          data: {
            id: 'A',
          },
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
          data: {
            id: 'A',
          },
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
          data: {
            id: 'A',
          },
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
          data: {
            id: 'A',
          },
          line: 3,
          messageId: 'redeclared',
        },
        {
          data: {
            id: 'A',
          },
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
          data: {
            id: 'A',
          },
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
          data: {
            id: 'A',
          },
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
          data: {
            id: 'A',
          },
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
          data: {
            id: 'A',
          },
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
          data: {
            id: 'A',
          },
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
          data: {
            id: 'A',
          },
          line: 3,
          messageId: 'redeclared',
        },
        {
          data: {
            id: 'A',
          },
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
          data: {
            id: 'something',
          },
          line: 3,
          messageId: 'redeclared',
        },
      ],
    },
  ],
});
