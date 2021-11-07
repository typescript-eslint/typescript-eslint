import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BinaryExpressionBase } from '../../base/BinaryExpressionBase';

export interface BinaryExpression extends BinaryExpressionBase {
  type: AST_NODE_TYPES.BinaryExpression;
}
