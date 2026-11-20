import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-array-constructor';

const ruleTester = new RuleTester();

ruleTester.run('no-array-constructor', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    'new Array(x);',
    'Array(x);',
    'new Array(9);',
    'Array(9);',
    'new foo.Array();',
    'foo.Array();',
    'new Array.foo();',
    'Array.foo();',

    // TypeScript
    'new Array<Foo>(1, 2, 3);',
    'new Array<Foo>();',
    'Array<Foo>(1, 2, 3);',
    'Array<Foo>();',

    // optional chain
    'Array?.(x);',
    'Array?.(9);',
    'foo?.Array();',
    'Array?.foo();',
    'foo.Array?.();',
    'Array.foo?.();',
    'Array?.<Foo>(1, 2, 3);',
    'Array?.<Foo>();',
    'foo(x, y);',
    `
const Array = (...items: number[]) => items;
Array(1, 2);
    `,
    `
function create(Array: ArrayConstructor) {
  return new Array(1, 2);
}
    `,
  ],

  invalid: [
    {
      code: 'new Array();',
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: '[];',
    },
    {
      code: 'Array();',
      errors: [
        {
          column: 1,
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: '[];',
    },
    {
      code: 'Array?.();',
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: '[];',
    },
    {
      code: '/* a */ /* b */ Array /* c */ /* d */ /* e */ /* f */?.(); /* g */ /* h */',
      errors: [
        {
          column: 17,
          endColumn: 58,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: null,
    },
    {
      code: 'new Array(x, y);',
      errors: [
        {
          column: 1,
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: '[x, y];',
    },
    {
      code: 'Array(x, y);',
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: '[x, y];',
    },
    {
      code: 'Array?.(x, y);',
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: '[x, y];',
    },
    {
      code: '/* a */ /* b */ Array /* c */ /* d */ /* e */ /* f */?.(x, y); /* g */ /* h */',
      errors: [
        {
          column: 17,
          endColumn: 62,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: null,
    },
    {
      code: 'new Array(0, 1, 2);',
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: '[0, 1, 2];',
    },
    {
      code: 'Array(0, 1, 2);',
      errors: [
        {
          column: 1,
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: '[0, 1, 2];',
    },
    {
      code: 'Array?.(0, 1, 2);',
      errors: [
        {
          column: 1,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: '[0, 1, 2];',
    },
    {
      code: `
/* a */ /* b */ Array /* c */ /* d */ /* e */ /* f */?.(
  0,
  1,
  2,
); /* g */ /* h */
      `,
      errors: [
        {
          column: 17,
          endColumn: 2,
          endLine: 6,
          line: 2,
          messageId: 'useLiteral',
        },
      ],
      output: null,
    },
    {
      code: `
new Array(0, 1, 2);
      `,
      errors: [
        {
          column: 1,
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'useLiteral',
        },
      ],
      output: `
[0, 1, 2];
      `,
    },
    {
      code: `
/* a */ Array(/* b */ x, y /* c */); /* d */
      `,
      errors: [
        {
          column: 9,
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'useLiteral',
        },
      ],
      output: `
/* a */ [/* b */ x, y /* c */]; /* d */
      `,
    },
    {
      code: `
new /* a */ Array(x, y);
      `,
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'useLiteral',
        },
      ],
      output: null,
    },
    {
      code: noFormat`
new Array /* a */;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 2,
          line: 2,
          messageId: 'useLiteral',
        },
      ],
      output: `
[] /* a */;
      `,
    },
    {
      code: noFormat`
foo
Array(x, y)
      `,
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'useLiteral',
        },
      ],
      output: `
foo
;[x, y]
      `,
    },
    {
      code: noFormat`
foo
new Array(x, y).forEach(bar)
      `,
      errors: [
        {
          column: 1,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'useLiteral',
        },
      ],
      output: `
foo
;[x, y].forEach(bar)
      `,
    },
    {
      code: `
foo;
Array(x, y);
      `,
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'useLiteral',
        },
      ],
      output: `
foo;
[x, y];
      `,
    },
    {
      code: 'void Array(x, y);',
      errors: [
        {
          column: 6,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'useLiteral',
        },
      ],
      output: 'void [x, y];',
    },
  ],
});
