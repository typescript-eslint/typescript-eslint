import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/ban-tslint-comment';

const ruleTester = new RuleTester();

ruleTester.run('ban-tslint-comment', rule, {
  assertionOptions: {
    requireData: true,
  },
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
    {
      code: noFormat`const a = 1/* tslint:disable */+2;`,
      errors: [
        {
          column: 12,
          data: { text: '/* tslint:disable */' },
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: `const a = 1 +2;`,
    },
    {
      code: noFormat`typeof/* tslint:disable */x;`,
      errors: [
        {
          column: 7,
          data: { text: '/* tslint:disable */' },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: `typeof x;`,
    },
    {
      code: noFormat`a(); /* tslint:disable */ b();`,
      errors: [
        {
          column: 6,
          data: { text: '/* tslint:disable */' },
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: `a(); b();`,
    },
    {
      code: '/* tslint:disable */ foo();',
      errors: [
        {
          column: 1,
          data: { text: '/* tslint:disable */' },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: `foo();`,
    },
    {
      code: `
if (a) {
  /* tslint:disable */ foo();
}
      `,
      errors: [
        {
          column: 3,
          data: { text: '/* tslint:disable */' },
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'commentDetected',
        },
      ],
      output: `
if (a) {
  foo();
}
      `,
    },
    {
      code: `
if (a) {
  // tslint:disable-next-line
  foo();
}
      `,
      errors: [
        {
          column: 3,
          data: { text: '// tslint:disable-next-line' },
          endColumn: 30,
          endLine: 3,
          line: 3,
          messageId: 'commentDetected',
        },
      ],
      output: `
if (a) {
  foo();
}
      `,
    },
    {
      code: `
/* tslint:disable
 */
foo();
      `,
      errors: [
        {
          column: 1,
          data: { text: '/* tslint:disable */' },
          endColumn: 4,
          endLine: 3,
          line: 2,
          messageId: 'commentDetected',
        },
      ],
      output: `
foo();
      `,
    },
    {
      code: noFormat`
a();// tslint:disable-line
(b);
      `,
      errors: [
        {
          column: 5,
          data: { text: '// tslint:disable-line' },
          endColumn: 27,
          endLine: 2,
          line: 2,
          messageId: 'commentDetected',
        },
      ],
      output: `
a();
(b);
      `,
    },
    {
      code: noFormat`
function f() {
  return // tslint:disable-line
  x;
}
      `,
      errors: [
        {
          column: 10,
          data: { text: '// tslint:disable-line' },
          endColumn: 32,
          endLine: 3,
          line: 3,
          messageId: 'commentDetected',
        },
      ],
      output: `
function f() {
  return
  x;
}
      `,
    },
    {
      code: noFormat`const a = /* tslint:disable */1;`,
      errors: [
        {
          column: 11,
          data: { text: '/* tslint:disable */' },
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: 'const a = 1;',
    },
    {
      code: noFormat`a;/* tslint:disable */ b;`,
      errors: [
        {
          column: 3,
          data: { text: '/* tslint:disable */' },
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: 'a; b;',
    },
    {
      code: noFormat`typeof /* tslint:disable */x;`,
      errors: [
        {
          column: 8,
          data: { text: '/* tslint:disable */' },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: 'typeof x;',
    },
    {
      code: noFormat`const c = a + /* tslint:disable */+b;`,
      errors: [
        {
          column: 15,
          data: { text: '/* tslint:disable */' },
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'commentDetected',
        },
      ],
      output: 'const c = a + +b;',
    },
    {
      code: noFormat`
function f() {
  return /* tslint:disable
  */ x;
}
      `,
      errors: [
        {
          column: 10,
          data: { text: '/* tslint:disable */' },
          endColumn: 5,
          endLine: 4,
          line: 3,
          messageId: 'commentDetected',
        },
      ],
      output: `
function f() {
  return
x;
}
      `,
    },
  ],
});
