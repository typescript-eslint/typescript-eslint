import rule from '../../src/rules/no-extra-non-null-assertion';
import { RuleTester, noFormat } from '../RuleTester';

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
  invalid: [
    {
      code: `
const foo: { bar: number } | null = null;
const bar = foo!!.bar;
      `,
      output: `
const foo: { bar: number } | null = null;
const bar = foo!.bar;
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
      output: `
function foo(bar: number | undefined) {
  const bar: number = bar!;
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
    {
      code: `
function foo(bar?: { n: number }) {
  return bar!?.n;
}
      `,
      output: `
function foo(bar?: { n: number }) {
  return bar?.n;
}
      `,
      errors: [
        {
          messageId: 'noExtraNonNullAssertion',
          endColumn: 14,
          column: 10,
          line: 3,
        },
      ],
    },
    {
      code: `
function foo(bar?: { n: number }) {
  return bar!?.();
}
      `,
      output: `
function foo(bar?: { n: number }) {
  return bar?.();
}
      `,
      errors: [
        {
          messageId: 'noExtraNonNullAssertion',
          endColumn: 14,
          column: 10,
          line: 3,
        },
      ],
    },
    // parentheses
    {
      code: noFormat`
const foo: { bar: number } | null = null;
const bar = (foo!)!.bar;
      `,
      output: noFormat`
const foo: { bar: number } | null = null;
const bar = (foo)!.bar;
      `,
      errors: [
        {
          messageId: 'noExtraNonNullAssertion',
          endColumn: 18,
          column: 14,
          line: 3,
        },
      ],
    },
    {
      code: noFormat`
function foo(bar?: { n: number }) {
  return (bar!)?.n;
}
      `,
      output: noFormat`
function foo(bar?: { n: number }) {
  return (bar)?.n;
}
      `,
      errors: [
        {
          messageId: 'noExtraNonNullAssertion',
          endColumn: 15,
          column: 11,
          line: 3,
        },
      ],
    },
    {
      code: noFormat`
function foo(bar?: { n: number }) {
  return (bar)!?.n;
}
      `,
      output: noFormat`
function foo(bar?: { n: number }) {
  return (bar)?.n;
}
      `,
      errors: [
        {
          messageId: 'noExtraNonNullAssertion',
          endColumn: 16,
          column: 10,
          line: 3,
        },
      ],
    },
    {
      code: noFormat`
function foo(bar?: { n: number }) {
  return (bar!)?.();
}
      `,
      output: noFormat`
function foo(bar?: { n: number }) {
  return (bar)?.();
}
      `,
      errors: [
        {
          messageId: 'noExtraNonNullAssertion',
          endColumn: 15,
          column: 11,
          line: 3,
        },
      ],
    },
  ],
});
