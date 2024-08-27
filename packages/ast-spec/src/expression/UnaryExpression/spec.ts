import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { UnaryExpressionBase } from '../../base/UnaryExpressionBase';

export interface UnaryExpression extends UnaryExpressionBase {
  operator: '!' | '+' | '~' | '-' | 'delete' | 'typeof' | 'void';
  type: AST_NODE_TYPES.UnaryExpression;
}
