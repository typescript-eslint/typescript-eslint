import type { ClassicConfig } from '@typescript-eslint/utils/ts-eslint';

export = {
  parser: '@typescript-eslint/parser',
  parserOptions: { sourceType: 'module' },
  plugins: ['@typescript-eslint'],
} satisfies ClassicConfig.Config;
