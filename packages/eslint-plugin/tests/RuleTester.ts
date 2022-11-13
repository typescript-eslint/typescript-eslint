import { ESLintUtils } from '@typescript-eslint/utils';
import * as path from 'path';

function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}

const { batchedSingleLineTests, RuleTester, noFormat } = ESLintUtils;
export {
  RunTests,
  ValidTestCase,
  InvalidTestCase,
} from '@typescript-eslint/utils/dist/eslint-utils/rule-tester/RuleTester';

export { batchedSingleLineTests, getFixturesRootDir, noFormat, RuleTester };
