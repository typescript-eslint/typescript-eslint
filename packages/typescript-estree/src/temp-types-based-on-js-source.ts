/**
 * NOTE: The following types are inferred from usage within the original JavaScript source.
 *
 * They will be gradually replaced with the more accurate types derived from the ESTree spec, and its
 * applicable extensions
 */
import { AST_NODE_TYPES } from './ast-node-types';

export interface ESTreeToken {
  type: AST_NODE_TYPES;
  range: [number, number];
  loc: ESTreeNodeLoc;
  value: string;
  regex?: {
    pattern: string;
    flags: string;
  };
  object?: any;
  property?: any;
  name?: any;
}

export interface ESTreeNode {
  type: AST_NODE_TYPES;
  range: [number, number];
  loc: ESTreeNodeLoc;
  declaration?: ESTreeNode;
  specifiers?: (ESTreeNode | null)[];
  source?: any;
  typeAnnotation?: ESTreeNode | null;
  typeParameters?: ESTreeNode | null;
  id?: ESTreeNode | null;
  raw?: string;
  value?: string;
  expression?: ESTreeNode | null;
  decorators?: (ESTreeNode | null)[];
  const?: boolean;
  declare?: boolean;
  global?: boolean;
  modifiers?: any;
  body?: any;
  params?: any;
  accessibility?: 'public' | 'protected' | 'private';
  readonly?: boolean;
  static?: boolean;
  export?: boolean;
  parameter?: any;
  abstract?: boolean;
  typeName?: ESTreeNode | null;
  directive?: string;
  returnType?: ESTreeNode;
}

export interface ESTreeComment {
  type: 'Block' | 'Line';
  range?: [number, number];
  loc?: ESTreeNodeLoc;
  value: string;
}

export interface LineAndColumnData {
  line: number;
  column: number;
}

export interface ESTreeNodeLoc {
  start: LineAndColumnData;
  end: LineAndColumnData;
}

export interface Extra {
  errorOnUnknownASTType: boolean;
  errorOnTypeScriptSyntacticAndSemanticIssues: boolean;
  useJSXTextNode: boolean;
  tokens: null | ESTreeToken[];
  comment: boolean;
  code: string;
  range: boolean;
  loc: boolean;
  comments: ESTreeComment[];
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
