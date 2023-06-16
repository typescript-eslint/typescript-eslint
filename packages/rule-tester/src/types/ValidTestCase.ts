import type {
  ParserOptions,
  SharedConfigurationSettings,
} from '@typescript-eslint/utils/ts-eslint';

import type { DependencyConstraint } from './DependencyConstraint';

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
