import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule, {
  Option,
  RootOption,
  MessageIds,
} from '../../src/rules/keyword-spacing';
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
 * @param keyword A keyword to be overriden.
 * @param value A value to override.
 * @returns An option object to test an 'overrides' option.
 */
function override(keyword: string, value: Option): RootOption {
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
 * Gets an error message that unexpected space(s) before a specified keyword.
 * @param keyword A keyword.
 * @returns An error message.
 */
function unexpectedBefore(
  keyword: string,
): TSESLint.TestCaseError<MessageIds>[] {
  return [{ messageId: 'unexpectedBefore', data: { value: keyword } }];
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
      code: 'const foo = {} as {}',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'const foo = {}as{}',
      options: [NEITHER],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'const foo = {} as {}',
      options: [override('as', BOTH)],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'const foo = {}as{}',
      options: [override('as', NEITHER)],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
  ],
  invalid: [
    //----------------------------------------------------------------------
    // as (typing)
    //----------------------------------------------------------------------
    {
      code: 'const foo = {}as {}',
      output: 'const foo = {} as {}',
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: expectedBefore('as'),
    },
    {
      code: 'const foo = {} as{}',
      output: 'const foo = {}as{}',
      options: [NEITHER],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: unexpectedBefore('as'),
    },
  ],
});
