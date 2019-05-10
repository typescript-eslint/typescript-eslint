import { TSESLint, ESLintUtils } from '@typescript-eslint/experimental-utils';
import { RuleTester as ESLintRuleTester } from 'eslint';
import * as path from 'path';

const RuleTester: TSESLint.RuleTester = ESLintRuleTester as any;

function getFixturesRootDir() {
  return path.join(process.cwd(), 'tests/fixtures/');
}

const { batchedSingleLineTests } = ESLintUtils;

export { RuleTester, getFixturesRootDir, batchedSingleLineTests };
