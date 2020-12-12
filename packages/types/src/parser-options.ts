import { Lib } from './lib';

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
  | 2015
  | 2016
  | 2017
  | 2018
  | 2019
  | 2020;

type SourceType = 'script' | 'module';

interface ParserOptions {
  ecmaFeatures?: {
    globalReturn?: boolean;
    jsx?: boolean;
  };
  ecmaVersion?: EcmaVersion;

  // scope-manager specific
  jsxPragma?: string;
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
  project?: string | string[];
  projectFolderIgnoreList?: (string | RegExp)[];
  range?: boolean;
  sourceType?: SourceType;
  tokens?: boolean;
  tsconfigRootDir?: string;
  useJSXTextNode?: boolean;
  warnOnUnsupportedTypeScriptVersion?: boolean;
}

export { DebugLevel, EcmaVersion, ParserOptions, SourceType };
