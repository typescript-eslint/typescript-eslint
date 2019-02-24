import rule from 'eslint/lib/rules/no-restricted-globals';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-restricted-globals', rule, {
  valid: [
    // https://github.com/eslint/typescript-eslint-parser/issues/487
    {
      code: `
export default class Test {
    private status: string;
    getStatus() {
        return this.status;
    }
}
      `,
      options: ['status'],
    },
  ],
  invalid: [],
});
