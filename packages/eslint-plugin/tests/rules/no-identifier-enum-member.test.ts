import rule, { MessageId } from '../../src/rules/no-identifier-enum-member';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-literal-enum-member', rule, {
  valid: [
    `
enum Valid {
  A = /test/,
  B = 'test',
  C = 42,
  D = null,
  E,
  F = {},
  G = [],
  H = new Set(),
  I = 2 + 2,
}
    `,
  ],
  invalid: [
    {
      code: `
const variable = 'Test';
enum Foo {
  A = 'TestStr',
  B = 2,
  C,
  V = variable,
}
      `,
      errors: [
        {
          messageId: MessageId.NoVariable,
          line: 7,
          column: 3,
        },
      ],
    },
  ],
});
