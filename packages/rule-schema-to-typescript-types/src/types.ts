export type RefMap = ReadonlyMap<
  // ref path
  string,
  // type name
  string
>;

export type AST =
  | ArrayAST
  | LiteralAST
  | ObjectAST
  | TupleAST
  | TypeReferenceAST
  | UnionAST;

interface BaseASTNode {
  readonly commentLines: string[];
}

export interface ArrayAST extends BaseASTNode {
  readonly elementType: AST;
  readonly type: 'array';
}
export interface LiteralAST extends BaseASTNode {
  readonly code: string;
  readonly type: 'literal';
}
export interface ObjectAST extends BaseASTNode {
  readonly indexSignature: AST | null;
  readonly properties: {
    readonly name: string;
    readonly optional: boolean;
    readonly type: AST;
  }[];
  readonly type: 'object';
}
export interface TupleAST extends BaseASTNode {
  readonly elements: AST[];
  readonly spreadType: AST | null;
  readonly type: 'tuple';
}
export interface TypeReferenceAST extends BaseASTNode {
  readonly type: 'type-reference';
  readonly typeName: string;
}
export interface UnionAST extends BaseASTNode {
  readonly elements: AST[];
  readonly type: 'union';
}
