declare module 'eslint-plugin-jsdoc' {
  import type {
    ClassicConfig,
    FlatConfig,
    Linter,
  } from '@typescript-eslint/utils/ts-eslint';

  declare const exprt: {
    configs: {
      'flat/recommended': FlatConfig.Config;
      'flat/recommended-error': FlatConfig.Config;
      'flat/recommended-typescript': FlatConfig.Config;
      'flat/recommended-typescript-error': FlatConfig.Config;
      'flat/recommended-typescript-flavor': FlatConfig.Config;
      'flat/recommended-typescript-flavor-error': FlatConfig.Config;
    };
    environments: {
      globals: {
        globals: ClassicConfig.EnvironmentConfig;
      };
    };
    rules: NonNullable<Linter.Plugin['rules']>;
  };
  export = exprt;
}
