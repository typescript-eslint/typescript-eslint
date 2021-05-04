import rule from '../../src/rules/no-non-null-asserted-nullish-coalescing';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
  ],
  invalid: [
    {
      code: 'foo! ?? bar;',
      errors: [
        {
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
  ],
});
