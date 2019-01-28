import { Token, Comment, Program } from "./ast-tree-nodes";

export interface Extra {
  errorOnUnknownASTType: boolean;
  errorOnTypeScriptSyntacticAndSemanticIssues: boolean;
  useJSXTextNode: boolean;
  tokens: null | Token[];
  comment: boolean;
  code: string;
  range: boolean;
  loc: boolean;
  comments: Comment[];
  strict: boolean;
  jsx: boolean;
  log: Function;
  projects: string[];
  tsconfigRootDir: string;
  extraFileExtensions: string[];
}

export interface ParserOptions {
  range?: boolean;
  loc?: boolean;
  tokens?: boolean;
  comment?: boolean;
  jsx?: boolean;
  errorOnUnknownASTType?: boolean;
  errorOnTypeScriptSyntacticAndSemanticIssues?: boolean;
  useJSXTextNode?: boolean;
  loggerFn?: Function | false;
  project?: string | string[];
  filePath?: string;
  tsconfigRootDir?: string;
  extraFileExtensions?: string[];
}
