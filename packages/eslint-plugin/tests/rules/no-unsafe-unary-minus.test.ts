import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-unary-minus';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

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
    '<T>(t: T & number) => -t;',
    '(a: { x: number }) => -a.x;',
    '(a: never) => -a;',
    '<T extends number>(t: T) => -t;',
  ],
  invalid: [
    { code: '(a: string) => -a;', errors: [{ messageId: 'unaryMinus' }] },
    { code: '(a: {}) => -a;', errors: [{ messageId: 'unaryMinus' }] },
    { code: '(a: number[]) => -a;', errors: [{ messageId: 'unaryMinus' }] },
    { code: "-'hello';", errors: [{ messageId: 'unaryMinus' }] },
    { code: '-`hello`;', errors: [{ messageId: 'unaryMinus' }] },
    {
      code: '(a: { x: number }) => -a;',
      errors: [{ messageId: 'unaryMinus' }],
    },
    { code: '(a: unknown) => -a;', errors: [{ messageId: 'unaryMinus' }] },
    { code: '(a: void) => -a;', errors: [{ messageId: 'unaryMinus' }] },
    { code: '<T>(t: T) => -t;', errors: [{ messageId: 'unaryMinus' }] },
  ],
});
