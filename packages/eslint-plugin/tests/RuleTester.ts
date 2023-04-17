import { ESLintUtils } from '@typescript-eslint/utils';
import * as path from 'path';

function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}

const { batchedSingleLineTests } = ESLintUtils;
export {
  RuleTester,
  RunTests,
  ValidTestCase,
  InvalidTestCase,
  noFormat,
} from '@typescript-eslint/utils/eslint-utils/rule-tester';

export { batchedSingleLineTests, getFixturesRootDir };
