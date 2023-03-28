import type { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import type {
  Linter,
  ParserOptions,
  ReportDescriptorMessageData,
  SharedConfigurationSettings,
} from '@typescript-eslint/utils/ts-eslint';

import type { DependencyConstraint } from './utils/dependencyConstraints';

export interface RuleTesterConfig extends Linter.Config {
  /**
   * The default parser to use for tests.
   * @default '@typescript-eslint/parser'
   */
  readonly parser: string;
  /**
   * The default parser options to use for tests.
   */
  readonly parserOptions?: Readonly<ParserOptions>;
  /**
   * Constraints that must pass in the current environment for any tests to run.
   */
  readonly dependencyConstraints?: DependencyConstraint;
  /**
   * The default filenames to use for type-aware tests.
   * @default { ts: 'file.ts', tsx: 'react.tsx' }
   */
  readonly defaultFilenames?: Readonly<{
    ts: string;
    tsx: string;
  }>;
}

type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};
export type TesterConfigWithDefaults = Mutable<
  RuleTesterConfig &
    Required<Pick<RuleTesterConfig, 'parser' | 'rules' | 'defaultFilenames'>>
>;

export interface ValidTestCase<TOptions extends Readonly<unknown[]>> {
  /**
   * Name for the test case.
   */
  readonly name?: string;
  /**
   * Code for the test case.
   */
  readonly code: string;
  /**
   * Environments for the test case.
   */
  readonly env?: Readonly<Record<string, boolean>>;
  /**
   * The fake filename for the test case. Useful for rules that make assertion about filenames.
   */
  readonly filename?: string;
  /**
   * The additional global variables.
   */
  readonly globals?: Record<string, 'readonly' | 'writable' | 'off' | true>;
  /**
   * Options for the test case.
   */
  readonly options?: Readonly<TOptions>;
  /**
   * The absolute path for the parser.
   */
  readonly parser?: string;
  /**
   * Options for the parser.
   */
  readonly parserOptions?: Readonly<ParserOptions>;
  /**
   * Settings for the test case.
   */
  readonly settings?: Readonly<SharedConfigurationSettings>;
  /**
   * Run this case exclusively for debugging in supported test frameworks.
   */
  readonly only?: boolean;
  /**
   * Skip this case in supported test frameworks.
   */
  readonly skip?: boolean;
  /**
   * Constraints that must pass in the current environment for the test to run
   */
  readonly dependencyConstraints?: DependencyConstraint;
}

export interface SuggestionOutput<TMessageIds extends string> {
  /**
   * Reported message ID.
   */
  readonly messageId: TMessageIds;
  /**
   * The data used to fill the message template.
   */
  readonly data?: ReportDescriptorMessageData;
  /**
   * NOTE: Suggestions will be applied as a stand-alone change, without triggering multi-pass fixes.
   * Each individual error has its own suggestion, so you have to show the correct, _isolated_ output for each suggestion.
   */
  readonly output: string;

  // we disallow this because it's much better to use messageIds for reusable errors that are easily testable
  // readonly desc?: string;
}

export interface TestCaseError<TMessageIds extends string> {
  /**
   * The 1-based column number of the reported start location.
   */
  readonly column?: number;
  /**
   * The data used to fill the message template.
   */
  readonly data?: ReportDescriptorMessageData;
  /**
   * The 1-based column number of the reported end location.
   */
  readonly endColumn?: number;
  /**
   * The 1-based line number of the reported end location.
   */
  readonly endLine?: number;
  /**
   * The 1-based line number of the reported start location.
   */
  readonly line?: number;
  /**
   * Reported message ID.
   */
  readonly messageId: TMessageIds;
  /**
   * Reported suggestions.
   */
  readonly suggestions?: readonly SuggestionOutput<TMessageIds>[] | null;
  /**
   * The type of the reported AST node.
   */
  readonly type?: AST_NODE_TYPES | AST_TOKEN_TYPES;

  // we disallow this because it's much better to use messageIds for reusable errors that are easily testable
  // readonly message?: string | RegExp;
}

export interface InvalidTestCase<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>,
> extends ValidTestCase<TOptions> {
  /**
   * Expected errors.
   */
  readonly errors: readonly TestCaseError<TMessageIds>[];
  /**
   * The expected code after autofixes are applied. If set to `null`, the test runner will assert that no autofix is suggested.
   */
  readonly output?: string | null;
  /**
   * Constraints that must pass in the current environment for the test to run
   */
  readonly dependencyConstraints?: DependencyConstraint;
}

export interface RunTests<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>,
> {
  // RuleTester.run also accepts strings for valid cases
  readonly valid: readonly (ValidTestCase<TOptions> | string)[];
  readonly invalid: readonly InvalidTestCase<TMessageIds, TOptions>[];
}

export interface NormalizedRunTests<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>,
> {
  readonly valid: readonly ValidTestCase<TOptions>[];
  readonly invalid: readonly InvalidTestCase<TMessageIds, TOptions>[];
}
