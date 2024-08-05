import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-deprecated';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: rootDir,
      project: './tsconfig.json',
    },
  },
});

ruleTester.run('no-deprecated', rule, {
  valid: [
    '/** @deprecated */ var a;',
    '/** @deprecated */ var a = 1;',
    '/** @deprecated */ let a;',
    '/** @deprecated */ let a = 1;',
    '/** @deprecated */ const a = 1;',
    '/** @deprecated */ declare var a: number;',
    '/** @deprecated */ declare let a: number;',
    '/** @deprecated */ declare const a: number;',
  ],
  invalid: [
    {
      code: `
        /** @deprecated */ const a = { b: 1 };
        const c = a;
      `,
      errors: [
        {
          column: 19,
          endColumn: 20,
          line: 3,
          endLine: 3,
          data: { name: 'a', reason: '' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated Reason. */ const a = { b: 1 };
        const c = a;
      `,
      errors: [
        {
          column: 19,
          endColumn: 20,
          line: 3,
          endLine: 3,
          data: { name: 'a', reason: ' Reason.' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated Reason. */ const a = { b: 1 };
        console.log(a);
      `,
      errors: [
        {
          column: 21,
          endColumn: 22,
          line: 3,
          endLine: 3,
          data: { name: 'a', reason: ' Reason.' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated Reason. */ const a = { b: 1 };
        console.log(a.b);
      `,
      errors: [
        {
          column: 21,
          endColumn: 22,
          line: 3,
          endLine: 3,
          data: { name: 'a', reason: ' Reason.' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated Reason. */ const a = { b: 1 };
        const c = a.b;
      `,
      errors: [
        {
          column: 19,
          endColumn: 20,
          line: 3,
          endLine: 3,
          data: { name: 'a', reason: ' Reason.' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated Reason. */ const a = { b: 1 };
        const { c } = a.b;
      `,
      errors: [
        {
          column: 23,
          endColumn: 24,
          line: 3,
          endLine: 3,
          data: { name: 'a', reason: ' Reason.' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated Reason. */ const a = { b: 1 };
        const { c = 'd' } = a.b;
      `,
      errors: [
        {
          column: 29,
          endColumn: 30,
          line: 3,
          endLine: 3,
          data: { name: 'a', reason: ' Reason.' },
          messageId: 'deprecated',
        },
      ],
    },
    {
      code: `
        /** @deprecated Reason. */ const a = { b: 1 };
        const { c: d } = a.b;
      `,
      errors: [
        {
          column: 26,
          endColumn: 27,
          line: 3,
          endLine: 3,
          data: { name: 'a', reason: ' Reason.' },
          messageId: 'deprecated',
        },
      ],
    },
  ],
});
