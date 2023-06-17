import type { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import type { ReportDescriptorMessageData } from '@typescript-eslint/utils/ts-eslint';

import type { DependencyConstraint } from './DependencyConstraint';
import type { ValidTestCase } from './ValidTestCase';

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
