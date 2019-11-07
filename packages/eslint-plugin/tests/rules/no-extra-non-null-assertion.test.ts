import rule from '../../src/rules/no-extra-non-null-assertion';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-extra-non-null-assertion', rule, {
  valid: [
    {
      code: `
const foo: { bar: number } | null = null;
const bar = foo!.bar;
      `,
    },
    {
      code: `
function foo(bar: number | undefined) {
  const bar: number = bar!;
}      `,
    },
  ],
  invalid: [
    {
      code: `
const foo: { bar: number } | null = null;
const bar = foo!!!.bar;
      `,
      errors: [
        {
          messageId: 'noExtraNonNullAssertion',
          endColumn: 17,
          column: 13,
          line: 3,
        },
      ],
    },
    {
      code: `
function foo(bar: number | undefined) {
  const bar: number = bar!!;
}
      `,
      errors: [
        {
          messageId: 'noExtraNonNullAssertion',
          endColumn: 27,
          column: 23,
          line: 3,
        },
      ],
    },
  ],
});
