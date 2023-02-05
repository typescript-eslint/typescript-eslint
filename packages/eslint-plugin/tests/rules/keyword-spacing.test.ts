/* eslint-disable eslint-comments/no-use */
// this rule tests the spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */
import type { TSESLint } from '@typescript-eslint/utils';

import type { MessageIds, Options } from '../../src/rules/keyword-spacing';
import rule from '../../src/rules/keyword-spacing';
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
    {
      code: 'import type { foo } from "foo";',
      options: [BOTH],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import type * as Foo from 'foo'",
      options: [BOTH],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'import type { SavedQueries } from "./SavedQueries.js";',
      options: [
        {
          before: true,
          after: false,
          overrides: {
            else: { after: true },
            return: { after: true },
            try: { after: true },
            catch: { after: false },
            case: { after: true },
            const: { after: true },
            throw: { after: true },
            let: { after: true },
            do: { after: true },
            of: { after: true },
            as: { after: true },
            finally: { after: true },
            from: { after: true },
            import: { after: true },
            export: { after: true },
            default: { after: true },
            // The new option:
            type: { after: true },
          },
        },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      // Space after import is not configurable from option since it's invalid syntax with import type
      code: 'import type { SavedQueries } from "./SavedQueries.js";',
      options: [
        {
          before: true,
          after: true,
          overrides: {
            import: { after: false },
          },
        },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import type{SavedQueries} from './SavedQueries.js';",
      options: [
        {
          before: true,
          after: false,
          overrides: {
            from: { after: true },
          },
        },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import type{SavedQueries} from'./SavedQueries.js';",
      options: [
        {
          before: true,
          after: false,
        },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import type http from 'node:http';",
      options: [
        {
          before: true,
          after: false,
          overrides: {
            from: { after: true },
          },
        },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: "import type http from'node:http';",
      options: [
        {
          before: true,
          after: false,
        },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'import type {} from "foo";',
      options: [BOTH],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'import type { foo1, foo2 } from "foo";',
      options: [BOTH],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'import type { foo1 as _foo1, foo2 as _foo2 } from "foo";',
      options: [BOTH],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
    },
    {
      code: 'import type { foo as bar } from "foo";',
      options: [BOTH],
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
    {
      code: 'import type{ foo } from "foo";',
      output: 'import type { foo } from "foo";',
      options: [{ after: true, before: true }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: expectedAfter('type'),
    },
    {
      code: 'import type { foo } from"foo";',
      output: 'import type{ foo } from"foo";',
      options: [{ after: false, before: true }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: unexpectedAfter('type'),
    },
    {
      code: 'import type* as foo from "foo";',
      output: 'import type * as foo from "foo";',
      options: [{ after: true, before: true }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: expectedAfter('type'),
    },
    {
      code: 'import type * as foo from"foo";',
      output: 'import type* as foo from"foo";',
      options: [{ after: false, before: true }],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: unexpectedAfter('type'),
    },
    {
      code: "import type {SavedQueries} from './SavedQueries.js';",
      output: "import type{SavedQueries} from './SavedQueries.js';",
      options: [
        {
          before: true,
          after: false,
          overrides: {
            from: { after: true },
          },
        },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: unexpectedAfter('type'),
    },
    {
      code: "import type {SavedQueries} from './SavedQueries.js';",
      output: "import type{SavedQueries} from'./SavedQueries.js';",
      options: [
        {
          before: true,
          after: false,
        },
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      errors: [
        { messageId: 'unexpectedAfter', data: { value: 'type' } },
        { messageId: 'unexpectedAfter', data: { value: 'from' } },
      ],
    },
  ],
});
