declare module 'eslint-plugin-react' {
  import type {
    ClassicConfig,
    Linter,
  } from '@typescript-eslint/utils/ts-eslint';

  declare const exprt: {
    configs: {
      all: ClassicConfig.Config;
      'jsx-runtime': ClassicConfig.Config;
      recommended: ClassicConfig.Config;
    };
    rules: NonNullable<Linter.Plugin['rules']>;
  };
  export = exprt;
}
