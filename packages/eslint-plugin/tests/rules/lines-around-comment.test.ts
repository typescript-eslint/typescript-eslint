import rule from '../../src/rules/lines-around-comment';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('lines-around-comment', rule, {
  valid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/1150
    `
interface T {
  /**
   * No error
   */
  a: boolean;
}
    `,
  ],
  invalid: [],
});
