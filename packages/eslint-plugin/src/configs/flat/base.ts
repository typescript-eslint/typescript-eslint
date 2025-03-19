import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

/**
 * A minimal ruleset that sets only the required parser and plugin options needed to run typescript-eslint.
 * We don't recommend using this directly; instead, extend from an earlier recommended rule.
 * @see {@link https://typescript-eslint.io/users/configs#base}
 */
export default (
  plugin: FlatConfig.Plugin,
  parser: FlatConfig.Parser,
): FlatConfig.Config => ({
  languageOptions: {
    parser,
    sourceType: 'module',
  },
  name: 'typescript-eslint/base',
  plugins: {
    '@typescript-eslint': plugin,
  },
});
