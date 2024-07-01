declare module '@eslint/compat' {
  import type { FlatConfig, Linter } from '@typescript-eslint/utils/ts-eslint';

  declare const exprt: {
    fixupConfigRules: (
      config: FlatConfig.ConfigArray,
    ) => FlatConfig.ConfigArray;
    fixupPluginRules: (plugin: Linter.Plugin) => Linter.Plugin;
  };

  export = exprt;
}
