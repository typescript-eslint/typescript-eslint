/* eslint-disable eslint-comments/no-use */
// this rule tests the new lines, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */
import rule from '../../src/rules/key-spacing';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('key-spacing', rule, {
  valid: [
    {
      code: 'interface X {\n  a:   number;\n  abc: string\n};',
    },
  ],
  invalid: [
    {
      code: 'interface X {\n  a: number;\n  abc: string\n};',
      errors: [{ messageId: 'missingValue' }],
    },
    {
      code: 'interface X {\n  a:   number;\n  abc:  string\n};',
      errors: [{ messageId: 'extraValue' }],
    },
  ],
});
