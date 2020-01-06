import { Program } from 'typescript';
import { TSESTree, TSNode, TSESTreeToTSNode } from './ts-estree';

export interface Extra {
  code: string;
  comment: boolean;
  comments: TSESTree.Comment[];
  createDefaultProgram: boolean;
  errorOnTypeScriptSyntacticAndSemanticIssues: boolean;
  errorOnUnknownASTType: boolean;
  extraFileExtensions: string[];
  filePath: string;
  jsx: boolean;
  loc: boolean;
  log: Function;
  preserveNodeMaps?: boolean;
  projects: string[];
  range: boolean;
  strict: boolean;
  tokens: null | TSESTree.Token[];
  tsconfigRootDir: string;
  useJSXTextNode: boolean;
}

export interface TSESTreeOptions {
  comment?: boolean;
  createDefaultProgram?: boolean;
  errorOnTypeScriptSyntacticAndSemanticIssues?: boolean;
  errorOnUnknownASTType?: boolean;
  extraFileExtensions?: string[];
  filePath?: string;
  jsx?: boolean;
  loc?: boolean;
  loggerFn?: Function | false;
  preserveNodeMaps?: boolean;
  project?: string | string[];
  range?: boolean;
  tokens?: boolean;
  tsconfigRootDir?: string;
  useJSXTextNode?: boolean;
}

// This lets us use generics to type the return value, and removes the need to
// handle the undefined type in the get method
export interface ParserWeakMap<TKey, TValueBase> {
  get<TValue extends TValueBase>(key: TKey): TValue;
  has(key: unknown): boolean;
}

export interface ParserWeakMapEstree<
  TKey extends TSESTree.Node = TSESTree.Node
> {
  get<TKeyBase extends TKey>(key: TKeyBase): TSESTreeToTSNode<TKeyBase>;
  has(key: unknown): boolean;
}

export interface ParserServices {
  program: Program | undefined;
  esTreeNodeToTSNodeMap: ParserWeakMapEstree | undefined;
  tsNodeToESTreeNodeMap: ParserWeakMap<TSNode, TSESTree.Node> | undefined;
}
