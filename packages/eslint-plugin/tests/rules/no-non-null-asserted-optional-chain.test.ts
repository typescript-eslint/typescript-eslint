import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-non-null-asserted-optional-chain';

const ruleTester = new RuleTester();

ruleTester.run('no-non-null-asserted-optional-chain', rule, {
  valid: [
    'foo.bar!;',
    'foo.bar!.baz;',
    'foo.bar!.baz();',
    'foo.bar()!;',
    'foo.bar()!();',
    'foo.bar()!.baz;',
    'foo?.bar;',
    'foo?.bar();',
    '(foo?.bar).baz!;',
    '(foo?.bar()).baz!;',
    'foo?.bar!.baz;',
    'foo?.bar!();',
    "foo?.['bar']!.baz;",
  ],
  invalid: [
    {
      code: 'foo?.bar!;',
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: 'foo?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: "foo?.['bar']!;",
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: "foo?.['bar'];",
            },
          ],
        },
      ],
    },
    {
      code: 'foo?.bar()!;',
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: 'foo?.bar();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo.bar?.()!;',
      errors: [
        {
          column: 1,
          endColumn: 13,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: 'foo.bar?.();',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(foo?.bar)!.baz`,
      errors: [
        {
          column: 2,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `(foo?.bar).baz`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(foo?.bar)!().baz`,
      errors: [
        {
          column: 2,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `(foo?.bar)().baz`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(foo?.bar)!`,
      errors: [
        {
          column: 2,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `(foo?.bar)`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(foo?.bar)!()`,
      errors: [
        {
          column: 2,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `(foo?.bar)()`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(foo?.bar!)`,
      errors: [
        {
          column: 2,
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `(foo?.bar)`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(foo?.bar!)()`,
      errors: [
        {
          column: 2,
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'noNonNullOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemovingNonNull',
              output: `(foo?.bar)()`,
            },
          ],
        },
      ],
    },
  ],
});
