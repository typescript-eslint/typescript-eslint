import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/no-array-constructor';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const messageId = 'useLiteral' as const;

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
      output: '[];',
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
    },
    {
      code: 'Array();',
      output: '[];',
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: 'new Array(x, y);',
      output: '[x, y];',
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
    },
    {
      code: 'Array(x, y);',
      output: '[x, y];',
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: 'new Array(0, 1, 2);',
      output: '[0, 1, 2];',
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
    },
    {
      code: 'Array(0, 1, 2);',
      output: '[0, 1, 2];',
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      code: `
new Array(0, 1, 2);
      `,
      output: `
[0, 1, 2];
      `,
      errors: [
        {
          messageId,
          type: AST_NODE_TYPES.NewExpression,
        },
      ],
    },
  ],
});
