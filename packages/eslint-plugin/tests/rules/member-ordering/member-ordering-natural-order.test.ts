import rule from '../../../src/rules/member-ordering';
import { RuleTester } from '../../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('member-ordering-natural-order', rule, {
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
            order: 'natural',
          },
        },
      ],
    },
    {
      code: `
interface Example {
  new (): unknown;

  B1(): void;
  B5(): void;
  B10(): void;
  a1(): void;
  a5(): void;
  a10(): void;

  B1: number;
  B5: number;
  B10: number;
  a1: number;
  a5: number;
  a10: number;
}
      `,
      options: [
        {
          default: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'natural',
          },
        },
      ],
    },
  ],
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
          messageId: 'incorrectOrder',
          data: {
            beforeMember: 10,
            member: 5,
          },
          line: 5,
          column: 3,
        },
      ],
      options: [
        {
          default: {
            order: 'natural',
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
            beforeMember: 'a5',
            member: 'B5',
          },
          line: 8,
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
      ],
      options: [
        {
          default: {
            memberTypes: ['constructor', 'method', 'field'],
            order: 'natural',
          },
        },
      ],
    },
  ],
});
