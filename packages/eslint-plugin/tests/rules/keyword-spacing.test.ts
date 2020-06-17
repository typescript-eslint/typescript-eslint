/* eslint-disable eslint-comments/no-use */
// this rule tests the spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */
import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule, { MessageIds, Options } from '../../src/rules/keyword-spacing';
import { RuleTester } from '../RuleTester';

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const BOTH = { before: true, after: true };
const NEITHER = { before: false, after: false };

/**
 * Creates an option object to test an 'overrides' option.
 *
 * e.g.
 *
 *     override('as', BOTH)
 *
 * returns
 *
 *     {
 *         before: false,
 *         after: false,
 *         overrides: {as: {before: true, after: true}}
 *     }
 * @param keyword A keyword to be overridden.
 * @param value A value to override.
 * @returns An option object to test an 'overrides' option.
 */
function overrides(keyword: string, value: Options[0]): Options[0] {
  return {
    before: value.before === false,
    after: value.after === false,
    overrides: { [keyword]: value },
  };
}

/**
 * Gets an error message that expected space(s) before a specified keyword.
 * @param keyword A keyword.
 * @returns An error message.
 */
function expectedBefore(keyword: string): TSESLint.TestCaseError<MessageIds>[] {
  return [{ messageId: 'expectedBefore', data: { value: keyword } }];
}

/**
 * Gets an error message that expected space(s) after a specified keyword.
 * @param keyword A keyword.
 * @returns An error message.
 */
function expectedAfter(keyword: string): TSESLint.TestCaseError<MessageIds>[] {
  return [{ messageId: 'expectedAfter', data: { value: keyword } }];
}

/**
 * Gets an error message that unexpected space(s) before a specified keyword.
 * @param keyword A keyword.
 * @returns An error message.
 */
function unexpectedBefore(
  keyword: string,
): TSESLint.TestCaseError<MessageIds>[] {
  return [{ messageId: 'unexpectedBefore', data: { value: keyword } }];
}

/**
 * Gets an error message that unexpected space(s) after a specified keyword.
 * @param keyword A keyword.
 * @returns An error message.
 */
function unexpectedAfter(
  keyword: string,
): TSESLint.TestCaseError<MessageIds>[] {
  return [{ messageId: 'unexpectedAfter', data: { value: keyword } }];
}

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('keyword-spacing', rule, {
  valid: [
    //----------------------------------------------------------------------
    // as (typing)
    //----------------------------------------------------------------------
    {
      code: 'const foo = {} as {};',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'const foo = {}as{};',
      options: [NEITHER],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'const foo = {} as {};',
      options: [overrides('as', BOTH)],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'const foo = {}as{};',
      options: [overrides('as', NEITHER)],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'const foo = {} as {};',
      options: [{ overrides: { as: {} } }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
  ],
  invalid: [
    //----------------------------------------------------------------------
    // as (typing)
    //----------------------------------------------------------------------
    {
      code: 'const foo = {}as {};',
      output: 'const foo = {} as {};',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: expectedBefore('as'),
    },
    {
      code: 'const foo = {} as{};',
      output: 'const foo = {}as{};',
      options: [NEITHER],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: unexpectedBefore('as'),
    },
    {
      code: 'const foo = {} as{};',
      output: 'const foo = {} as {};',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: expectedAfter('as'),
    },
    {
      code: 'const foo = {}as {};',
      output: 'const foo = {}as{};',
      options: [NEITHER],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: unexpectedAfter('as'),
    },
    {
      code: 'const foo = {} as{};',
      output: 'const foo = {} as {};',
      options: [{ overrides: { as: {} } }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: expectedAfter('as'),
    },
  ],
});
