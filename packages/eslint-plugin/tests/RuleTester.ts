import { TSESLint, ESLintUtils } from '@typescript-eslint/experimental-utils';
import { clearCaches } from '@typescript-eslint/parser';
import * as path from 'path';

const parser = '@typescript-eslint/parser';

type RuleTesterConfig = Omit<TSESLint.RuleTesterConfig, 'parser'> & {
  parser: typeof parser;
};
class RuleTester extends TSESLint.RuleTester {
  // as of eslint 6 you have to provide an absolute path to the parser
  // but that's not as clean to type, this saves us trying to manually enforce
  // that contributors require.resolve everything
  constructor(private readonly options: RuleTesterConfig) {
    super({
      ...options,
      parser: require.resolve(options.parser),
    });
  }
  private getFilename(options?: TSESLint.ParserOptions): string {
    if (options) {
      const filename = `file.ts${
        options.ecmaFeatures && options.ecmaFeatures.jsx ? 'x' : ''
      }`;
      if (options.project) {
        return path.join(getFixturesRootDir(), filename);
      }

      return filename;
    } else if (this.options.parserOptions) {
      return this.getFilename(this.options.parserOptions);
    }

    return 'file.ts';
  }

  // as of eslint 6 you have to provide an absolute path to the parser
  // If you don't do that at the test level, the test will fail somewhat cryptically...
  // This is a lot more explicit
  run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    name: string,
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    tests: TSESLint.RunTests<TMessageIds, TOptions>,
  ): void {
    const errorMessage = `Do not set the parser at the test level unless you want to use a parser other than ${parser}`;

    tests.valid = tests.valid.map(test => {
      if (typeof test === 'string') {
        return {
          code: test,
        };
      }
      return test;
    });

    tests.valid.forEach(test => {
      if (typeof test !== 'string') {
        if (test.parser === parser) {
          throw new Error(errorMessage);
        }
        if (!test.filename) {
          test.filename = this.getFilename(test.parserOptions);
        }
      }
    });
    tests.invalid.forEach(test => {
      if (test.parser === parser) {
        throw new Error(errorMessage);
      }
      if (!test.filename) {
        test.filename = this.getFilename(test.parserOptions);
      }
    });

    super.run(name, rule, tests);
  }
}

function getFixturesRootDir(): string {
  return path.join(process.cwd(), 'tests/fixtures/');
}

const { batchedSingleLineTests } = ESLintUtils;

// make sure that the parser doesn't hold onto file handles between tests
// on linux (i.e. our CI env), there can be very a limited number of watch handles available
afterAll(() => {
  clearCaches();
});

export { RuleTester, getFixturesRootDir, batchedSingleLineTests };
