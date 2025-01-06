// TODO: Move this to DefinitelyTyped
declare module 'eslint-plugin-eslint-plugin' {
  import type { FlatConfig, Linter } from '@typescript-eslint/utils/ts-eslint';

  declare const exprt: {
    configs: {
      'flat/all': FlatConfig.Config;
      'flat/recommended': FlatConfig.Config;
      'flat/rules': FlatConfig.Config;
      'flat/rules-recommended': FlatConfig.Config;
      'flat/tests': FlatConfig.Config;
      'flat/tests-recommended': FlatConfig.Config;
    };
    rules: NonNullable<Linter.Plugin['rules']>;
  };
  export = exprt;
}
