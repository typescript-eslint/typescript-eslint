export interface ParserOptions {
  loc?: boolean;
  comment?: boolean;
  range?: boolean;
  tokens?: boolean;
  sourceType?: 'script' | 'module';
  ecmaVersion?: 3 | 5 | 6 | 7 | 8 | 9 | 10 | 2015 | 2016 | 2017 | 2018 | 2019;
  ecmaFeatures?: {
    globalReturn?: boolean;
    jsx?: boolean;
  };
  // ts-estree specific
  filePath?: string;
  project?: string | string[];
  useJSXTextNode?: boolean;
  errorOnUnknownASTType?: boolean;
  errorOnTypeScriptSyntacticAndSemanticIssues?: boolean;
  tsconfigRootDir?: string;
  extraFileExtensions?: string[];
  warnOnUnsupportedTypeScriptVersion?: boolean;
}
