import { ValidTestCase, InvalidTestCase } from '../ts-eslint';

/**
 * Converts a batch of single line tests into a number of separate test cases.
 * This makes it easier to write tests which use the same options.
 *
 * Why wouldn't you just leave them as one test?
 * Because it makes the test error messages harder to decipher.
 * This way each line will fail separately, instead of them all failing together.
 */
function batchedSingleLineTests<TOptions extends Readonly<unknown[]>>(
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
function batchedSingleLineTests<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>
>(
  test: InvalidTestCase<TMessageIds, TOptions>,
): InvalidTestCase<TMessageIds, TOptions>[];
function batchedSingleLineTests<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>
>(
  options: ValidTestCase<TOptions> | InvalidTestCase<TMessageIds, TOptions>,
): (ValidTestCase<TOptions> | InvalidTestCase<TMessageIds, TOptions>)[] {
  // eslint counts lines from 1
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

export { batchedSingleLineTests };
