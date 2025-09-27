/**
 * Maps ref paths to generated type names.
 */
export type RefMap = ReadonlyMap<
  // ref path
  string,
  // type name
  string
>;

/**
 * Minimal representation of the nodes in a schema being compiled to types.
 */
export type SchemaAST =
  | ArrayAST
  | LiteralAST
  | ObjectAST
  | TupleAST
  | TypeReferenceAST
  | UnionAST;

export interface BaseSchemaASTNode {
  readonly commentLines: string[];
}

export interface ArrayAST extends BaseSchemaASTNode {
  readonly elementType: SchemaAST;
  readonly type: 'array';
}
export interface LiteralAST extends BaseSchemaASTNode {
  readonly code: string;
  readonly type: 'literal';
}
export interface ObjectAST extends BaseSchemaASTNode {
  readonly indexSignature: SchemaAST | null;
  readonly properties: {
    readonly name: string;
    readonly optional: boolean;
    readonly type: SchemaAST;
  }[];
  readonly type: 'object';
}
export interface TupleAST extends BaseSchemaASTNode {
  readonly elements: SchemaAST[];
  readonly spreadType: SchemaAST | null;
  readonly type: 'tuple';
}
export interface TypeReferenceAST extends BaseSchemaASTNode {
  readonly type: 'type-reference';
  readonly typeName: string;
}
export interface UnionAST extends BaseSchemaASTNode {
  readonly elements: SchemaAST[];
  readonly type: 'union';
}
