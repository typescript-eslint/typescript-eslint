declare module '@babel/eslint-parser' {
  import type { TransformOptions } from '@babel/core';

  export type { ParserPlugin } from '@babel/parser';

  export interface Options {
    readonly allowImportExportEverywhere?: boolean;
    readonly babelOptions?: TransformOptions;
    readonly ecmaFeatures?: {
      readonly globalReturn?: boolean;
    };
    readonly requireConfigFile?: boolean;
    readonly sourceType?: string;
  }

  export interface BabelAST {
    readonly tokens: unknown;
    readonly comments: unknown;
    readonly [k: string]: unknown;
  }

  export function parse(code: string, options: Options): BabelAST;
}
