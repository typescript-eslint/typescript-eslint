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
    {
      code: 'enum foo { SECOND = 1000 }',
      options: [{ ignoreEnums: true }],
    },
    {
      code: 'enum foo { SECOND = 1000, NUM = "0123456789" }',
      options: [{ ignoreEnums: true }],
    },
    {
      code: `
class Foo {
  readonly A = 1;
  readonly B = 2;
  public static readonly C = 1;
  static readonly D = 1;
  readonly E = -1;
  readonly F = +1;
}
      `,
      options: [{ ignoreReadonlyClassProperties: true }],
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
    {
      code: 'enum foo { SECOND = 1000 }',
      options: [{ ignoreEnums: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1000',
          },
          line: 1,
          column: 21,
        },
      ],
    },
    {
      code: 'enum foo { SECOND = 1000, NUM = "0123456789" }',
      options: [{ ignoreEnums: false }],
      errors: [
        {
          messageId: 'noMagic',
          data: {
            raw: '1000',
          },
          line: 1,
          column: 21,
        },
      ],
    },
    {
      code: `
class Foo {
  readonly A = 1;
  readonly B = 2;
  public static readonly C = 1;
  static readonly D = 1;
  readonly E = -1;
  readonly F = +1;
}
      `,
      options: [{ ignoreReadonlyClassProperties: false }],
      errors: [
        {
          messageId: 'noMagic',
          line: 3,
          column: 16,
        },
        {
          messageId: 'noMagic',
          line: 4,
          column: 16,
        },
        {
          messageId: 'noMagic',
          line: 5,
          column: 30,
        },
        {
          messageId: 'noMagic',
          line: 6,
          column: 23,
        },
        {
          messageId: 'noMagic',
          line: 7,
          column: 16,
        },
        {
          messageId: 'noMagic',
          line: 8,
          column: 16,
        },
      ],
    },
  ],
});
