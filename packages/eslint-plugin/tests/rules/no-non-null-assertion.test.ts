import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-non-null-assertion';

const ruleTester = new RuleTester();

ruleTester.run('no-non-null-assertion', rule, {
  invalid: [
    {
      code: 'x!;',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: undefined,
        },
      ],
    },
    {
      code: 'x!.y;',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: 'x?.y;',
            },
          ],
        },
      ],
    },
    {
      code: 'x.y!;',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: undefined,
        },
      ],
    },
    {
      code: '!x!.y;',
      errors: [
        {
          column: 2,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: '!x?.y;',
            },
          ],
        },
      ],
    },
    {
      code: 'x!.y?.z;',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: 'x?.y?.z;',
            },
          ],
        },
      ],
    },
    {
      code: 'x![y];',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: 'x?.[y];',
            },
          ],
        },
      ],
    },
    {
      code: 'x![y]?.z;',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: 'x?.[y]?.z;',
            },
          ],
        },
      ],
    },
    {
      code: 'x.y.z!();',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: 'x.y.z?.();',
            },
          ],
        },
      ],
    },
    {
      code: 'x.y?.z!();',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: 'x.y?.z?.();',
            },
          ],
        },
      ],
    },
    // some weirder cases that are stupid but valid
    {
      code: 'x!!!;',
      errors: [
        {
          column: 1,
          endColumn: 5,
          line: 1,
          messageId: 'noNonNull',
          suggestions: undefined,
        },
        {
          column: 1,
          endColumn: 4,
          line: 1,
          messageId: 'noNonNull',
          suggestions: undefined,
        },
        {
          column: 1,
          endColumn: 3,
          line: 1,
          messageId: 'noNonNull',
          suggestions: undefined,
        },
      ],
    },
    {
      code: 'x!!.y;',
      errors: [
        {
          column: 1,
          endColumn: 4,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: 'x!?.y;',
            },
          ],
        },
        {
          column: 1,
          endColumn: 3,
          line: 1,
          messageId: 'noNonNull',
          suggestions: undefined,
        },
      ],
    },
    {
      code: 'x.y!!;',
      errors: [
        {
          column: 1,
          endColumn: 6,
          line: 1,
          messageId: 'noNonNull',
          suggestions: undefined,
        },
        {
          column: 1,
          endColumn: 5,
          line: 1,
          messageId: 'noNonNull',
          suggestions: undefined,
        },
      ],
    },
    {
      code: 'x.y.z!!();',
      errors: [
        {
          column: 1,
          endColumn: 8,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: 'x.y.z!?.();',
            },
          ],
        },
        {
          column: 1,
          endColumn: 7,
          line: 1,
          messageId: 'noNonNull',
          suggestions: undefined,
        },
      ],
    },
    {
      code: 'x!?.[y].z;',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: 'x?.[y].z;',
            },
          ],
        },
      ],
    },
    {
      code: 'x!?.y.z;',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: 'x?.y.z;',
            },
          ],
        },
      ],
    },
    {
      code: 'x.y.z!?.();',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: 'x.y.z?.();',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`
x!
.y
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: `
x
?.y
      `,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`
x!
// comment
.y
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: `
x
// comment
?.y
      `,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`
x!
 // comment
    . /* comment */
      y
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: `
x
 // comment
    ?. /* comment */
      y
      `,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`
x!
 // comment
     /* comment */ ['y']
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'noNonNull',
          suggestions: [
            {
              messageId: 'suggestOptionalChain',
              output: `
x?.
 // comment
     /* comment */ ['y']
      `,
            },
          ],
        },
      ],
    },
  ],
  valid: [
    //
    'x;',
    'x.y;',
    'x.y.z;',
    'x?.y.z;',
    'x?.y?.z;',
    '!x;',
  ],
});
