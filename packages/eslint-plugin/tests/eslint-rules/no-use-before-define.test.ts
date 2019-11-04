import rule from 'eslint/lib/rules/no-use-before-define';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-use-before-define', rule, {
  valid: [
    `
      const updatedAt = data?.updatedAt;
    `,
  ],
  invalid: [],
});
