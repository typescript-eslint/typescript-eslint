import {
  eslintIntegrationTest,
  typescriptIntegrationTest,
} from '../tools/integration-test-base';

typescriptIntegrationTest(
  'typescript',
  __filename,
  ['-p', 'tsconfig.json'],
  out => {
    // The types should not error
    expect(out).toBe('');
  },
);

eslintIntegrationTest(__filename, 'index.ts');
