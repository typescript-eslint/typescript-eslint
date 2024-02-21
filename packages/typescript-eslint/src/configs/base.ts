import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

export default (
  plugin: FlatConfig.Plugin,
  parser: FlatConfig.Parser,
): FlatConfig.Config => ({
  languageOptions: {
    parser,
    parserOptions: { sourceType: 'module' },
  },
  plugins: {
    '@typescript-eslint': plugin,
  },
});
