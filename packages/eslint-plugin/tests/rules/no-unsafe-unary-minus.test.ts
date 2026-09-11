import rule from '../../src/rules/no-unsafe-unary-minus';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-unsafe-unary-minus', rule, {
  valid: [
    '+42;',
    '-42;',
    '-42n;',
    '(a: number) => -a;',
    '(a: bigint) => -a;',
    '(a: number | bigint) => -a;',
    '(a: any) => -a;',
    '(a: 1 | 2) => -a;',
    '(a: string) => +a;',
    '(a: number[]) => -a[0];',
    '<T,>(t: T & number) => -t;',
    '(a: { x: number }) => -a.x;',
    '(a: never) => -a;',
    '<T extends number>(t: T) => -t;',
  ],
  invalid: [
    {
      code: '(a: string) => -a;',
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'unaryMinus',
        },
      ],
    },
    {
      code: '(a: {}) => -a;',
      errors: [
        {
          column: 12,
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'unaryMinus',
        },
      ],
    },
    {
      code: '(a: number[]) => -a;',
      errors: [
        {
          column: 18,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'unaryMinus',
        },
      ],
    },
    {
      code: "-'hello';",
      errors: [
        {
          column: 1,
          endColumn: 9,
          endLine: 1,
          line: 1,
          messageId: 'unaryMinus',
        },
      ],
    },
    {
      code: '-`hello`;',
      errors: [
        {
          column: 1,
          endColumn: 9,
          endLine: 1,
          line: 1,
          messageId: 'unaryMinus',
        },
      ],
    },
    {
      code: '(a: { x: number }) => -a;',
      errors: [
        {
          column: 23,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'unaryMinus',
        },
      ],
    },
    {
      code: '(a: unknown) => -a;',
      errors: [
        {
          column: 17,
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'unaryMinus',
        },
      ],
    },
    {
      code: '(a: void) => -a;',
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'unaryMinus',
        },
      ],
    },
    {
      code: '<T,>(t: T) => -t;',
      errors: [
        {
          column: 15,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'unaryMinus',
        },
      ],
    },
  ],
});
