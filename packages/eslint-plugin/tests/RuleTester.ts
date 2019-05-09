import { TSESLint } from '@typescript-eslint/experimental-utils';
import { RuleTester as ESLintRuleTester } from 'eslint';
import * as path from 'path';

const RuleTester: TSESLint.RuleTester = ESLintRuleTester as any;

function getFixturesRootDir() {
  return path.join(process.cwd(), 'tests/fixtures/');
}

export { RuleTester, getFixturesRootDir };
