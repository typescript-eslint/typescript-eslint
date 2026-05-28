import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';

export interface UpdateExpression extends BaseNode {
  type: AST_NODE_TYPES.UpdateExpression;
  argument: Expression;
  operator: '++' | '--';
  prefix: boolean;
}
