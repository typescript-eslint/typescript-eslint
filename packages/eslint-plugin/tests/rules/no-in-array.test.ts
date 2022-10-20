import rule from '../../src/rules/no-in-array';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2015,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-in-array', rule, {
  valid: [
    {
      code: `
if (x in {}) {
}
      `,
    },
  ],
  invalid: [
    {
      code: `
if (x in ['z', 'y']) {
}
      `,
      errors: [{ messageId: 'inArrayViolation' }],
    },
    {
      code: `
const arr = [5, 6, 7, 8];

const has_6 = 6 in arr;
      `,
      errors: [{ messageId: 'inArrayViolation' }],
    },
  ],
});
