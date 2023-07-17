import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-non-null-asserted-optional-chain';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
