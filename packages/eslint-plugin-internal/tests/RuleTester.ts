import path from 'path';

function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}

export { RuleTester } from '@typescript-eslint/rule-tester';
export { getFixturesRootDir };
