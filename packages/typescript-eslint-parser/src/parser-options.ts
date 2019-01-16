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
  /**
   * @deprecated We should finalize the work from
   * https://github.com/eslint/typescript-eslint-parser#595
   */
  jsx?: boolean;
}
