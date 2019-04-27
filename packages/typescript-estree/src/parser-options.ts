import { Program } from 'typescript';
import { TSESTree, TSNode } from './ts-estree';

export interface Extra {
  errorOnUnknownASTType: boolean;
  errorOnTypeScriptSyntacticAndSemanticIssues: boolean;
  useJSXTextNode: boolean;
  tokens: null | TSESTree.Token[];
  comment: boolean;
  code: string;
  range: boolean;
  loc: boolean;
  comments: TSESTree.Comment[];
  strict: boolean;
  jsx: boolean;
  log: Function;
  projects: string[];
  tsconfigRootDir: string;
  extraFileExtensions: string[];
}

export interface TSEStreeOptions {
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

// This lets us use generics to type the return value, and removes the need to
// handle the undefined type in the get method
export interface ParserWeakMap<TKey, TValueBase> {
  get<TValue extends TValueBase>(key: TKey): TValue;
  has(key: any): boolean;
}

export interface ParserServices {
  program: Program | undefined;
  esTreeNodeToTSNodeMap: ParserWeakMap<TSESTree.Node, TSNode> | undefined;
  tsNodeToESTreeNodeMap: ParserWeakMap<TSNode, TSESTree.Node> | undefined;
}
