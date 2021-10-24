import { Lib } from './lib';
import type { Program } from 'typescript';

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

  // typescript-estree specific
  comment?: boolean;
  debugLevel?: DebugLevel;
  errorOnTypeScriptSyntacticAndSemanticIssues?: boolean;
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
  useJSXTextNode?: boolean;
  warnOnUnsupportedTypeScriptVersion?: boolean;
  moduleResolver?: string;
}

export { DebugLevel, EcmaVersion, ParserOptions, SourceType };
