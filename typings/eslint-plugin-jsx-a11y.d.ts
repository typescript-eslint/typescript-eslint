declare module 'eslint-plugin-jsx-a11y' {
  import type { Config, Plugin } from '@eslint/config-helpers';

  declare const exprt: {
    flatConfigs: {
      recommended: Config & {
        plugins: {
          'jsx-a11y': Plugin;
        };
      };
      strict: Config;
    };
    rules: NonNullable<Plugin['rules']>;
  };
  export = exprt;
}
