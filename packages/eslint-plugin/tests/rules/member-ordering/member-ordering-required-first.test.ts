import type { TSESLint } from '@typescript-eslint/utils';

import type { MessageIds, Options } from '../../../src/rules/member-ordering';
import rule from '../../../src/rules/member-ordering';
import { RuleTester } from '../../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const grouped: TSESLint.RunTests<MessageIds, Options> = {
  valid: [
    {
      code: `
interface X {
  c: string;
  b?: string;
  d?: string;
}           `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            requiredFirst: true,
          },
        },
      ],
    },
    {
      code: `
interface X {
  b?: string;
  c?: string;
  d?: string;
}           `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'as-written',
            requiredFirst: true,
          },
        },
      ],
    },
    {
      code: `
interface X {
  b: string;
  c: string;
  d: string;
}           `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'as-written',
            requiredFirst: true,
          },
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
interface X {
  m: string;
  d?: string;
  b?: string;
}           `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            requiredFirst: true,
          },
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          line: 5,
          column: 3,
        },
      ],
    },
    {
      code: `
interface X {
  a: string;
  b?: string;
  c: string;
}
            `,
      options: [
        {
          default: {
            memberTypes: ['call-signature', 'field', 'method'],
            order: 'as-written',
            requiredFirst: true,
          },
        },
      ],
      errors: [
        {
          messageId: 'incorrectRequiredFirstOrder',
          line: 4,
          column: 3,
        },
      ],
    },
  ],
};

ruleTester.run('member-ordering-required-first', rule, grouped);
