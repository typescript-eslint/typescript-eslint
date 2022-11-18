import type { TSESLint } from '@typescript-eslint/utils';

import type { MessageIds, Options } from '../../../src/rules/member-ordering';
import rule from '../../../src/rules/member-ordering';
import { RuleTester } from '../../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const grouped: TSESLint.RunTests<MessageIds, Options> = {
  valid: [
    // required - first
    {
      code: `
interface X {
  c: string;
  b?: string;
  d?: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            required: 'first',
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
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'as-written',
            required: 'first',
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
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'as-written',
            required: 'first',
          },
        },
      ],
    },
    // required - last
    {
      code: `
interface X {
  b?: string;
  d?: string;
  c: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            required: 'last',
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
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'as-written',
            required: 'last',
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
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'as-written',
            required: 'last',
          },
        },
      ],
    },
  ],
  // required - first
  invalid: [
    {
      code: `
interface X {
  m: string;
  d?: string;
  b?: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            required: 'first',
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
            required: 'first',
          },
        },
      ],
      errors: [
        {
          messageId: 'incorrectRequiredMembersOrder',
          line: 4,
          column: 3,
          data: {
            member: 'b',
            optionalOrRequired: 'required',
          },
        },
      ],
    },
    // required - last
    {
      code: `
interface X {
  d?: string;
  b?: string;
  m: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            required: 'last',
          },
        },
      ],
      errors: [
        {
          messageId: 'incorrectOrder',
          line: 4,
          column: 3,
        },
      ],
    },
    {
      code: `
interface X {
  a?: string;
  b: string;
  c?: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: ['call-signature', 'field', 'method'],
            order: 'as-written',
            required: 'last',
          },
        },
      ],
      errors: [
        {
          messageId: 'incorrectRequiredMembersOrder',
          line: 4,
          column: 3,
          data: {
            member: 'b',
            optionalOrRequired: 'optional',
          },
        },
      ],
    },
    {
      code: `
class Test {
  a?: string;
  b?: string;
  f: string;
  c?: string;
  d?: string;
  g: string;
  h: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'as-written',
            required: 'last',
          },
        },
      ],
      errors: [
        {
          messageId: 'incorrectRequiredMembersOrder',
          line: 5,
          column: 3,
          data: {
            member: 'f',
            optionalOrRequired: 'optional',
          },
        },
      ],
    },
    {
      code: `
class Test {
  a: string;
  b: string;
  f?: string;
  c?: string;
  d?: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'as-written',
            required: 'last',
          },
        },
      ],
      errors: [
        {
          messageId: 'incorrectRequiredMembersOrder',
          line: 3,
          column: 3,
          data: {
            member: 'a',
            optionalOrRequired: 'optional',
          },
        },
      ],
    },
  ],
};

ruleTester.run('member-ordering-required', rule, grouped);
