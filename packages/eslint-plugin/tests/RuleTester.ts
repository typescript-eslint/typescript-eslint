import { ParserOptions } from '@typescript-eslint/parser';
import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/typescript-estree';
import { RuleTester as ESLintRuleTester } from 'eslint';
import * as path from 'path';
import RuleModule from 'ts-eslint';

interface ValidTestCase<TOptions extends Readonly<any[]>> {
  code: string;
  options?: TOptions;
  filename?: string;
  parserOptions?: ParserOptions;
  settings?: Record<string, any>;
  parser?: string;
  globals?: Record<string, boolean>;
  env?: {
    browser?: boolean;
  };
}

interface InvalidTestCase<
  TMessageIds extends string,
  TOptions extends Readonly<any[]>
> extends ValidTestCase<TOptions> {
  errors: TestCaseError<TMessageIds>[];
  output?: string | null;
}

interface TestCaseError<TMessageIds extends string> {
  messageId: TMessageIds;
  data?: Record<string, any>;
  type?: AST_NODE_TYPES | AST_TOKEN_TYPES;
  line?: number;
  column?: number;
}

interface RunTests<
  TMessageIds extends string,
  TOptions extends Readonly<any[]>
> {
  // RuleTester.run also accepts strings for valid cases
  valid: (ValidTestCase<TOptions> | string)[];
  invalid: InvalidTestCase<TMessageIds, TOptions>[];
}

declare class RuleTesterTyped {
  run<TMessageIds extends string, TOptions extends Readonly<any[]>>(
    name: string,
    rule: RuleModule<TMessageIds, TOptions>,
    tests: RunTests<TMessageIds, TOptions>,
  ): void;
}

const RuleTester = (ESLintRuleTester as any) as {
  new (config?: {
    parser: '@typescript-eslint/parser';
    parserOptions?: ParserOptions;
  }): RuleTesterTyped;
};

function getFixturesRootDir() {
  return path.join(process.cwd(), 'tests/fixtures/');
}

/**
 * Converts a batch of single line tests into a number of separate test cases.
 * This makes it easier to write tests which use the same options.
 *
 * Why wouldn't you just leave them as one test?
 * Because it makes the test error messages harder to decipher.
 * This way each line will fail separately, instead of them all failing together.
 */
function batchedSingleLineTests<TOptions extends Readonly<any[]>>(
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
  TOptions extends Readonly<any[]>
>(
  test: InvalidTestCase<TMessageIds, TOptions>,
): InvalidTestCase<TMessageIds, TOptions>[];
function batchedSingleLineTests<
  TMessageIds extends string,
  TOptions extends Readonly<any[]>
>(
  options: ValidTestCase<TOptions> | InvalidTestCase<TMessageIds, TOptions>,
): (ValidTestCase<TOptions> | InvalidTestCase<TMessageIds, TOptions>)[] {
  // eslint counts lines from 1
  const lineOffset = options.code[0] === '\n' ? 2 : 1;
  return options.code
    .trim()
    .split('\n')
    .map((code, i) => {
      const lineNum = i + lineOffset;
      const errors =
        'errors' in options
          ? options.errors.filter(e => e.line === lineNum)
          : [];
      return {
        ...options,
        code,
        errors: errors.map(e => ({
          ...e,
          line: 1,
        })),
      };
    });
}

export {
  RuleTester,
  RunTests,
  TestCaseError,
  InvalidTestCase,
  ValidTestCase,
  batchedSingleLineTests,
  getFixturesRootDir,
};
