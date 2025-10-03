import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import type { ParserOptions } from '@typescript-eslint/utils/ts-eslint';

import { RuleTester } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

export function createRuleTesterWithTypes(
  providedParserOptions: ParserOptions | undefined = {},
): RuleTester {
  const parserOptions = {
    ...providedParserOptions,
    tsconfigRootDir:
      providedParserOptions.tsconfigRootDir ?? getFixturesRootDir(),
  };

  // If the test has requested a specific project, disable projectService
  // (regardless of whether it's being switched to by TYPESCRIPT_ESLINT_PROJECT_SERVICE)
  if (parserOptions.project) {
    parserOptions.projectService = false;
  }
  // Otherwise, use the project service for types if requested in the env
  else if (process.env.TYPESCRIPT_ESLINT_PROJECT_SERVICE) {
    parserOptions.projectService = true;
  }

  return new RuleTester({
    languageOptions: { parserOptions },
  });
}

export function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}

/**
 * Converts a batch of single line tests into a number of separate test cases.
 * This makes it easier to write tests which use the same options.
 *
 * Why wouldn't you just leave them as one test?
 * Because it makes the test error messages harder to decipher.
 * This way each line will fail separately, instead of them all failing together.
 *
 * @deprecated - DO NOT USE THIS FOR NEW RULES
 */
export function batchedSingleLineTests<Options extends readonly unknown[]>(
  test: ValidTestCase<Options>,
): ValidTestCase<Options>[];
/**
 * Converts a batch of single line tests into a number of separate test cases.
 * This makes it easier to write tests which use the same options.
 *
 * Why wouldn't you just leave them as one test?
 * Because it makes the test error messages harder to decipher.
 * This way each line will fail separately, instead of them all failing together.
 *
 * Make sure you have your line numbers correct for error reporting, as it will match
 * the line numbers up with the split tests!
 *
 * @deprecated - DO NOT USE THIS FOR NEW RULES
 */
export function batchedSingleLineTests<
  MessageIds extends string,
  Options extends readonly unknown[],
>(
  test: InvalidTestCase<MessageIds, Options>,
): InvalidTestCase<MessageIds, Options>[];
export function batchedSingleLineTests<
  MessageIds extends string,
  Options extends readonly unknown[],
>(
  options:
    | ValidTestCase<Options>
    | ({
        output?: string | null;
      } & Omit<InvalidTestCase<MessageIds, Options>, 'output'>),
): (InvalidTestCase<MessageIds, Options> | ValidTestCase<Options>)[] {
  // -- eslint counts lines from 1
  const lineOffset = options.code.startsWith('\n') ? 2 : 1;
  const output =
    'output' in options && options.output
      ? options.output.trim().split('\n')
      : null;
  return options.code
    .trim()
    .split('\n')
    .map((code, i) => {
      const lineNum = i + lineOffset;
      const errors =
        'errors' in options
          ? options.errors.filter(e => e.line === lineNum)
          : [];
      const returnVal = {
        ...options,
        code,
        errors: errors.map(e => ({
          ...e,
          line: 1,
        })),
      };
      if (output?.[i]) {
        return {
          ...returnVal,
          output: output[i],
        };
      }
      return returnVal;
    });
}
