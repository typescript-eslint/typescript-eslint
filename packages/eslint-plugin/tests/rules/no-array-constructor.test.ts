import rule from '../../src/rules/no-array-constructor';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser'
});

const messageId = 'useLiteral' as 'useLiteral';

ruleTester.run('no-array-constructor', rule, {
  valid: [
    'new Array(x)',
    'Array(x)',
    'new Array(9)',
    'Array(9)',
    'new foo.Array()',
    'foo.Array()',
    'new Array.foo',
    'Array.foo()',

    // TypeScript
    'new Array<Foo>(1, 2, 3)',
    'new Array<Foo>()',
    'Array<Foo>(1, 2, 3)',
    'Array<Foo>()'
  ],

  invalid: [
    {
      code: 'new Array()',
      output: '[]',
      errors: [{ messageId }]
    },
    {
      code: 'Array()',
      output: '[]',
      errors: [{ messageId }]
    },
    {
      code: 'new Array',
      output: '[]',
      errors: [{ messageId }]
    },
    {
      code: 'new Array(x, y)',
      output: '[x, y]',
      errors: [{ messageId }]
    },
    {
      code: 'Array(x, y)',
      output: '[x, y]',
      errors: [{ messageId }]
    },
    {
      code: 'new Array(0, 1, 2)',
      output: '[0, 1, 2]',
      errors: [{ messageId }]
    },
    {
      code: 'Array(0, 1, 2)',
      output: '[0, 1, 2]',
      errors: [{ messageId }]
    },
    {
      code: `new Array(
                0,
                1,
                2
            )`,
      output: `[
                0,
                1,
                2
            ]`,
      errors: [{ messageId }]
    }
  ]
});
