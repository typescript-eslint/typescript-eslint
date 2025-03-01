// TODO: Move this to DefinitelyTyped
declare module 'eslint-plugin-import' {
  import type {
    ClassicConfig,
    Linter,
  } from '@typescript-eslint/utils/ts-eslint';

  declare const exprt: {
    configs: {
      electron: ClassicConfig.Config;
      errors: ClassicConfig.Config;
      react: ClassicConfig.Config;
      'react-native': ClassicConfig.Config;
      recommended: ClassicConfig.Config;
      'stage-0': ClassicConfig.Config;
      typescript: ClassicConfig.Config;
      warnings: ClassicConfig.Config;
    };
    rules: NonNullable<Linter.Plugin['rules']>;
  };
  export = exprt;
}
