import { TSESLint, ESLintUtils } from '@typescript-eslint/experimental-utils';

const { batchedSingleLineTests } = ESLintUtils;

const parser = '@typescript-eslint/parser';

type RuleTesterConfig = Omit<TSESLint.RuleTesterConfig, 'parser'> & {
  parser: typeof parser;
};
class RuleTester extends TSESLint.RuleTester {
  // as of eslint 6 you have to provide an absolute path to the parser
  // but that's not as clean to type, this saves us trying to manually enforce
  // that contributors require.resolve everything
  constructor(options: RuleTesterConfig) {
    super({
      ...options,
      parser: require.resolve(options.parser),
    });
  }
}

export { RuleTester, batchedSingleLineTests };
