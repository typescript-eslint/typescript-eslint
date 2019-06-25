import { TSESLint, ESLintUtils } from '@typescript-eslint/experimental-utils';
import * as path from 'path';

const parser = '@typescript-eslint/parser';

// re-export the RuleTester from here to make it easier to do the tests
// as of eslint 6 you have to provide an absolute path to the parser
// but that's not as clean to type as this is
type RuleTesterConfig = Omit<TSESLint.RuleTesterConfig, 'parser'> & {
  parser: typeof parser;
}
class RuleTester extends TSESLint.RuleTester {
  constructor(options: RuleTesterConfig) {
    super({
      ...options,
      parser: require.resolve(options.parser),
    })
  }

  run<TMessageIds extends string, TOptions extends Readonly<any[]>>(
    name: string,
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    tests: TSESLint.RunTests<TMessageIds, TOptions>,
  ): void {
    const errorMessage = `Do not set the parser at the test level unless you want to use a parser other than ${parser}`;
    tests.valid.forEach(test => {
      if (typeof test !== 'string') {
        if (test.parser === parser) {
          throw new Error(errorMessage);
        }
      }
    })
    tests.invalid.forEach(test => {
      if (test.parser === parser) {
        throw new Error(errorMessage);
      }
    })

    super.run(name, rule, tests);
  }
}

function getFixturesRootDir() {
  return path.join(process.cwd(), 'tests/fixtures/');
}

const { batchedSingleLineTests } = ESLintUtils;

export { RuleTester, getFixturesRootDir, batchedSingleLineTests };
