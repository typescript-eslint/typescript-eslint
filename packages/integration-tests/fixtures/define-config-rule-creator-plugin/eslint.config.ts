import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import { configs, plugin, recommended } from './plugin.js';

export default defineConfig(
  tseslint.configs.recommended,
  recommended,
  configs['recommended-array'],
  {
    extends: [configs.recommended],
    files: ['**/*.ts'],
    plugins: {
      example: plugin,
    },
    rules: {
      'example/no-foo': ['error', { allowBar: true }],
    },
  },
  {
    files: ['eslint.config.ts', 'plugin.ts'],
    rules: {
      'example/no-foo': 'off',
    },
  },
);
