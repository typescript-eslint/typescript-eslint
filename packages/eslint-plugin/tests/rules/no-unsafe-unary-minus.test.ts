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
  ],
  invalid: [
    { code: '(a: string) => -a;', errors: [{ messageId: 'unaryMinus' }] },
    { code: '(a: {}) => -a;', errors: [{ messageId: 'unaryMinus' }] },
  ],
});
