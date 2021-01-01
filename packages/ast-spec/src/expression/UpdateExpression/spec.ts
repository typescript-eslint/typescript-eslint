import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { UnaryExpressionBase } from '../../base/UnaryExpressionBase';

export interface UpdateExpression extends UnaryExpressionBase {
  type: AST_NODE_TYPES.UpdateExpression;
  operator: '--' | '++';
}
