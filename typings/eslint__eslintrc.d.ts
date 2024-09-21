declare module '@eslint/eslintrc' {
  import type {
    ClassicConfig,
    FlatConfig,
  } from '@typescript-eslint/utils/ts-eslint';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  declare class FlatCompat {
    constructor(options?: {
      baseDirectory?: string;
      resolvePluginsRelativeTo?: string;
    });

    config(eslintrcConfig: ClassicConfig.Config): FlatConfig.ConfigArray;
    env(envConfig: ClassicConfig.EnvironmentConfig): FlatConfig.ConfigArray;
    extends(...configsToExtend: string[]): FlatConfig.ConfigArray;
    plugins(...plugins: string[]): FlatConfig.ConfigArray;
  }
  declare const exprt: {
    FlatCompat: typeof FlatCompat;
  };
  export = exprt;
}
