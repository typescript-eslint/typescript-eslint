import type { Program } from 'typescript';

import type { Lib } from './lib';

type DebugLevel = ('eslint' | 'typescript-eslint' | 'typescript')[] | boolean;
type CacheDurationSeconds = number | 'Infinity';

type EcmaVersion =
  | 3
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 2015
  | 2016
  | 2017
  | 2018
  | 2019
  | 2020
  | 2021
  | 2022
  | 2023
  | 2024
  | 'latest'
  | undefined;

type SourceTypeClassic = 'module' | 'script';
type SourceType = SourceTypeClassic | 'commonjs';

type JSDocParsingMode = 'all' | 'none' | 'type-info';

// If you add publicly visible options here, make sure they're also documented in `docs/packages/Parser.mdx`
interface ParserOptions {
  ecmaFeatures?:
    | {
        globalReturn?: boolean | undefined;
        jsx?: boolean | undefined;
        [key: string]: unknown;
      }
    | undefined;
  ecmaVersion?: EcmaVersion;

  // scope-manager specific
  jsxPragma?: string | null;
  jsxFragmentName?: string | null;
  lib?: Lib[];

  // use emitDecoratorMetadata without specifying parserOptions.project
  emitDecoratorMetadata?: boolean;
  // use experimentalDecorators without specifying parserOptions.project
  experimentalDecorators?: boolean;

  // typescript-estree specific
  comment?: boolean;
  debugLevel?: DebugLevel;
  errorOnTypeScriptSyntacticAndSemanticIssues?: boolean;
  errorOnUnknownASTType?: boolean;
  EXPERIMENTAL_useProjectService?: boolean; // purposely undocumented for now
  EXPERIMENTAL_useSourceOfProjectReferenceRedirect?: boolean; // purposely undocumented for now
  extraFileExtensions?: string[];
  filePath?: string;
  jsDocParsingMode?: JSDocParsingMode;
  loc?: boolean;
  programs?: Program[] | null;
  project?: string[] | string | boolean | null;
  projectFolderIgnoreList?: (RegExp | string)[];
  range?: boolean;
  sourceType?: SourceType | undefined;
  tokens?: boolean;
  tsconfigRootDir?: string;
  warnOnUnsupportedTypeScriptVersion?: boolean;
  cacheLifetime?: {
    glob?: CacheDurationSeconds;
  };

  [additionalProperties: string]: unknown;
}

export type {
  CacheDurationSeconds,
  DebugLevel,
  EcmaVersion,
  JSDocParsingMode,
  ParserOptions,
  SourceType,
};
