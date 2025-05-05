import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-extra-non-null-assertion';

const ruleTester = new RuleTester();

ruleTester.run('no-extra-non-null-assertion', rule, {
  invalid: [
    {
      code: `
const foo: { bar: number } | null = null;
const bar = foo!!.bar;
      `,
      errors: [
        {
          column: 13,
          endColumn: 17,
          line: 3,
          messageId: 'noExtraNonNullAssertion',
        },
      ],
      output: `
const foo: { bar: number } | null = null;
const bar = foo!.bar;
      `,
    },
    {
      code: `
function foo(bar: number | undefined) {
  const bar: number = bar!!;
}
      `,
      errors: [
        {
          column: 23,
          endColumn: 27,
          line: 3,
          messageId: 'noExtraNonNullAssertion',
        },
      ],
      output: `
function foo(bar: number | undefined) {
  const bar: number = bar!;
}
      `,
    },
    {
      code: `
function foo(bar?: { n: number }) {
  return bar!?.n;
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 14,
          line: 3,
          messageId: 'noExtraNonNullAssertion',
        },
      ],
      output: `
function foo(bar?: { n: number }) {
  return bar?.n;
}
      `,
    },
    {
      code: `
function foo(bar?: { n: number }) {
  return bar!?.();
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 14,
          line: 3,
          messageId: 'noExtraNonNullAssertion',
        },
      ],
      output: `
function foo(bar?: { n: number }) {
  return bar?.();
}
      `,
    },
    // parentheses
    {
      code: noFormat`
const foo: { bar: number } | null = null;
const bar = (foo!)!.bar;
      `,
      errors: [
        {
          column: 14,
          endColumn: 18,
          line: 3,
          messageId: 'noExtraNonNullAssertion',
        },
      ],
      output: `
const foo: { bar: number } | null = null;
const bar = (foo)!.bar;
      `,
    },
    {
      code: noFormat`
function foo(bar?: { n: number }) {
  return (bar!)?.n;
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 15,
          line: 3,
          messageId: 'noExtraNonNullAssertion',
        },
      ],
      output: `
function foo(bar?: { n: number }) {
  return (bar)?.n;
}
      `,
    },
    {
      code: noFormat`
function foo(bar?: { n: number }) {
  return (bar)!?.n;
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 16,
          line: 3,
          messageId: 'noExtraNonNullAssertion',
        },
      ],
      output: `
function foo(bar?: { n: number }) {
  return (bar)?.n;
}
      `,
    },
    {
      code: noFormat`
function foo(bar?: { n: number }) {
  return (bar!)?.();
}
      `,
      errors: [
        {
          column: 11,
          endColumn: 15,
          line: 3,
          messageId: 'noExtraNonNullAssertion',
        },
      ],
      output: `
function foo(bar?: { n: number }) {
  return (bar)?.();
}
      `,
    },
  ],
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
}
      `,
    },
    {
      code: `
function foo(bar?: { n: number }) {
  return bar?.n;
}
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2166
    {
      code: `
checksCounter?.textContent!.trim();
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2732
    {
      code: `
function foo(key: string | null) {
  const obj = {};
  return obj?.[key!];
}
      `,
    },
  ],
});
