import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BinaryExpressionBase } from '../../base/BinaryExpressionBase';

export interface LogicalExpression extends BinaryExpressionBase {
  type: AST_NODE_TYPES.LogicalExpression;
}
