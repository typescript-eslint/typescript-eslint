/**
 * @param text a string describing the rule
 * @param callback the test callback
 */
export type RuleTesterTestFrameworkFunctionBase = (
  text: string,
  callback: () => void,
) => void;
export type RuleTesterTestFrameworkFunction =
  RuleTesterTestFrameworkFunctionBase & {
    /**
     * Skips running the tests inside this `describe` for the current file
     */
    skip?: RuleTesterTestFrameworkFunctionBase;
  };
export type RuleTesterTestFrameworkItFunction =
  RuleTesterTestFrameworkFunctionBase & {
    /**
     * Only runs this test in the current file.
     */
    only?: RuleTesterTestFrameworkFunctionBase;
    /**
     * Skips running this test in the current file.
     */
    skip?: RuleTesterTestFrameworkFunctionBase;
  };

type Maybe<T> = T | null | undefined;

/**
 * @param fn a callback called after all the tests are done
 */
type AfterAll = (fn: () => void) => void;

let OVERRIDE_AFTER_ALL: Maybe<AfterAll> = null;
let OVERRIDE_DESCRIBE: Maybe<RuleTesterTestFrameworkFunction> = null;
let OVERRIDE_DESCRIBE_SKIP: Maybe<RuleTesterTestFrameworkFunctionBase> = null;
let OVERRIDE_IT: Maybe<RuleTesterTestFrameworkItFunction> = null;
let OVERRIDE_IT_ONLY: Maybe<RuleTesterTestFrameworkFunctionBase> = null;
let OVERRIDE_IT_SKIP: Maybe<RuleTesterTestFrameworkFunctionBase> = null;

/*
 * NOTE - If people use `mocha test.js --watch` command, the test function
 * instances are different for each execution.
 * This is why the getters get fresh instance always.
 */

/**
 * Defines a test framework used by the rule tester
 * This class defaults to using functions defined on the global scope, but also
 * allows the user to manually supply functions in case they want to roll their
 * own tooling
 */
export abstract class TestFramework {
  /**
   * Runs a function after all the tests in this file have completed.
   */
  static get afterAll(): AfterAll {
    if (OVERRIDE_AFTER_ALL != null) {
      return OVERRIDE_AFTER_ALL;
    }
    if (typeof afterAll === 'function') {
      return afterAll;
    }
    throw new Error(
      'Missing definition for `afterAll` - you must set one using `RuleTester.afterAll` or there must be one defined globally as `afterAll`.',
    );
  }
  static set afterAll(value: Maybe<AfterAll>) {
    OVERRIDE_AFTER_ALL = value;
  }

  /**
   * Creates a test grouping
   */
  static get describe(): RuleTesterTestFrameworkFunction {
    if (OVERRIDE_DESCRIBE != null) {
      return OVERRIDE_DESCRIBE;
    }
    if (typeof describe === 'function') {
      return describe;
    }
    throw new Error(
      'Missing definition for `describe` - you must set one using `RuleTester.describe` or there must be one defined globally as `describe`.',
    );
  }
  static set describe(value: Maybe<RuleTesterTestFrameworkFunction>) {
    OVERRIDE_DESCRIBE = value;
  }

  /**
   * Skips running the tests inside this `describe` for the current file
   */
  static get describeSkip(): RuleTesterTestFrameworkFunctionBase {
    if (OVERRIDE_DESCRIBE_SKIP != null) {
      return OVERRIDE_DESCRIBE_SKIP;
    }
    if (
      typeof OVERRIDE_DESCRIBE === 'function' &&
      typeof OVERRIDE_DESCRIBE.skip === 'function'
    ) {
      return OVERRIDE_DESCRIBE.skip.bind(OVERRIDE_DESCRIBE);
    }
    if (typeof describe === 'function' && typeof describe.skip === 'function') {
      return describe.skip.bind(describe);
    }
    if (
      typeof OVERRIDE_DESCRIBE === 'function' ||
      typeof OVERRIDE_IT === 'function'
    ) {
      throw new Error(
        'Set `RuleTester.describeSkip` to use `dependencyConstraints` with a custom test framework.',
      );
    }
    if (typeof describe === 'function') {
      throw new Error(
        'The current test framework does not support skipping tests tests with `dependencyConstraints`.',
      );
    }
    throw new Error(
      'Missing definition for `describeSkip` - you must set one using `RuleTester.describeSkip` or there must be one defined globally as `describe.skip`.',
    );
  }
  static set describeSkip(value: Maybe<RuleTesterTestFrameworkFunctionBase>) {
    OVERRIDE_DESCRIBE_SKIP = value;
  }

  /**
   * Creates a test closure
   */
  static get it(): RuleTesterTestFrameworkItFunction {
    if (OVERRIDE_IT != null) {
      return OVERRIDE_IT;
    }
    if (typeof it === 'function') {
      return it;
    }
    throw new Error(
      'Missing definition for `it` - you must set one using `RuleTester.it` or there must be one defined globally as `it`.',
    );
  }
  static set it(value: Maybe<RuleTesterTestFrameworkItFunction>) {
    OVERRIDE_IT = value;
  }

  /**
   * Only runs this test in the current file.
   */
  static get itOnly(): RuleTesterTestFrameworkFunctionBase {
    if (OVERRIDE_IT_ONLY != null) {
      return OVERRIDE_IT_ONLY;
    }
    if (
      typeof OVERRIDE_IT === 'function' &&
      typeof OVERRIDE_IT.only === 'function'
    ) {
      return OVERRIDE_IT.only.bind(OVERRIDE_IT);
    }
    if (typeof it === 'function' && typeof it.only === 'function') {
      return it.only.bind(it);
    }
    if (
      typeof OVERRIDE_DESCRIBE === 'function' ||
      typeof OVERRIDE_IT === 'function'
    ) {
      throw new Error(
        'Set `RuleTester.itOnly` to use `only` with a custom test framework.\n' +
          'See https://eslint.org/docs/latest/integrate/nodejs-api#customizing-ruletester for more.',
      );
    }
    if (typeof it === 'function') {
      throw new Error(
        'The current test framework does not support exclusive tests with `only`.',
      );
    }
    throw new Error(
      'Missing definition for `itOnly` - you must set one using `RuleTester.itOnly` or there must be one defined globally as `it.only`.',
    );
  }
  static set itOnly(value: Maybe<RuleTesterTestFrameworkFunctionBase>) {
    OVERRIDE_IT_ONLY = value;
  }

  /**
   * Skips running this test in the current file.
   */
  static get itSkip(): RuleTesterTestFrameworkFunctionBase {
    if (OVERRIDE_IT_SKIP != null) {
      return OVERRIDE_IT_SKIP;
    }
    if (
      typeof OVERRIDE_IT === 'function' &&
      typeof OVERRIDE_IT.skip === 'function'
    ) {
      return OVERRIDE_IT.skip.bind(OVERRIDE_IT);
    }
    if (typeof it === 'function' && typeof it.skip === 'function') {
      return it.skip.bind(it);
    }
    if (
      typeof OVERRIDE_DESCRIBE === 'function' ||
      typeof OVERRIDE_IT === 'function'
    ) {
      throw new Error(
        'Set `RuleTester.itSkip` to use `only` with a custom test framework.',
      );
    }
    if (typeof it === 'function') {
      throw new Error(
        'The current test framework does not support exclusive tests with `only`.',
      );
    }
    throw new Error(
      'Missing definition for `itSkip` - you must set one using `RuleTester.itSkip` or there must be one defined globally as `it.only`.',
    );
  }
  static set itSkip(value: Maybe<RuleTesterTestFrameworkFunctionBase>) {
    OVERRIDE_IT_SKIP = value;
  }
}
