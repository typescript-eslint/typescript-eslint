import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-literal-enum-member';

const ruleTester = new RuleTester();

ruleTester.run('prefer-literal-enum-member', rule, {
  valid: [
    `
enum ValidRegex {
  A = /test/,
}
    `,
    `
enum ValidString {
  A = 'test',
}
    `,
    `
enum ValidLiteral {
  A = \`test\`,
}
    `,
    `
enum ValidNumber {
  A = 42,
}
    `,
    `
enum ValidNumber {
  A = -42,
}
    `,
    `
enum ValidNumber {
  A = +42,
}
    `,
    `
enum ValidNull {
  A = null,
}
    `,
    `
enum ValidPlain {
  A,
}
    `,
    `
enum ValidQuotedKey {
  'a',
}
    `,
    `
enum ValidQuotedKeyWithAssignment {
  'a' = 1,
}
    `,
    `
enum ValidKeyWithComputedSyntaxButNoComputedKey {
  ['a'],
}
    `,
    {
      code: `
enum Foo {
  A = 1 << 0,
  B = 1 >> 0,
  C = 1 >>> 0,
  D = 1 | 0,
  E = 1 & 0,
  F = 1 ^ 0,
  G = ~1,
}
      `,
      options: [{ allowBitwiseExpressions: true }],
    },
    {
      code: `
enum Foo {
  A = 1 << 0,
  B = 1 >> 0,
  C = A | B,
}
      `,
      options: [{ allowBitwiseExpressions: true }],
    },
    {
      code: `
enum Foo {
  A = 1 << 0,
  B = 1 >> 0,
  C = Foo.A | Foo.B,
}
      `,
      options: [{ allowBitwiseExpressions: true }],
    },
    {
      code: `
enum Foo {
  A = 1 << 0,
  B = 1 >> 0,
  C = Foo['A'] | B,
}
      `,
      options: [{ allowBitwiseExpressions: true }],
    },
    {
      code: `
enum Foo {
  ['A-1'] = 1 << 0,
  C = ~Foo['A-1'],
}
      `,
      options: [{ allowBitwiseExpressions: true }],
    },
    {
      code: `
enum Foo {
  A = 1 << 0,
  B = 1 << 1,
  C = 1 << 2,
  D = A | B | C,
}
      `,
      options: [{ allowBitwiseExpressions: true }],
    },
    {
      code: `
enum Foo {
  A = 1 << 0,
  B = 1 << 1,
  C = 1 << 2,
  D = Foo.A | Foo.B | Foo.C,
}
      `,
      options: [{ allowBitwiseExpressions: true }],
    },
    {
      code: `
enum Foo {
  A = 1 << 0,
  B = 1 << 1,
  C = 1 << 2,
  D = Foo.A | (Foo.B & ~Foo.C),
}
      `,
      options: [{ allowBitwiseExpressions: true }],
    },
    {
      code: `
enum Foo {
  A = 1 << 0,
  B = 1 << 1,
  C = 1 << 2,
  D = Foo.A | -Foo.B,
}
      `,
      options: [{ allowBitwiseExpressions: true }],
    },
  ],
  invalid: [
    {
      code: `
enum InvalidObject {
  A = {},
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'notLiteral',
        },
      ],
    },
    {
      code: `
enum InvalidArray {
  A = [],
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'notLiteral',
        },
      ],
    },
    {
      code: `
enum InvalidTemplateLiteral {
  A = \`foo \${0}\`,
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'notLiteral',
        },
      ],
    },
    {
      code: `
enum InvalidConstructor {
  A = new Set(),
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'notLiteral',
        },
      ],
    },
    {
      code: `
enum InvalidExpression {
  A = 2 + 2,
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'notLiteral',
        },
      ],
    },
    {
      code: `
enum InvalidExpression {
  A = delete 2,
  B = -a,
  C = void 2,
  D = ~2,
  E = !0,
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'notLiteral',
        },
        {
          column: 3,
          line: 4,
          messageId: 'notLiteral',
        },
        {
          column: 3,
          line: 5,
          messageId: 'notLiteral',
        },
        {
          column: 3,
          line: 6,
          messageId: 'notLiteral',
        },
        {
          column: 3,
          line: 7,
          messageId: 'notLiteral',
        },
      ],
    },
    {
      code: `
const variable = 'Test';
enum InvalidVariable {
  A = 'TestStr',
  B = 2,
  C,
  V = variable,
}
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'notLiteral',
        },
      ],
    },
    {
      code: `
enum InvalidEnumMember {
  A = 'TestStr',
  B = A,
}
      `,
      errors: [
        {
          column: 3,
          line: 4,
          messageId: 'notLiteral',
        },
      ],
    },
    {
      code: `
const Valid = { A: 2 };
enum InvalidObjectMember {
  A = 'TestStr',
  B = Valid.A,
}
      `,
      errors: [
        {
          column: 3,
          line: 5,
          messageId: 'notLiteral',
        },
      ],
    },
    {
      code: `
enum Valid {
  A,
}
enum InvalidEnumMember {
  A = 'TestStr',
  B = Valid.A,
}
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'notLiteral',
        },
      ],
    },
    {
      code: `
const obj = { a: 1 };
enum InvalidSpread {
  A = 'TestStr',
  B = { ...a },
}
      `,
      errors: [
        {
          column: 3,
          line: 5,
          messageId: 'notLiteral',
        },
      ],
    },
    {
      code: `
enum Foo {
  A = 1 << 0,
  B = 1 >> 0,
  C = 1 >>> 0,
  D = 1 | 0,
  E = 1 & 0,
  F = 1 ^ 0,
  G = ~1,
}
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'notLiteral',
        },
        {
          column: 3,
          line: 4,
          messageId: 'notLiteral',
        },
        {
          column: 3,
          line: 5,
          messageId: 'notLiteral',
        },
        {
          column: 3,
          line: 6,
          messageId: 'notLiteral',
        },
        {
          column: 3,
          line: 7,
          messageId: 'notLiteral',
        },
        {
          column: 3,
          line: 8,
          messageId: 'notLiteral',
        },
        {
          column: 3,
          line: 9,
          messageId: 'notLiteral',
        },
      ],
      options: [{ allowBitwiseExpressions: false }],
    },
    {
      code: `
const x = 1;
enum Foo {
  A = x << 0,
  B = x >> 0,
  C = x >>> 0,
  D = x | 0,
  E = x & 0,
  F = x ^ 0,
  G = ~x,
}
      `,
      errors: [
        {
          column: 3,
          line: 4,
          messageId: 'notLiteralOrBitwiseExpression',
        },
        {
          column: 3,
          line: 5,
          messageId: 'notLiteralOrBitwiseExpression',
        },
        {
          column: 3,
          line: 6,
          messageId: 'notLiteralOrBitwiseExpression',
        },
        {
          column: 3,
          line: 7,
          messageId: 'notLiteralOrBitwiseExpression',
        },
        {
          column: 3,
          line: 8,
          messageId: 'notLiteralOrBitwiseExpression',
        },
        {
          column: 3,
          line: 9,
          messageId: 'notLiteralOrBitwiseExpression',
        },
        {
          column: 3,
          line: 10,
          messageId: 'notLiteralOrBitwiseExpression',
        },
      ],
      options: [{ allowBitwiseExpressions: true }],
    },
    {
      code: `
const x = 1;
enum Foo {
  A = 1 << 0,
  B = x >> Foo.A,
  C = x >> A,
}
      `,
      errors: [
        {
          column: 3,
          line: 5,
          messageId: 'notLiteralOrBitwiseExpression',
        },
        {
          column: 3,
          line: 6,
          messageId: 'notLiteralOrBitwiseExpression',
        },
      ],
      options: [{ allowBitwiseExpressions: true }],
    },
    {
      code: `
enum Foo {
  A,
  B = +A,
}
      `,
      errors: [
        {
          line: 4,
          messageId: 'notLiteral',
        },
      ],
    },
  ],
});
