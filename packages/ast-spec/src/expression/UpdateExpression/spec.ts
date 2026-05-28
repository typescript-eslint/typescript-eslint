import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { Expression } from '../../unions/Expression';

export interface UpdateExpression {
  type: AST_NODE_TYPES.UpdateExpression;
  argument: Expression;
  operator: '++' | '--';
  prefix: boolean;
}
