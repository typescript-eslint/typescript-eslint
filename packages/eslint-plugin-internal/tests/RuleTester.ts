import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import path from 'path';

function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}

const { batchedSingleLineTests, RuleTester } = ESLintUtils;

export { RuleTester, batchedSingleLineTests, getFixturesRootDir };
