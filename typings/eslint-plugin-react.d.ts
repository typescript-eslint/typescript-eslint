declare module 'eslint-plugin-react' {
  import type { FlatConfig, Linter } from '@typescript-eslint/utils/ts-eslint';

  declare const exprt: {
    configs: {
      flat: {
        all: FlatConfig.Config;
        'jsx-runtime': FlatConfig.Config;
        recommended: FlatConfig.Config;
      };
    };
    rules: NonNullable<Linter.Plugin['rules']>;
  };
  export = exprt;
}
