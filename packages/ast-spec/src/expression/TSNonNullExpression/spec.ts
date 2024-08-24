import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';

export interface TSNonNullExpression extends BaseNode {
  expression: Expression;
  type: AST_NODE_TYPES.TSNonNullExpression;
}
