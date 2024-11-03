import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/no-array-constructor';

const ruleTester = new RuleTester();

ruleTester.run('no-array-constructor', rule, {
  valid: [
    'new Array(x);',
    'Array(x);',
    'new Array(9);',
    'Array(9);',
    'new foo.Array();',
    'foo.Array();',
    'new Array.foo();',
    'Array.foo();',

    // TypeScript
    'new Array<Foo>(1, 2, 3);',
    'new Array<Foo>();',
    'Array<Foo>(1, 2, 3);',
    'Array<Foo>();',

    // optional chain
    'Array?.(x);',
    'Array?.(9);',
    'foo?.Array();',
    'Array?.foo();',
    'foo.Array?.();',
    'Array.foo?.();',
    'Array?.<Foo>(1, 2, 3);',
    'Array?.<Foo>();',
    'Array?.(0, 1, 2);',
    'Array?.(x, y);',
  ],

  invalid: [
    {
      code: 'new Array();',
      errors: [
        {
          messageId: 'useLiteral',
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      output: '[];',
    },
    {
      code: 'Array();',
      errors: [
        {
          messageId: 'useLiteral',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
      output: '[];',
    },
    {
      code: 'new Array(x, y);',
      errors: [
        {
          messageId: 'useLiteral',
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      output: '[x, y];',
    },
    {
      code: 'Array(x, y);',
      errors: [
        {
          messageId: 'useLiteral',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
      output: '[x, y];',
    },
    {
      code: 'new Array(0, 1, 2);',
      errors: [
        {
          messageId: 'useLiteral',
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      output: '[0, 1, 2];',
    },
    {
      code: 'Array(0, 1, 2);',
      errors: [
        {
          messageId: 'useLiteral',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
      output: '[0, 1, 2];',
    },
    {
      code: `
new Array(0, 1, 2);
      `,
      errors: [
        {
          messageId: 'useLiteral',
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
      output: `
[0, 1, 2];
      `,
    },
  ],
});
