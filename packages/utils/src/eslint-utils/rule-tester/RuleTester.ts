import type * as TSESLintParserType from '@typescript-eslint/parser';
import { version as eslintVersion } from 'eslint/package.json';
import * as path from 'path';
import * as semver from 'semver';

import * as TSESLint from '../../ts-eslint';
import { deepMerge } from '../deepMerge';
import type { DependencyConstraint } from './dependencyConstraints';
import { satisfiesAllDependencyConstraints } from './dependencyConstraints';

const TS_ESLINT_PARSER = '@typescript-eslint/parser';

type RuleTesterConfig = Omit<TSESLint.RuleTesterConfig, 'parser'> & {
  parser: typeof TS_ESLINT_PARSER;
};

interface InvalidTestCase<
  TMessageIds extends string,
  TOptions extends Readonly<unknown[]>,
> extends TSESLint.InvalidTestCase<TMessageIds, TOptions> {
  dependencyConstraints?: DependencyConstraint;
}
interface ValidTestCase<TOptions extends Readonly<unknown[]>>
  extends TSESLint.ValidTestCase<TOptions> {
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

class RuleTester extends TSESLint.RuleTester {
  readonly #baseOptions: RuleTesterConfig;

  static #afterAll: AfterAll;
  /**
   * If you supply a value to this property, the rule tester will call this instead of using the version defined on
   * the global namespace.
   */
  static get afterAll(): AfterAll {
    return (
      this.#afterAll ||
      (typeof afterAll === 'function' ? afterAll : (): void => {})
    );
  }
  static set afterAll(value) {
    this.#afterAll = value;
  }

  constructor(baseOptions: RuleTesterConfig) {
    super({
      ...baseOptions,
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
    // the cast here is due to https://github.com/microsoft/TypeScript/issues/3841
    (this.constructor as typeof RuleTester).afterAll(() => {
      try {
        // instead of creating a hard dependency, just use a soft require
        // a bit weird, but if they're using this tooling, it'll be installed
        const parser = require(TS_ESLINT_PARSER) as typeof TSESLintParserType;
        parser.clearCaches();
      } catch {
        // ignored on purpose
      }
    });
  }
  private getFilename(testOptions?: TSESLint.ParserOptions): string {
    const resolvedOptions = deepMerge(
      this.#baseOptions.parserOptions,
      testOptions,
    ) as TSESLint.ParserOptions;
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
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    testsReadonly: RunTests<TMessageIds, TOptions>,
  ): void {
    const errorMessage = `Do not set the parser at the test level unless you want to use a parser other than ${TS_ESLINT_PARSER}`;

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

    /*
    Automatically add a filename to the tests to enable type-aware tests to "just work".
    This saves users having to verbosely and manually add the filename to every
    single test case.
    Hugely helps with the string-based valid test cases as it means they don't
    need to be made objects!
    */
    const addFilename = <
      T extends
        | ValidTestCase<TOptions>
        | InvalidTestCase<TMessageIds, TOptions>,
    >(
      test: T,
    ): T => {
      if (test.parser === TS_ESLINT_PARSER) {
        throw new Error(errorMessage);
      }
      if (!test.filename) {
        return {
          ...test,
          filename: this.getFilename(test.parserOptions),
        };
      }
      return test;
    };
    tests.valid = tests.valid.map(addFilename);
    tests.invalid = tests.invalid.map(addFilename);

    const hasOnly = ((): boolean => {
      for (const test of tests.valid) {
        if (test.only) {
          return true;
        }
      }
      for (const test of tests.invalid) {
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
        for (const test of tests.valid) {
          if (
            test.dependencyConstraints &&
            Object.keys(test.dependencyConstraints).length > 0
          ) {
            return true;
          }
        }
        for (const test of tests.invalid) {
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
            if (satisfiesAllDependencyConstraints(test.dependencyConstraints)) {
              return {
                ...test,
                only: true,
              };
            }

            return {
              ...test,
              only: false,
            };
          };

          tests.valid = tests.valid.map(maybeMarkAsOnly);
          tests.invalid = tests.invalid.map(maybeMarkAsOnly);
        } else {
          /*
          The `only: boolean` test property was only added in ESLint v7.29.0.
          on older versions we just fallback to raw filtering like savages
          */
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
