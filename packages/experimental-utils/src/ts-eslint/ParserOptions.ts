import { TSESTreeOptions } from '@typescript-eslint/typescript-estree';

interface ParserOptions {
  comment?: boolean;
  ecmaFeatures?: {
    globalReturn?: boolean;
    jsx?: boolean;
  };
  ecmaVersion?: 3 | 5 | 6 | 7 | 8 | 9 | 10 | 2015 | 2016 | 2017 | 2018 | 2019;
  errorOnTypeScriptSyntacticAndSemanticIssues?: boolean;
  errorOnUnknownASTType?: boolean;
  extraFileExtensions?: string[];
  // ts-estree specific
  debugLevel?: TSESTreeOptions['debugLevel'];
  filePath?: string;
  loc?: boolean;
  noWatch?: boolean;
  project?: string | string[];
  projectFolderIgnoreList?: (string | RegExp)[];
  range?: boolean;
  sourceType?: 'script' | 'module';
  tokens?: boolean;
  tsconfigRootDir?: string;
  useJSXTextNode?: boolean;
  warnOnUnsupportedTypeScriptVersion?: boolean;
}

export { ParserOptions };
