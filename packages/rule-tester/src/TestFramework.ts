/**
 * @param text a string describing the rule
 * @param callback the test callback
 */
type RuleTesterTestFrameworkFunction = (
  text: string,
  callback: () => void,
) => void;
type RuleTesterTestFrameworkItFunction = RuleTesterTestFrameworkFunction & {
  only?: RuleTesterTestFrameworkFunction;
};

/**
 * @param fn a callback called after all the tests are done
 */
type AfterAll = (fn: () => void) => void;

let OVERRIDE_AFTER_ALL: AfterAll | null | undefined = undefined;
let OVERRIDE_DESCRIBE: RuleTesterTestFrameworkFunction | null | undefined =
  undefined;
let OVERRIDE_IT: RuleTesterTestFrameworkItFunction | null | undefined =
  undefined;
let OVERRIDE_IT_ONLY: RuleTesterTestFrameworkFunction | null | undefined =
  undefined;

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
  static set afterAll(value: AfterAll | null | undefined) {
    OVERRIDE_AFTER_ALL = value;
  }

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
  static set describe(
    value: RuleTesterTestFrameworkFunction | null | undefined,
  ) {
    OVERRIDE_DESCRIBE = value;
  }

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
  static set it(value: RuleTesterTestFrameworkItFunction | null | undefined) {
    OVERRIDE_IT = value;
  }

  static get itOnly(): RuleTesterTestFrameworkFunction {
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
  static set itOnly(value: RuleTesterTestFrameworkFunction | null | undefined) {
    OVERRIDE_IT_ONLY = value;
  }
}
