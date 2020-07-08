/* eslint-disable eslint-comments/no-use */
// this rule tests the spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/space-before-function-paren';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('space-before-function-paren', rule, {
  valid: [
    'function foo () {}',
    'var foo = function () {}',
    'var bar = function foo () {}',
    'var obj = { get foo () {}, set foo (val) {} };',
    'type TransformFunction = (el: ASTElement, code: string) => string;',
    'var f = function <T> () {};',
    'function foo<T extends () => {}> () {}',
    'async <T extends () => {}> () => {}',
    'async <T>() => {}',
    {
      code: 'function foo<T extends Record<string, () => {}>>() {}',
      options: ['never'],
    },
    {
      code: 'var obj = { foo () {} };',
      parserOptions: { ecmaVersion: 6 },
    },
    { code: 'function* foo () {}', parserOptions: { ecmaVersion: 6 } },
    { code: 'var foo = function *() {};', parserOptions: { ecmaVersion: 6 } },
    { code: 'function foo() {}', options: ['never'] },
    { code: 'var foo = function() {}', options: ['never'] },
    { code: 'var bar = function foo() {}', options: ['never'] },
    {
      code: 'var obj = { get foo() {}, set foo(val) {} };',
      options: ['never'],
    },
    {
      code: 'var obj = { foo() {} };',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'function* foo() {}',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = function*() {};',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },

    {
      code: [
        'function foo() {}',
        'var bar = function () {}',
        'function* baz() {}',
        'var bat = function*() {};',
        'var obj = { get foo() {}, set foo(val) {}, bar() {} };',
      ].join('\n'),
      options: [{ named: 'never', anonymous: 'always' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: [
        'function foo () {}',
        'var bar = function() {}',
        'function* baz () {}',
        'var bat = function* () {};',
        'var obj = { get foo () {}, set foo (val) {}, bar () {} };',
      ].join('\n'),
      options: [{ named: 'always', anonymous: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'class Foo { constructor() {} *method() {} }',
      options: [{ named: 'never', anonymous: 'always' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'class Foo { constructor () {} *method () {} }',
      options: [{ named: 'always', anonymous: 'never' }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo = function() {}',
      options: [{ named: 'always', anonymous: 'ignore' }],
    },
    {
      code: 'var foo = function () {}',
      options: [{ named: 'always', anonymous: 'ignore' }],
    },
    {
      code: 'var bar = function foo() {}',
      options: [{ named: 'ignore', anonymous: 'always' }],
    },
    {
      code: 'var bar = function foo () {}',
      options: [{ named: 'ignore', anonymous: 'always' }],
    },

    // Async arrow functions
    { code: '() => 1', parserOptions: { ecmaVersion: 6 } },
    { code: 'async a => a', parserOptions: { ecmaVersion: 8 } },
    {
      code: 'async a => a',
      options: [{ asyncArrow: 'always' }],
      parserOptions: { ecmaVersion: 8 },
    },
    {
      code: 'async a => a',
      options: [{ asyncArrow: 'never' }],
      parserOptions: { ecmaVersion: 8 },
    },
    {
      code: 'async () => 1',
      options: [{ asyncArrow: 'always' }],
      parserOptions: { ecmaVersion: 8 },
    },
    {
      code: 'async() => 1',
      options: [{ asyncArrow: 'never' }],
      parserOptions: { ecmaVersion: 8 },
    },
    {
      code: 'async () => 1',
      options: [{ asyncArrow: 'ignore' }],
      parserOptions: { ecmaVersion: 8 },
    },
    {
      code: 'async() => 1',
      options: [{ asyncArrow: 'ignore' }],
      parserOptions: { ecmaVersion: 8 },
    },
    { code: 'async () => 1', parserOptions: { ecmaVersion: 8 } },
    {
      code: 'async () => 1',
      options: ['always'],
      parserOptions: { ecmaVersion: 8 },
    },
    {
      code: 'async() => 1',
      options: ['never'],
      parserOptions: { ecmaVersion: 8 },
    },
    'abstract class Foo { constructor () {} abstract method () }',
    {
      code: 'abstract class Foo { constructor() {} abstract method() }',
      options: ['never'],
    },
    {
      code: 'abstract class Foo { constructor() {} abstract method() }',
      options: [{ anonymous: 'always', named: 'never' }],
    },
    'function foo ();',
    {
      code: 'function foo();',
      options: ['never'],
    },
    {
      code: 'function foo();',
      options: [{ anonymous: 'always', named: 'never' }],
    },
  ],

  invalid: [
    {
      code: 'function foo<T extends () => {}>() {}',
      output: 'function foo<T extends () => {}> () {}',
      errors: [
        {
          type: AST_NODE_TYPES.FunctionDeclaration,
          messageId: 'missing',
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'function foo() {}',
      output: 'function foo () {}',
      errors: [
        {
          type: AST_NODE_TYPES.FunctionDeclaration,
          messageId: 'missing',
          line: 1,
          column: 13,
        },
      ],
    },
    {
      code: 'function foo/* */() {}',
      output: 'function foo /* */() {}',
      errors: [
        {
          type: AST_NODE_TYPES.FunctionDeclaration,
          messageId: 'missing',
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: 'var foo = function() {}',
      output: 'var foo = function () {}',
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'missing',
          line: 1,
          column: 19,
        },
      ],
    },
    {
      code: 'var bar = function foo() {}',
      output: 'var bar = function foo () {}',
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'missing',
          line: 1,
          column: 23,
        },
      ],
    },
    {
      code: 'var obj = { get foo() {}, set foo(val) {} };',
      output: 'var obj = { get foo () {}, set foo (val) {} };',
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'missing',
          line: 1,
          column: 20,
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'missing',
          line: 1,
          column: 34,
        },
      ],
    },
    {
      code: 'var obj = { foo() {} };',
      output: 'var obj = { foo () {} };',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'missing',
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'function* foo() {}',
      output: 'function* foo () {}',
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionDeclaration,
          messageId: 'missing',
          line: 1,
          column: 14,
        },
      ],
    },

    {
      code: 'function foo () {}',
      output: 'function foo() {}',
      options: ['never'],
      errors: [
        {
          type: AST_NODE_TYPES.FunctionDeclaration,
          messageId: 'unexpected',
          line: 1,
          column: 13,
        },
      ],
    },
    {
      code: 'var foo = function () {}',
      output: 'var foo = function() {}',
      options: ['never'],
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 1,
          column: 19,
        },
      ],
    },
    {
      code: 'var bar = function foo () {}',
      output: 'var bar = function foo() {}',
      options: ['never'],
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 1,
          column: 23,
        },
      ],
    },
    {
      code: 'var obj = { get foo () {}, set foo (val) {} };',
      output: 'var obj = { get foo() {}, set foo(val) {} };',
      options: ['never'],
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 1,
          column: 20,
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 1,
          column: 35,
        },
      ],
    },
    {
      code: 'var obj = { foo () {} };',
      output: 'var obj = { foo() {} };',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'function* foo () {}',
      output: 'function* foo() {}',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionDeclaration,
          messageId: 'unexpected',
          line: 1,
          column: 14,
        },
      ],
    },

    {
      code: [
        'function foo () {}',
        'var bar = function() {}',
        'var obj = { get foo () {}, set foo (val) {}, bar () {} };',
      ].join('\n'),
      output: [
        'function foo() {}',
        'var bar = function () {}',
        'var obj = { get foo() {}, set foo(val) {}, bar() {} };',
      ].join('\n'),
      options: [{ named: 'never', anonymous: 'always' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionDeclaration,
          messageId: 'unexpected',
          line: 1,
          column: 13,
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'missing',
          line: 2,
          column: 19,
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 3,
          column: 20,
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 3,
          column: 35,
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 3,
          column: 49,
        },
      ],
    },
    {
      code: 'class Foo { constructor () {} *method () {} }',
      output: 'class Foo { constructor() {} *method() {} }',
      options: [{ named: 'never', anonymous: 'always' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 1,
          column: 24,
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 1,
          column: 38,
        },
      ],
    },
    {
      code: 'var foo = { bar () {} }',
      output: 'var foo = { bar() {} }',
      options: [{ named: 'never', anonymous: 'always' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: [
        'function foo() {}',
        'var bar = function () {}',
        'var obj = { get foo() {}, set foo(val) {}, bar() {} };',
      ].join('\n'),
      output: [
        'function foo () {}',
        'var bar = function() {}',
        'var obj = { get foo () {}, set foo (val) {}, bar () {} };',
      ].join('\n'),
      options: [{ named: 'always', anonymous: 'never' }],
      parserOptions: { ecmaVersion: 6 },
      errors: [
        {
          type: AST_NODE_TYPES.FunctionDeclaration,
          messageId: 'missing',
          line: 1,
          column: 13,
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 2,
          column: 19,
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'missing',
          line: 3,
          column: 20,
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'missing',
          line: 3,
          column: 34,
        },
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'missing',
          line: 3,
          column: 47,
        },
      ],
    },
    {
      code: 'var foo = function() {}',
      output: 'var foo = function () {}',
      options: [{ named: 'ignore', anonymous: 'always' }],
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'missing',
          line: 1,
          column: 19,
        },
      ],
    },
    {
      code: 'var foo = function () {}',
      output: 'var foo = function() {}',
      options: [{ named: 'ignore', anonymous: 'never' }],
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 1,
          column: 19,
        },
      ],
    },
    {
      code: 'var bar = function foo() {}',
      output: 'var bar = function foo () {}',
      options: [{ named: 'always', anonymous: 'ignore' }],
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'missing',
          line: 1,
          column: 23,
        },
      ],
    },
    {
      code: 'var bar = function foo () {}',
      output: 'var bar = function foo() {}',
      options: [{ named: 'never', anonymous: 'ignore' }],
      errors: [
        {
          type: AST_NODE_TYPES.FunctionExpression,
          messageId: 'unexpected',
          line: 1,
          column: 23,
        },
      ],
    },

    // Async arrow functions
    {
      code: 'async() => 1',
      output: 'async () => 1',
      options: [{ asyncArrow: 'always' }],
      parserOptions: { ecmaVersion: 8 },
      errors: [{ messageId: 'missing' }],
    },
    {
      code: 'async () => 1',
      output: 'async() => 1',
      options: [{ asyncArrow: 'never' }],
      parserOptions: { ecmaVersion: 8 },
      errors: [{ messageId: 'unexpected' }],
    },
    {
      code: 'async() => 1',
      output: 'async () => 1',
      parserOptions: { ecmaVersion: 8 },
      errors: [
        {
          messageId: 'missing',
          type: AST_NODE_TYPES.ArrowFunctionExpression,
        },
      ],
    },
    {
      code: 'async() => 1',
      output: 'async () => 1',
      options: ['always'],
      parserOptions: { ecmaVersion: 8 },
      errors: [
        {
          messageId: 'missing',
          type: AST_NODE_TYPES.ArrowFunctionExpression,
        },
      ],
    },
    {
      code: 'async () => 1',
      output: 'async() => 1',
      options: ['never'],
      parserOptions: { ecmaVersion: 8 },
      errors: [
        {
          messageId: 'unexpected',
          type: AST_NODE_TYPES.ArrowFunctionExpression,
        },
      ],
    },
  ],
});
