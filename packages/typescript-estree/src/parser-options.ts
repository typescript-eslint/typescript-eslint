import { Program } from 'typescript';
import { TSESTree, TSNode } from './ts-estree';

type DebugModule = 'typescript-eslint' | 'eslint' | 'typescript';
/**
 * For convenience:
 * - true === ['typescript-eslint']
 * - false === []
 *
 * An array of modules to turn explicit debugging on for.
 * - 'typescript-eslint' is the same as setting the env var `DEBUG=typescript-eslint:*`
 * - 'eslint' is the same as setting the env var `DEBUG=eslint:*`
 * - 'typescript' is the same as setting `extendedDiagnostics: true` in your tsconfig compilerOptions
 */
export type DebugLevel = boolean | DebugModule[];

export interface Extra {
  code: string;
  comment: boolean;
  comments: TSESTree.Comment[];
  createDefaultProgram: boolean;
  debugLevel: Set<DebugModule>;
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
  debugLevel?: DebugLevel;
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

export interface ParserServices {
  program: Program | undefined;
  esTreeNodeToTSNodeMap: ParserWeakMap<TSESTree.Node, TSNode> | undefined;
  tsNodeToESTreeNodeMap: ParserWeakMap<TSNode, TSESTree.Node> | undefined;
}
