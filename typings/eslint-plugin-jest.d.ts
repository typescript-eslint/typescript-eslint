declare module 'eslint-plugin-jest' {
  import type {
    ClassicConfig,
    Linter,
  } from '@typescript-eslint/utils/ts-eslint';

  declare const exprt: {
    configs: {
      all: ClassicConfig.Config;
      recommended: ClassicConfig.Config;
      style: ClassicConfig.Config;
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
