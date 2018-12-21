/**
 * NOTE: The following types are inferred from usage within the original JavaScript source.
 *
 * They will be gradually replaced with the more accurate types derived from the ESTree spec, and its
 * applicable extensions
 */
export interface ESTreeToken {
  type: string;
  value: string;
  range: [number, number];
  loc: ESTreeNodeLoc;
  regex?: {
    pattern: string;
    flags: string;
  };
  object?: any;
  property?: any;
  name?: any;
}

export interface ESTreeNode {
  type: string;
  loc: ESTreeNodeLoc;
  range: number[];
  declaration?: ESTreeNode;
  specifiers?: any[];
  source?: any;
  typeAnnotation?: ESTreeNode | null;
  typeParameters?: ESTreeNode | null;
  id?: ESTreeNode | null;
  expression?: ESTreeNode | null;
  decorators?: any;
  const?: boolean;
  declare?: boolean;
  global?: boolean;
  modifiers?: any;
  body?: any;
  params?: any;
  accessibility?: any;
  readonly?: boolean;
  static?: boolean;
  export?: boolean;
  parameter?: any;
  abstract?: boolean;
}

export interface ESTreeComment extends ESTreeNode {}

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
}

export interface ParserOptions {
  range?: boolean;
  loc?: boolean;
  tokens?: boolean;
  comment?: boolean;
  jsx?: boolean;
  errorOnUnknownASTType?: boolean;
  useJSXTextNode?: boolean;
  loggerFn?: Function | false;
  project?: string | string[];
  filePath?: string;
  tsconfigRootDir?: string;
}
