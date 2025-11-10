import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Replace with import.meta.dirname when minimum node version supports it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getFixturesRootDir(): string {
  return path.join(__dirname, 'fixtures');
}

export { RuleTester } from '@typescript-eslint/rule-tester';
