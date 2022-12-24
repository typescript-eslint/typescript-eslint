import type { Program } from 'typescript';

import type { Lib } from './lib';

type DebugLevel = boolean | ('typescript-eslint' | 'eslint' | 'typescript')[];

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
  | 2015
  | 2016
  | 2017
  | 2018
  | 2019
  | 2020
  | 2021
  | 2022;

type SourceType = 'script' | 'module';

enum TypeScriptIssueDetection {
  None = 0,
  Syntactic = 1,
  SyntacticOrSemantic = 2,
}

interface ParserOptions {
  ecmaFeatures?: {
    globalReturn?: boolean;
    jsx?: boolean;
  };
  ecmaVersion?: EcmaVersion | 'latest';

  // scope-manager specific
  jsxPragma?: string | null;
  jsxFragmentName?: string | null;
  lib?: Lib[];

  // use emitDecoratorMetadata without specifying parserOptions.project
  emitDecoratorMetadata?: boolean;

  // typescript-estree specific
  comment?: boolean;
  debugLevel?: DebugLevel;
  errorOnTypeScriptIssues?: TypeScriptIssueDetection;
  errorOnUnknownASTType?: boolean;
  EXPERIMENTAL_useSourceOfProjectReferenceRedirect?: boolean; // purposely undocumented for now
  extraFileExtensions?: string[];
  filePath?: string;
  loc?: boolean;
  program?: Program;
  project?: string | string[];
  projectFolderIgnoreList?: (string | RegExp)[];
  range?: boolean;
  sourceType?: SourceType;
  tokens?: boolean;
  tsconfigRootDir?: string;
  warnOnUnsupportedTypeScriptVersion?: boolean;
  moduleResolver?: string;
  [additionalProperties: string]: unknown;
}

export {
  DebugLevel,
  EcmaVersion,
  ParserOptions,
  SourceType,
  TypeScriptIssueDetection,
};
