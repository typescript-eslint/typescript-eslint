const rule = require('eslint/lib/rules/no-redeclare'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6
  },
  parser: '@typescript-eslint/parser'
});

ruleTester.run('no-redeclare', rule, {
  valid: [
    'var a = 3; var b = function() { var a = 10; };',
    'var a = 3; a = 10;',
    {
      code: 'if (true) {\n    let b = 2;\n} else {    \nlet b = 3;\n}',
      parserOptions: {
        ecmaVersion: 6
      }
    },
    'var Object = 0;',
    { code: 'var Object = 0;', options: [{ builtinGlobals: false }] },
    {
      code: 'var Object = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { sourceType: 'module' }
    },
    {
      code: 'var Object = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaFeatures: { globalReturn: true } }
    },
    { code: 'var top = 0;', env: { browser: true } },
    { code: 'var top = 0;', options: [{ builtinGlobals: true }] },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaFeatures: { globalReturn: true } },
      env: { browser: true }
    },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: true }],
      parserOptions: { sourceType: 'module' },
      env: { browser: true }
    },
    {
      code: 'var self = 1',
      options: [{ builtinGlobals: true }],
      env: { browser: false }
    },
    // https://github.com/eslint/typescript-eslint-parser/issues/443
    `
const Foo = 1;
type Foo = 1;
    `,
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
type C<T> = Array<T>
class D<T> {}
    `
  ],
  invalid: [
    {
      code: 'var a = 3; var a = 10;',
      parserOptions: { ecmaVersion: 6 },
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'switch(foo) { case a: var b = 3;\ncase b: var b = 4}',
      errors: [{ message: "'b' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'var a = 3; var a = 10;',
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'var a = {}; var a = [];',
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'var a; function a() {}',
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'function a() {} function a() {}',
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'var a = function() { }; var a = function() { }',
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'var a = function() { }; var a = new Date();',
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'var a = 3; var a = 10; var a = 15;',
      errors: [
        { message: "'a' is already defined.", type: 'Identifier' },
        { message: "'a' is already defined.", type: 'Identifier' }
      ]
    },
    {
      code: 'var a; var a;',
      parserOptions: { sourceType: 'module' },
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'export var a; var a;',
      parserOptions: { sourceType: 'module' },
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'var Object = 0;',
      options: [{ builtinGlobals: true }],
      errors: [{ message: "'Object' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: true }],
      errors: [{ message: "'top' is already defined.", type: 'Identifier' }],
      env: { browser: true }
    },
    {
      code: 'var a; var {a = 0, b: Object = 0} = {};',
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        { message: "'a' is already defined.", type: 'Identifier' },
        { message: "'Object' is already defined.", type: 'Identifier' }
      ]
    },
    {
      code: 'var a; var {a = 0, b: Object = 0} = {};',
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'var a; var {a = 0, b: Object = 0} = {};',
      options: [{ builtinGlobals: true }],
      parserOptions: { ecmaVersion: 6, ecmaFeatures: { globalReturn: true } },
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },
    {
      code: 'var a; var {a = 0, b: Object = 0} = {};',
      options: [{ builtinGlobals: false }],
      parserOptions: { ecmaVersion: 6 },
      errors: [{ message: "'a' is already defined.", type: 'Identifier' }]
    },

    // Notifications of readonly are moved from no-undef: https://github.com/eslint/eslint/issues/4504
    {
      code: '/*global b:false*/ var b = 1;',
      options: [{ builtinGlobals: true }],
      errors: [{ message: "'b' is already defined.", type: 'Identifier' }]
    }
  ]
});
