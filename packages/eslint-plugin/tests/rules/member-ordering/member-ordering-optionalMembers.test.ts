import type { TSESLint } from '@typescript-eslint/utils';

import type { MessageIds, Options } from '../../../src/rules/member-ordering';
import rule from '../../../src/rules/member-ordering';
import { RuleTester } from '../../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const grouped: TSESLint.RunTests<MessageIds, Options> = {
  valid: [
    // optionalityOrder - required-first
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
            optionalityOrder: 'required-first',
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
            optionalityOrder: 'required-first',
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
            optionalityOrder: 'required-first',
          },
        },
      ],
    },
    {
      code: `
class X {
  c: string;
  d: string;
  ['a']?: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            optionalityOrder: 'required-first',
          },
        },
      ],
    },
    {
      code: `
class X {
  c: string;
  public static d: string;
  public static ['a']?: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            optionalityOrder: 'required-first',
          },
        },
      ],
    },
    {
      code: `
class X {
  a: string;
  static {}
  b: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            optionalityOrder: 'required-first',
          },
        },
      ],
    },
    {
      code: `
class X {
  a: string;
  [i: number]: string;
  b?: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            optionalityOrder: 'required-first',
          },
        },
      ],
    },
    {
      code: `
interface X {
  a: string;
  [i?: number]: string;
  b?: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            optionalityOrder: 'required-first',
          },
        },
      ],
    },
    {
      code: `
interface X {
  a: string;
  (a: number): string;
  new (i: number): string;
  b?: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            optionalityOrder: 'required-first',
          },
        },
      ],
    },
    // optionalityOrder - optional-first
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
            optionalityOrder: 'optional-first',
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
            optionalityOrder: 'optional-first',
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
            optionalityOrder: 'optional-first',
          },
        },
      ],
    },
    {
      code: `
class X {
  ['c']?: string;
  a: string;
  b: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'alphabetically',
            optionalityOrder: 'optional-first',
          },
        },
      ],
    },
  ],
  // optionalityOrder - required-first
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
            optionalityOrder: 'required-first',
          },
        },
      ],
      errors: [
        {
          data: {
            member: 'b',
            beforeMember: 'd',
          },
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
            optionalityOrder: 'required-first',
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
    {
      code: `
class X {
  a?: string;
  static {}
  b?: string;
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            order: 'as-written',
            optionalityOrder: 'required-first',
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
            optionalOrRequired: 'required',
          },
        },
      ],
    },
    // optionalityOrder - optional-first
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
            optionalityOrder: 'optional-first',
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
            optionalityOrder: 'optional-first',
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
            optionalityOrder: 'optional-first',
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
            optionalityOrder: 'optional-first',
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
