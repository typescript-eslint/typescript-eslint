import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  tseslint.configs.base,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-useless-default-assignment': 'error',
      '@typescript-eslint/unbound-method': 'error',
    },
  },
]);
