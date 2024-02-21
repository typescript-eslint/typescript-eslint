declare module 'eslint-plugin-eslint-plugin' {
  import type {
    ClassicConfig,
    Linter,
  } from '@typescript-eslint/utils/ts-eslint';

  declare const exprt: {
    configs: {
      all: ClassicConfig.Config;
      recommended: ClassicConfig.Config;
      rules: ClassicConfig.Config;
      tests: ClassicConfig.Config;
      'rules-recommended': ClassicConfig.Config;
      'tests-recommended': ClassicConfig.Config;
    };
    rules: NonNullable<Linter.Plugin['rules']>;
  };
  export = exprt;
}
