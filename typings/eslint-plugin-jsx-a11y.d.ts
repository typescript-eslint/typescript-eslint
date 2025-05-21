declare module 'eslint-plugin-jsx-a11y' {
  import type { FlatConfig, Linter } from '@typescript-eslint/utils/ts-eslint';

  declare const exprt: {
    flatConfigs: {
      recommended: FlatConfig.Config;
      strict: FlatConfig.Config;
    };
    rules: NonNullable<Linter.Plugin['rules']>;
  };
  export = exprt;
}
