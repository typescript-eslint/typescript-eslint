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
  readonly type: 'array';
  readonly elementType: AST;
}
export interface LiteralAST extends BaseASTNode {
  readonly type: 'literal';
  readonly code: string;
}
export interface ObjectAST extends BaseASTNode {
  readonly type: 'object';
  readonly properties: {
    readonly name: string;
    readonly optional: boolean;
    readonly type: AST;
  }[];
  readonly indexSignature: AST | null;
}
export interface TupleAST extends BaseASTNode {
  readonly type: 'tuple';
  readonly elements: AST[];
  readonly spreadType: AST | null;
}
export interface TypeReferenceAST extends BaseASTNode {
  readonly type: 'type-reference';
  readonly typeName: string;
}
export interface UnionAST extends BaseASTNode {
  readonly type: 'union';
  readonly elements: AST[];
}
