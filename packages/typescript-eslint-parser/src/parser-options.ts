export interface ParserOptions {
  useJSXTextNode?: boolean;
  loc?: true;
  range?: true;
  tokens?: true;
  filePath?: string;
  sourceType?: 'script' | 'module';
  ecmaVersion?: number;
  ecmaFeatures?: {
    globalReturn?: boolean;
  };
}
