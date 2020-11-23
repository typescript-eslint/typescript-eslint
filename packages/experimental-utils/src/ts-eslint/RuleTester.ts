import { RuleTester as ESLintRuleTester } from 'eslint';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '../ts-estree';
import { ParserOptions } from './ParserOptions';
import { RuleCreateFunction, RuleModule } from './Rule';

interface ValidTestCase<TOptions extends Readonly<unknown[]>> {
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
  readonly settings?: Readonly<Record<string, unknown>>;
}

interface SuggestionOutput<TMessageIds extends string> {
  /**
   * Reported message ID.
   */
  readonly messageId: TMessageIds;
  /**
   * The data used to fill the message template.
   */
  readonly data?: Readonly<Record<string, unknown>>;
  /**
   * NOTE: Suggestions will be applied as a stand-alone change, without triggering multi-pass fixes.
   * Each individual error has its own suggestion, so you have to show the correct, _isolated_ output for each suggestion.
   */
  readonly output: string;

  // we disallow this because it's much better to use messageIds for reusable errors that are easily testable
  // readonly desc?: string;
}

interface InvalidTestCase<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>
> extends ValidTestCase<TOptions> {
  /**
   * Expected errors.
   */
  readonly errors: readonly TestCaseError<TMessageIds>[];
  /**
   * The expected code after autofixes are applied. If set to `null`, the test runner will assert that no autofix is suggested.
   */
  readonly output?: string | null;
}

interface TestCaseError<TMessageIds extends string> {
  /**
   * The 1-based column number of the reported start location.
   */
  readonly column?: number;
  /**
   * The data used to fill the message template.
   */
  readonly data?: Readonly<Record<string, unknown>>;
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
  readonly suggestions?: SuggestionOutput<TMessageIds>[] | null;
  /**
   * The type of the reported AST node.
   */
  readonly type?: AST_NODE_TYPES | AST_TOKEN_TYPES;

  // we disallow this because it's much better to use messageIds for reusable errors that are easily testable
  // readonly message?: string | RegExp;
}

interface RunTests<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>
> {
  // RuleTester.run also accepts strings for valid cases
  readonly valid: readonly (ValidTestCase<TOptions> | string)[];
  readonly invalid: readonly InvalidTestCase<TMessageIds, TOptions>[];
}
interface RuleTesterConfig {
  // should be require.resolve(parserPackageName)
  readonly parser: string;
  readonly parserOptions?: Readonly<ParserOptions>;
}

declare class RuleTesterBase {
  /**
   * Creates a new instance of RuleTester.
   * @param testerConfig extra configuration for the tester
   */
  constructor(testerConfig?: RuleTesterConfig);

  /**
   * Adds a new rule test to execute.
   * @param ruleName The name of the rule to run.
   * @param rule The rule to test.
   * @param test The collection of tests to run.
   */
  run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    ruleName: string,
    rule: RuleModule<TMessageIds, TOptions>,
    tests: RunTests<TMessageIds, TOptions>,
  ): void;

  /**
   * If you supply a value to this property, the rule tester will call this instead of using the version defined on
   * the global namespace.
   * @param text a string describing the rule
   * @param callback the test callback
   */
  static describe?: (text: string, callback: () => void) => void;

  /**
   * If you supply a value to this property, the rule tester will call this instead of using the version defined on
   * the global namespace.
   * @param text a string describing the test case
   * @param callback the test callback
   */
  static it?: (text: string, callback: () => void) => void;

  /**
   * Define a rule for one particular run of tests.
   * @param name The name of the rule to define.
   * @param rule The rule definition.
   */
  defineRule<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    name: string,
    rule:
      | RuleModule<TMessageIds, TOptions>
      | RuleCreateFunction<TMessageIds, TOptions>,
  ): void;
}

class RuleTester extends (ESLintRuleTester as typeof RuleTesterBase) {}

export {
  InvalidTestCase,
  SuggestionOutput,
  RuleTester,
  RuleTesterConfig,
  RunTests,
  TestCaseError,
  ValidTestCase,
};
