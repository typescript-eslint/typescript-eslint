import rule from '../../src/rules/no-magic-numbers';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-magic-numbers', rule, {
  valid: [
    {
      code: 'const FOO = 10;',
      options: [{ ignoreNumericLiteralTypes: true }],
    },
    {
      code: 'type Foo = "bar";',
    },
    {
      code: 'type Foo = true;',
    },
    {
      code: 'enum foo { SECOND = 1000 }',
    },
    {
      code: 'type Foo = 1;',
      options: [{ ignoreNumericLiteralTypes: true }],
    },
    {
      code: 'type Foo = -1;',
      options: [{ ignoreNumericLiteralTypes: true }],
    },
    {
      code: 'type Foo = 1 | 2 | 3;',
      options: [{ ignoreNumericLiteralTypes: true }],
    },
    {
      code: 'type Foo = 1 | -1;',
      options: [{ ignoreNumericLiteralTypes: true }],
    },
  ],

  invalid: [
    {
      code: 'type Foo = 1;',
      options: [{ ignoreNumericLiteralTypes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = -1;',
      options: [{ ignoreNumericLiteralTypes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '-1',
          },
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'type Foo = 1 | 2 | 3;',
      options: [{ ignoreNumericLiteralTypes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '2',
          },
          line: 1,
          column: 16,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '3',
          },
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: 'type Foo = 1 | -1;',
      options: [{ ignoreNumericLiteralTypes: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 12,
        },
        {
          messageId: 'noMagic',
          data: {
            raw: '-1',
          },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'interface Foo { bar: 1; }',
      options: [{ ignoreNumericLiteralTypes: true }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1',
          },
          line: 1,
          column: 22,
        },
      ],
    },
  ],
});
