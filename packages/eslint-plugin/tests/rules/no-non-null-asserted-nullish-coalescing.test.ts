import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-non-null-asserted-nullish-coalescing';

const ruleTester = new RuleTester();

ruleTester.run('no-non-null-asserted-nullish-coalescing', rule, {
  valid: [
    'foo ?? bar;',
    'foo ?? bar!;',
    'foo.bazz ?? bar;',
    'foo.bazz ?? bar!;',
    'foo!.bazz ?? bar;',
    'foo!.bazz ?? bar!;',
    'foo() ?? bar;',
    'foo() ?? bar!;',
    '(foo ?? bar)!;',
    `
      let x: string;
      x! ?? '';
    `,
    `
      let x: string;
      x ?? '';
    `,
    `
      let x!: string;
      x ?? '';
    `,
    `
      let x: string;
      foo(x);
      x! ?? '';
    `,
    `
      let x: string;
      x! ?? '';
      x = foo();
    `,
    `
      let x: string;
      foo(x);
      x! ?? '';
      x = foo();
    `,
    `
      let x = foo();
      x ?? '';
    `,
    `
      function foo() {
        let x: string;
        return x ?? '';
      }
    `,
    `
      let x: string;
      function foo() {
        return x ?? '';
      }
    `,
  ],
  invalid: [
    {
      code: 'foo! ?? bar;',
      errors: [
        {
          column: 1,
          endColumn: 5,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: 'foo ?? bar;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo! ?? bar!;',
      errors: [
        {
          column: 1,
          endColumn: 5,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: 'foo ?? bar!;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo.bazz! ?? bar;',
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: 'foo.bazz ?? bar;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo.bazz! ?? bar!;',
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: 'foo.bazz ?? bar!;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo!.bazz! ?? bar;',
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: 'foo!.bazz ?? bar;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo!.bazz! ?? bar!;',
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: 'foo!.bazz ?? bar!;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo()! ?? bar;',
      errors: [
        {
          column: 1,
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: 'foo() ?? bar;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo()! ?? bar!;',
      errors: [
        {
          column: 1,
          endColumn: 7,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: 'foo() ?? bar!;',
            },
          ],
        },
      ],
    },
    {
      code: `
let x!: string;
x! ?? '';
      `,
      errors: [
        {
          column: 1,
          endColumn: 3,
          endLine: 3,
          line: 3,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `
let x!: string;
x ?? '';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
let x: string;
x = foo();
x! ?? '';
      `,
      errors: [
        {
          column: 1,
          endColumn: 3,
          endLine: 4,
          line: 4,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `
let x: string;
x = foo();
x ?? '';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
let x: string;
x = foo();
x! ?? '';
x = foo();
      `,
      errors: [
        {
          column: 1,
          endColumn: 3,
          endLine: 4,
          line: 4,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `
let x: string;
x = foo();
x ?? '';
x = foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
let x = foo();
x! ?? '';
      `,
      errors: [
        {
          column: 1,
          endColumn: 3,
          endLine: 3,
          line: 3,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `
let x = foo();
x ?? '';
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo() {
  let x!: string;
  return x! ?? '';
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 4,
          line: 4,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `
function foo() {
  let x!: string;
  return x ?? '';
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
let x!: string;
function foo() {
  return x! ?? '';
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 4,
          line: 4,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `
let x!: string;
function foo() {
  return x ?? '';
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`
let x = foo();
x  ! ?? '';
      `,
      errors: [
        {
          column: 1,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'noNonNullAssertedNullishCoalescing',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `
let x = foo();
x   ?? '';
      `,
            },
          ],
        },
      ],
    },
  ],
});
