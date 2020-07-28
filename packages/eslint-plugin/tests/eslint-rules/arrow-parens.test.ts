import rule from 'eslint/lib/rules/arrow-parens';
import { RuleTester, noFormat } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('arrow-parens', rule, {
  valid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/14
    noFormat`const foo = (t) => {};`,
    'const foo = <T>(t) => {};',
    'const foo = <T>(t: T) => {};',
    'const foo = <T>((t: T) => {});',
    'const foo = function <T>(t: T) {};',
    `
const foo = <T>(bar: any): void => {
  // Do nothing
};
    `,
    {
      code: 'const foo = t => {};',
      options: ['as-needed'],
    },
    {
      code: 'const foo = <T>(t) => {};',
      options: ['as-needed'],
    },
    {
      code: 'const foo = (t: T) => {};',
      options: ['as-needed'],
    },
    {
      code: 'const foo = <T>(t: T) => {};',
      options: ['as-needed'],
    },
    {
      code: 'const foo = <T>(t: T) => ({});',
      options: ['as-needed', { requireForBlockBody: true }],
    },
  ],
  invalid: [],
});
