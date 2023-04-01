import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';
import { batchedSingleLineTests as batchedSingleLineTestsBase } from '@typescript-eslint/utils/eslint-utils';
import * as path from 'path';

export function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}

// TODO - migrate the codebase off of this utility
// this re-export exists to re-type the utility with the types from @typescript-eslint/rule-tester
export const batchedSingleLineTests = batchedSingleLineTestsBase as {
  /**
   * Converts a batch of single line tests into a number of separate test cases.
   * This makes it easier to write tests which use the same options.
   *
   * Why wouldn't you just leave them as one test?
   * Because it makes the test error messages harder to decipher.
   * This way each line will fail separately, instead of them all failing together.
   */
  <TOptions extends Readonly<unknown[]>>(
    test: ValidTestCase<TOptions>,
  ): ValidTestCase<TOptions>[];
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
   */
  <TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    test: InvalidTestCase<TMessageIds, TOptions>,
  ): InvalidTestCase<TMessageIds, TOptions>[];
};
