import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/ban-tslint-comment';

const ruleTester = new RuleTester();

ruleTester.run('ban-tslint-comment', rule, {
  valid: [
    {
      code: 'let a: readonly any[] = [];',
    },
    {
      code: 'let a = new Array();',
    },
    {
      code: '// some other comment',
    },
    {
      code: '// TODO: this is a comment that mentions tslint',
    },
    {
      code: '/* another comment that mentions tslint */',
    },
  ],
  invalid: [
    {
      code: '/* tslint:disable */',
      errors: [
        {
          column: 1,
          data: {
            text: '/* tslint:disable */',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: '',
    },
    {
      code: '/* tslint:enable */',
      errors: [
        {
          column: 1,
          data: {
            text: '/* tslint:enable */',
          },
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: '',
    },
    {
      code: '/* tslint:disable:rule1 rule2 rule3... */',
      errors: [
        {
          column: 1,
          data: {
            text: '/* tslint:disable:rule1 rule2 rule3... */',
          },
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: '',
    },
    {
      code: '/* tslint:enable:rule1 rule2 rule3... */',
      errors: [
        {
          column: 1,
          data: {
            text: '/* tslint:enable:rule1 rule2 rule3... */',
          },
          endColumn: 41,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: '',
    },
    {
      code: '// tslint:disable-next-line',
      errors: [
        {
          column: 1,
          data: {
            text: '// tslint:disable-next-line',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: '',
    },
    {
      code: 'someCode(); // tslint:disable-line',
      errors: [
        {
          column: 13,
          data: {
            text: '// tslint:disable-line',
          },
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: 'someCode();',
    },
    {
      code: '// tslint:disable-next-line:rule1 rule2 rule3...',
      errors: [
        {
          column: 1,
          data: { text: '// tslint:disable-next-line:rule1 rule2 rule3...' },
          endColumn: 49,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: '',
    },
    {
      code: `
const woah = doSomeStuff();
// tslint:disable-line
console.log(woah);
      `,
      errors: [
        {
          column: 1,
          data: {
            text: '// tslint:disable-line',
          },
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'commentDetected',
        },
      ],
      output: `
const woah = doSomeStuff();
console.log(woah);
      `,
    },
  ],
});
