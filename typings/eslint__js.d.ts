declare module '@eslint/js' {
  import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

  const exprt: {
    configs: {
      all: FlatConfig.Config;
      recommended: FlatConfig.Config;
    };
  };
  export = exprt;
}
