import rule from 'eslint/lib/rules/no-use-before-define';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-use-before-define', rule, {
  valid: [
    `
const updatedAt = data?.updatedAt;
    `,
    `
function f() {
  return function t() {};
}
f()?.();
  `,
    `
var a = { b: 5 };
alert(a?.b);
    `,
  ],
  invalid: [
    {
      code: `
f();
function f() {}
    `,
      errors: [
        {
          message: "'f' was used before it was defined.",
          // the base rule doesn't use messageId
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ],
    },
    {
      code: `
alert(a);
var a = 10;
    `,
      errors: [
        {
          message: "'a' was used before it was defined.",
          // the base rule doesn't use messageId
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ],
    },
    {
      code: `
f()?.();
function f() {
  return function t() {};
}
    `,
      errors: [
        {
          message: "'f' was used before it was defined.",
          // the base rule doesn't use messageId
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ],
    },
    {
      code: `
alert(a?.b);
var a = { b: 5 };
    `,
      errors: [
        {
          message: "'a' was used before it was defined.",
          // the base rule doesn't use messageId
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ],
    },
  ],
});
