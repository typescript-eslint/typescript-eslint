import path from 'node:path';

export function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}

export { RuleTester } from '@typescript-eslint/rule-tester';
