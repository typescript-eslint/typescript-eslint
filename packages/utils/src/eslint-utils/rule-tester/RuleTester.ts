import type * as TSESTreeType from '@typescript-eslint/typescript-estree';
import assert from 'assert';
import { version as eslintVersion } from 'eslint/package.json';
import * as path from 'path';
import * as semver from 'semver';

import type { ParserOptions } from '../../ts-eslint/ParserOptions';
import type { RuleModule } from '../../ts-eslint/Rule';
import type { RuleTesterTestFrameworkFunction } from '../../ts-eslint/RuleTester';
import * as BaseRuleTester from '../../ts-eslint/RuleTester';
import { deepMerge } from '../deepMerge';
import type { DependencyConstraint } from './dependencyConstraints';
import { satisfiesAllDependencyConstraints } from './dependencyConstraints';

const TS_ESLINT_PARSER = '@typescript-eslint/parser';
const ERROR_MESSAGE = `Do not set the parser at the test level unless you want to use a parser other than ${TS_ESLINT_PARSER}`;

type RuleTesterConfig = Omit<BaseRuleTester.RuleTesterConfig, 'parser'> & {
  parser: typeof TS_ESLINT_PARSER;
  /**
   * Constraints that must pass in the current environment for any tests to run
   */
  dependencyConstraints?: DependencyConstraint;
};

interface InvalidTestCase<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>,
> extends BaseRuleTester.InvalidTestCase<TMessageIds, TOptions> {
  /**
   * Constraints that must pass in the current environment for the test to run
   */
  dependencyConstraints?: DependencyConstraint;
}
interface ValidTestCase<TOptions extends Readonly<unknown[]>>
  extends BaseRuleTester.ValidTestCase<TOptions> {
  /**
   * Constraints that must pass in the current environment for the test to run
   */
  dependencyConstraints?: DependencyConstraint;
}
interface RunTests<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>,
> {
  // RuleTester.run also accepts strings for valid cases
  readonly valid: readonly (ValidTestCase<TOptions> | string)[];
  readonly invalid: readonly InvalidTestCase<TMessageIds, TOptions>[];
}

type AfterAll = (fn: () => void) => void;

function isDescribeWithSkip(
  value: unknown,
): value is RuleTesterTestFrameworkFunction & {
  skip: RuleTesterTestFrameworkFunction;
} {
  return (
    typeof value === 'object' &&
    value != null &&
    'skip' in value &&
    typeof (value as Record<string, unknown>).skip === 'function'
  );
}

class RuleTester extends BaseRuleTester.RuleTester {
  readonly #baseOptions: RuleTesterConfig;

  static #afterAll: AfterAll | undefined;
  /**
   * If you supply a value to this property, the rule tester will call this instead of using the version defined on
   * the global namespace.
   */
  static get afterAll(): AfterAll {
    return (
      this.#afterAll ??
      (typeof afterAll === 'function' ? afterAll : (): void => {})
    );
  }
  static set afterAll(value: AfterAll | undefined) {
    this.#afterAll = value;
  }

  private get staticThis(): typeof RuleTester {
    // the cast here is due to https://github.com/microsoft/TypeScript/issues/3841
    return this.constructor as typeof RuleTester;
  }

  constructor(baseOptions: RuleTesterConfig) {
    // eslint will hard-error if you include non-standard top-level properties
    const { dependencyConstraints: _, ...baseOptionsSafeForESLint } =
      baseOptions;
    super({
      ...baseOptionsSafeForESLint,
      parserOptions: {
        ...baseOptions.parserOptions,
        warnOnUnsupportedTypeScriptVersion:
          baseOptions.parserOptions?.warnOnUnsupportedTypeScriptVersion ??
          false,
      },
      // as of eslint 6 you have to provide an absolute path to the parser
      // but that's not as clean to type, this saves us trying to manually enforce
      // that contributors require.resolve everything
      parser: require.resolve(baseOptions.parser),
    });

    this.#baseOptions = baseOptions;

    // make sure that the parser doesn't hold onto file handles between tests
    // on linux (i.e. our CI env), there can be very a limited number of watch handles available
    this.staticThis.afterAll(() => {
      try {
        // instead of creating a hard dependency, just use a soft require
        // a bit weird, but if they're using this tooling, it'll be installed
        const parser = require(TS_ESLINT_PARSER) as typeof TSESTreeType;
        parser.clearCaches();
      } catch {
        // ignored on purpose
      }
    });
  }
  private getFilename(testOptions?: ParserOptions): string {
    const resolvedOptions = deepMerge(
      this.#baseOptions.parserOptions,
      testOptions,
    ) as ParserOptions;
    const filename = `file.ts${resolvedOptions.ecmaFeatures?.jsx ? 'x' : ''}`;
    if (resolvedOptions.project) {
      return path.join(
        resolvedOptions.tsconfigRootDir != null
          ? resolvedOptions.tsconfigRootDir
          : process.cwd(),
        filename,
      );
    }
    return filename;
  }

  // as of eslint 6 you have to provide an absolute path to the parser
  // If you don't do that at the test level, the test will fail somewhat cryptically...
  // This is a lot more explicit
  run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    name: string,
    rule: RuleModule<TMessageIds, TOptions>,
    testsReadonly: RunTests<TMessageIds, TOptions>,
  ): void {
    if (
      this.#baseOptions.dependencyConstraints &&
      !satisfiesAllDependencyConstraints(
        this.#baseOptions.dependencyConstraints,
      )
    ) {
      if (isDescribeWithSkip(this.staticThis.describe)) {
        // for frameworks like mocha or jest that have a "skip" version of their function
        // we can provide a nice skipped test!
        this.staticThis.describe.skip(name, () => {
          this.staticThis.it(
            'All tests skipped due to unsatisfied constructor dependency constraints',
            () => {},
          );
        });
      } else {
        // otherwise just declare an empty test
        this.staticThis.describe(name, () => {
          this.staticThis.it(
            'All tests skipped due to unsatisfied constructor dependency constraints',
            () => {
              // some frameworks error if there are no assertions
              assert.equal(true, true);
            },
          );
        });
      }

      // don't run any tests because we don't match the base constraint
      return;
    }

    const tests = {
      // standardize the valid tests as objects
      valid: testsReadonly.valid.map(test => {
        if (typeof test === 'string') {
          return {
            code: test,
          };
        }
        return test;
      }),
      invalid: testsReadonly.invalid,
    };

    // convenience iterator to make it easy to loop all tests without a concat
    const allTestsIterator = {
      *[Symbol.iterator](): Generator<ValidTestCase<TOptions>, void, unknown> {
        for (const test of tests.valid) {
          yield test;
        }
        for (const test of tests.invalid) {
          yield test;
        }
      },
    };

    /*
    Automatically add a filename to the tests to enable type-aware tests to "just work".
    This saves users having to verbosely and manually add the filename to every
    single test case.
    Hugely helps with the string-based valid test cases as it means they don't
    need to be made objects!
    Also removes dependencyConstraints, which we support but ESLint core doesn't.
    */
    const normalizeTest = <
      T extends
        | ValidTestCase<TOptions>
        | InvalidTestCase<TMessageIds, TOptions>,
    >({
      dependencyConstraints: _,
      ...test
    }: T): Omit<T, 'dependencyConstraints'> => {
      if (test.parser === TS_ESLINT_PARSER) {
        throw new Error(ERROR_MESSAGE);
      }
      if (!test.filename) {
        return {
          ...test,
          filename: this.getFilename(test.parserOptions),
        };
      }
      return test;
    };
    tests.valid = tests.valid.map(normalizeTest);
    tests.invalid = tests.invalid.map(normalizeTest);

    const hasOnly = ((): boolean => {
      for (const test of allTestsIterator) {
        if (test.only) {
          return true;
        }
      }
      return false;
    })();
    // if there is an `only: true` - don't apply constraints - assume that
    // we are in "local development" mode rather than "CI validation" mode
    if (!hasOnly) {
      /*
      Automatically skip tests that don't satisfy the dependency constraints.
      */
      const hasConstraints = ((): boolean => {
        for (const test of allTestsIterator) {
          if (
            test.dependencyConstraints &&
            Object.keys(test.dependencyConstraints).length > 0
          ) {
            return true;
          }
        }
        return false;
      })();
      if (hasConstraints) {
        // The `only: boolean` test property was only added in ESLint v7.29.0.
        if (semver.satisfies(eslintVersion, '>=7.29.0')) {
          /*
          Mark all satisfactory tests as `only: true`, and all other tests as
          `only: false`.
          When multiple tests are marked as "only", test frameworks like jest and mocha
          will run all of those tests and will just skip the other tests.

          We do this instead of just omitting the tests entirely because it gives the
          test framework the opportunity to log the test as skipped rather than the test
          just disappearing.
          */
          const maybeMarkAsOnly = <
            T extends
              | ValidTestCase<TOptions>
              | InvalidTestCase<TMessageIds, TOptions>,
          >(
            test: T,
          ): T => {
            return {
              ...test,
              only: satisfiesAllDependencyConstraints(
                test.dependencyConstraints,
              ),
            };
          };

          tests.valid = tests.valid.map(maybeMarkAsOnly);
          tests.invalid = tests.invalid.map(maybeMarkAsOnly);
        } else {
          // On older versions we just fallback to raw array filtering like SAVAGES
          tests.valid = tests.valid.filter(test =>
            satisfiesAllDependencyConstraints(test.dependencyConstraints),
          );
          tests.invalid = tests.invalid.filter(test =>
            satisfiesAllDependencyConstraints(test.dependencyConstraints),
          );
        }
      }
    }

    super.run(name, rule, tests);
  }
}

/**
 * Simple no-op tag to mark code samples as "should not format with prettier"
 *   for the internal/plugin-test-formatting lint rule
 */
function noFormat(strings: TemplateStringsArray, ...keys: string[]): string {
  const lastIndex = strings.length - 1;
  return (
    strings.slice(0, lastIndex).reduce((p, s, i) => p + s + keys[i], '') +
    strings[lastIndex]
  );
}

export { noFormat, RuleTester };
export type { InvalidTestCase, ValidTestCase, RunTests };
