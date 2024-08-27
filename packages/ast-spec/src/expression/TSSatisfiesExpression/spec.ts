import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSSatisfiesExpression extends BaseNode {
  expression: Expression;
  type: AST_NODE_TYPES.TSSatisfiesExpression;
  typeAnnotation: TypeNode;
}
