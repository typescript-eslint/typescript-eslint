import { TSESLint, ESLintUtils } from '@typescript-eslint/experimental-utils';
import * as path from 'path';

// re-export the RuleTester from here to make it easier to do the tests
const RuleTester = TSESLint.RuleTester;

function getFixturesRootDir() {
  return path.join(process.cwd(), 'tests/fixtures/');
}

const { batchedSingleLineTests } = ESLintUtils;

export { RuleTester, getFixturesRootDir, batchedSingleLineTests };
