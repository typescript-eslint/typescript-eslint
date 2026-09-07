import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/member-ordering';

const ruleTester = new RuleTester();

ruleTester.run('member-ordering-required', rule, {
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
            optionalityOrder: 'required-first',
            order: 'alphabetically',
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
            optionalityOrder: 'required-first',
            order: 'as-written',
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
            optionalityOrder: 'required-first',
            order: 'as-written',
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
            optionalityOrder: 'required-first',
            order: 'alphabetically',
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
            optionalityOrder: 'required-first',
            order: 'alphabetically',
          },
        },
      ],
    },
    {
      code: `
class X {
  a: string;
  b: string;
  static {}
}
      `,
      options: [
        {
          default: {
            memberTypes: 'never',
            optionalityOrder: 'required-first',
            order: 'alphabetically',
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
            optionalityOrder: 'required-first',
            order: 'alphabetically',
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
            optionalityOrder: 'required-first',
            order: 'alphabetically',
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
            optionalityOrder: 'required-first',
            order: 'alphabetically',
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
            optionalityOrder: 'optional-first',
            order: 'alphabetically',
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
            optionalityOrder: 'optional-first',
            order: 'as-written',
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
            optionalityOrder: 'optional-first',
            order: 'as-written',
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
            optionalityOrder: 'optional-first',
            order: 'alphabetically',
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
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'd',
            member: 'b',
          },
          endColumn: 14,
          endLine: 5,
          line: 5,
          messageId: 'incorrectOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: 'never',
            optionalityOrder: 'required-first',
            order: 'alphabetically',
          },
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
      errors: [
        {
          column: 3,
          data: {
            member: 'b',
            optionalOrRequired: 'required',
          },
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'incorrectRequiredMembersOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: ['call-signature', 'field', 'method'],
            optionalityOrder: 'required-first',
            order: 'as-written',
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
      errors: [
        {
          column: 3,
          data: {
            member: 'a',
            optionalOrRequired: 'required',
          },
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'incorrectRequiredMembersOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: 'never',
            optionalityOrder: 'required-first',
            order: 'as-written',
          },
        },
      ],
    },
    {
      code: `
class X {
  b: string;
  a: string;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'b',
            member: 'a',
            optionalOrRequired: 'required',
          },
          endColumn: 13,
          endLine: 4,
          line: 4,
          messageId: 'incorrectOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: 'never',
            optionalityOrder: 'required-first',
            order: 'natural-case-insensitive',
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
      errors: [
        {
          column: 3,
          endColumn: 14,
          endLine: 4,
          line: 4,
          messageId: 'incorrectOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: 'never',
            optionalityOrder: 'optional-first',
            order: 'alphabetically',
          },
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
      errors: [
        {
          column: 3,
          data: {
            member: 'b',
            optionalOrRequired: 'optional',
          },
          endColumn: 13,
          endLine: 4,
          line: 4,
          messageId: 'incorrectRequiredMembersOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: ['call-signature', 'field', 'method'],
            optionalityOrder: 'optional-first',
            order: 'as-written',
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
      errors: [
        {
          column: 3,
          data: {
            member: 'f',
            optionalOrRequired: 'optional',
          },
          endColumn: 13,
          endLine: 5,
          line: 5,
          messageId: 'incorrectRequiredMembersOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: 'never',
            optionalityOrder: 'optional-first',
            order: 'as-written',
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
      errors: [
        {
          column: 3,
          data: {
            member: 'a',
            optionalOrRequired: 'optional',
          },
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'incorrectRequiredMembersOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: 'never',
            optionalityOrder: 'optional-first',
            order: 'as-written',
          },
        },
      ],
    },
  ],
});
