import * as path from 'path';
import * as TSESLint from '../ts-eslint';

const parser = '@typescript-eslint/parser';

type RuleTesterConfig = Omit<TSESLint.RuleTesterConfig, 'parser'> & {
  parser: typeof parser;
};

class RuleTester extends TSESLint.RuleTester {
  readonly #options: RuleTesterConfig;

  // as of eslint 6 you have to provide an absolute path to the parser
  // but that's not as clean to type, this saves us trying to manually enforce
  // that contributors require.resolve everything
  constructor(options: RuleTesterConfig) {
    super({
      ...options,
      parserOptions: {
        ...options.parserOptions,
        warnOnUnsupportedTypeScriptVersion:
          options.parserOptions?.warnOnUnsupportedTypeScriptVersion ?? false,
      },
      parser: require.resolve(options.parser),
    });

    this.#options = options;

    // make sure that the parser doesn't hold onto file handles between tests
    // on linux (i.e. our CI env), there can be very a limited number of watch handles available
    afterAll(() => {
      try {
        // instead of creating a hard dependency, just use a soft require
        // a bit weird, but if they're using this tooling, it'll be installed
        require(parser).clearCaches();
      } catch {
        // ignored
      }
    });
  }
  private getFilename(options?: TSESLint.ParserOptions): string {
    if (options) {
      const filename = `file.ts${options.ecmaFeatures?.jsx ? 'x' : ''}`;
      if (options.project) {
        return path.join(
          options.tsconfigRootDir != null
            ? options.tsconfigRootDir
            : process.cwd(),
          filename,
        );
      }

      return filename;
    } else if (this.#options.parserOptions) {
      return this.getFilename(this.#options.parserOptions);
    }

    return 'file.ts';
  }

  // as of eslint 6 you have to provide an absolute path to the parser
  // If you don't do that at the test level, the test will fail somewhat cryptically...
  // This is a lot more explicit
  run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    name: string,
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    testsReadonly: TSESLint.RunTests<TMessageIds, TOptions>,
  ): void {
    const errorMessage = `Do not set the parser at the test level unless you want to use a parser other than ${parser}`;

    const tests = { ...testsReadonly };

    // standardize the valid tests as objects
    tests.valid = tests.valid.map(test => {
      if (typeof test === 'string') {
        return {
          code: test,
        };
      }
      return test;
    });

    tests.valid = tests.valid.map(test => {
      if (typeof test !== 'string') {
        if (test.parser === parser) {
          throw new Error(errorMessage);
        }
        if (!test.filename) {
          return {
            ...test,
            filename: this.getFilename(test.parserOptions),
          };
        }
      }
      return test;
    });
    tests.invalid = tests.invalid.map(test => {
      if (test.parser === parser) {
        throw new Error(errorMessage);
      }
      if (!test.filename) {
        return {
          ...test,
          filename: this.getFilename(test.parserOptions),
        };
      }
      return test;
    });

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
