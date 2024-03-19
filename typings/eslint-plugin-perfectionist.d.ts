declare module 'eslint-plugin-perfectionist' {
  import type {
    ClassicConfig,
    Linter,
  } from '@typescript-eslint/utils/ts-eslint';

  declare const exprt: {
    configs: Record<
      `recommended-${'alphabetical' | 'natural' | 'line-length'}`,
      ClassicConfig
    >;
    rules: NonNullable<Linter.Plugin['rules']>;
  };
  export = exprt;
}
