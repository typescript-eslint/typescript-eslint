import rule from '../../src/rules/prefer-literal-enum-member';
import { RuleTester, noFormat } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
    noFormat`
enum ValidKeyWithComputedSyntaxButNoComputedKey {
  ['a'],
}
    `,
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
          messageId: 'notLiteral',
          line: 3,
          column: 3,
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
          messageId: 'notLiteral',
          line: 3,
          column: 3,
        },
      ],
    },
    {
      code: `
enum InvalidTemplateLiteral {
  A = \`a\`,
}
      `,
      errors: [
        {
          messageId: 'notLiteral',
          line: 3,
          column: 3,
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
          messageId: 'notLiteral',
          line: 3,
          column: 3,
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
          messageId: 'notLiteral',
          line: 3,
          column: 3,
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
          messageId: 'notLiteral',
          line: 3,
          column: 3,
        },
        {
          messageId: 'notLiteral',
          line: 4,
          column: 3,
        },
        {
          messageId: 'notLiteral',
          line: 5,
          column: 3,
        },
        {
          messageId: 'notLiteral',
          line: 6,
          column: 3,
        },
        {
          messageId: 'notLiteral',
          line: 7,
          column: 3,
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
          messageId: 'notLiteral',
          line: 7,
          column: 3,
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
          messageId: 'notLiteral',
          line: 4,
          column: 3,
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
          messageId: 'notLiteral',
          line: 5,
          column: 3,
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
          messageId: 'notLiteral',
          line: 7,
          column: 3,
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
          messageId: 'notLiteral',
          line: 5,
          column: 3,
        },
      ],
    },
  ],
});
