import rule from '../../src/rules/no-duplicate-union-intersection';
import { RuleTester, noFormat } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-duplicate-union-intersection', rule, {
  valid: [
    'type T = any;',
    'type T = bigint;',
    'type T = boolean;',
    'type T = null;',
    'type T = never;',
    'type T = number;',
    'type T = object;',
    'type T = string;',
    'type T = symbol;',
    'type T = undefined;',
    'type T = unknown;',
    'type T = void;',
    'type T = 1;',
    'type T = 1 | 2;',
    "type T = 1 | '1';",
    "type T = 'A' | 'B';",
    'type T = A | B;',
    'type T = A<B> | A<C>;',
    'type T = A<B> | A<B | C>;',
    'type T = A<B | C> | A<B>;',
    'type T = A<B | C> | A<C | B>;',
    'type T = A.A | A.B;',
    'type T = A.A | B.A;',
    'type T = A.A.A | A.A.B;',
    'type T = { a: string } | { b: string };',
    'type T = (<A>() => void) | (<A>() => number);',
    'type T = (<A>() => void) | (<B>() => void);',
  ],
  invalid: [
    {
      code: 'type T = any | any;',
      output: 'type T = any;',
      errors: [{ messageId: 'duplicate', line: 1, column: 16 }],
    },
    {
      code: 'type T = bigint | bigint;',
      output: 'type T = bigint;',
      errors: [{ messageId: 'duplicate', line: 1, column: 19 }],
    },
    {
      code: 'type T = boolean | boolean;',
      output: 'type T = boolean;',
      errors: [{ messageId: 'duplicate', line: 1, column: 20 }],
    },
    {
      code: 'type T = never | never;',
      output: 'type T = never;',
      errors: [{ messageId: 'duplicate', line: 1, column: 18 }],
    },
    {
      code: 'type T = null | null;',
      output: 'type T = null;',
      errors: [{ messageId: 'duplicate', line: 1, column: 17 }],
    },
    {
      code: 'type T = number | number;',
      output: 'type T = number;',
      errors: [{ messageId: 'duplicate', line: 1, column: 19 }],
    },
    {
      code: 'type T = object | object;',
      output: 'type T = object;',
      errors: [{ messageId: 'duplicate', line: 1, column: 19 }],
    },
    {
      code: 'type T = string | string;',
      output: 'type T = string;',
      errors: [{ messageId: 'duplicate', line: 1, column: 19 }],
    },
    {
      code: 'type T = symbol | symbol;',
      output: 'type T = symbol;',
      errors: [{ messageId: 'duplicate', line: 1, column: 19 }],
    },
    {
      code: 'type T = undefined | undefined;',
      output: 'type T = undefined;',
      errors: [{ messageId: 'duplicate', line: 1, column: 22 }],
    },
    {
      code: 'type T = unknown | unknown;',
      output: 'type T = unknown;',
      errors: [{ messageId: 'duplicate', line: 1, column: 20 }],
    },
    {
      code: 'type T = void | void;',
      output: 'type T = void;',
      errors: [{ messageId: 'duplicate', line: 1, column: 17 }],
    },
    {
      code: 'type T = 1 | 1;',
      output: 'type T = 1;',
      errors: [{ messageId: 'duplicate', line: 1, column: 14 }],
    },
    {
      code: 'type T = 1 | 1 | 1;',
      // The autofixer won’t remove bordering text ranges in one run.
      output: 'type T = 1 | 1;',
      errors: [
        { messageId: 'duplicate', line: 1, column: 14 },
        { messageId: 'duplicate', line: 1, column: 18 },
      ],
    },
    {
      code: 'type T = 1 | 2 | 1 | 3 | 1;',
      output: 'type T = 1 | 2 | 3;',
      errors: [
        { messageId: 'duplicate', line: 1, column: 18 },
        { messageId: 'duplicate', line: 1, column: 26 },
      ],
    },
    {
      code: "type T = 'A' | 'A';",
      output: "type T = 'A';",
      errors: [{ messageId: 'duplicate', line: 1, column: 16 }],
    },
    {
      code: 'type T = A | A;',
      output: 'type T = A;',
      errors: [{ messageId: 'duplicate', line: 1, column: 14 }],
    },
    {
      code: 'type T = A<B> | A<B>;',
      output: 'type T = A<B>;',
      errors: [{ messageId: 'duplicate', line: 1, column: 17 }],
    },
    {
      code: 'type T = A.A | A.A;',
      output: 'type T = A.A;',
      errors: [{ messageId: 'duplicate', line: 1, column: 16 }],
    },
    {
      code: 'type T = A.A.A | A.A.A;',
      output: 'type T = A.A.A;',
      errors: [{ messageId: 'duplicate', line: 1, column: 18 }],
    },
    // XXX Test members
    {
      code: 'type T = {} | {};',
      output: 'type T = {};',
      errors: [{ messageId: 'duplicate', line: 1, column: 15 }],
    },
    {
      code: 'type T = { a: string } | { a: string };',
      output: 'type T = { a: string };',
      errors: [{ messageId: 'duplicate', line: 1, column: 15 }],
    },
    {
      code: 'type T = { a: string; b: number } | { b: number; a: string };',
      output: 'type T = { a: string };',
      errors: [{ messageId: 'duplicate', line: 1, column: 15 }],
    },
    {
      code: 'type T = (() => void) | (() => void);',
      output: noFormat`type T = (() => void);`,
      errors: [{ messageId: 'duplicate', line: 1, column: 25 }],
    },
    {
      code: 'type T = (<A>() => void) | (<A>() => void);',
      output: noFormat`type T = (<A>() => void);`,
      errors: [{ messageId: 'duplicate', line: 1, column: 28 }],
    },
    {
      code: 'type T = ((a: number) => void) | ((a: number) => void);',
      output: noFormat`type T = ((a: number) => void);`,
      errors: [{ messageId: 'duplicate', line: 1, column: 34 }],
    },
  ],
});
