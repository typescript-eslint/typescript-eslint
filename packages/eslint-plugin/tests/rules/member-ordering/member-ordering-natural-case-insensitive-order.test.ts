/* eslint-disable @typescript-eslint/internal/no-multiple-lines-of-errors */
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/member-ordering';

const ruleTester = new RuleTester();

ruleTester.run('member-ordering-natural-order', rule, {
  invalid: [
    {
      code: `
interface Example {
  1: number;
  10: number;
  5: number;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 10,
            member: 5,
          },
          line: 5,
          messageId: 'incorrectOrder',
        },
      ],
      options: [
        {
          default: {
            order: 'natural-case-insensitive',
          },
        },
      ],
    },

    {
      code: `
interface Example {
  new (): unknown;

  a1(): void;
  a10(): void;
  a5(): void;
  B5(): void;
  B10(): void;
  B1(): void;

  a5: number;
  a10: number;
  B1: number;
  a1: number;
  B5: number;
  B10: number;
}
      `,
      errors: [
        {
          column: 3,
          data: {
            beforeMember: 'a10',
            member: 'a5',
          },
          line: 7,
          messageId: 'incorrectOrder',
        },
        {
          column: 3,
          data: {
            beforeMember: 'B10',
            member: 'B1',
          },
          line: 10,
          messageId: 'incorrectOrder',
        },
        {
          column: 3,
          data: {
            beforeMember: 'B1',
            member: 'a1',
          },
          line: 15,
          messageId: 'incorrectOrder',
        },
      ],
      options: [
        {
          default: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'natural-case-insensitive',
          },
        },
      ],
    },
  ],
  valid: [
    {
      code: `
interface Example {
  1: number;
  5: number;
  10: number;
}
      `,
      options: [
        {
          default: {
            order: 'natural-case-insensitive',
          },
        },
      ],
    },
    {
      code: `
interface Example {
  new (): unknown;

  a1(): void;
  a5(): void;
  a10(): void;
  B1(): void;
  B5(): void;
  B10(): void;

  a1: number;
  a5: number;
  a10: number;
  B1: number;
  B5: number;
  B10: number;
}
      `,
      options: [
        {
          default: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'natural-case-insensitive',
          },
        },
      ],
    },
  ],
});
