import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';

export interface ConditionalExpression extends BaseNode {
  alternate: Expression;
  consequent: Expression;
  test: Expression;
  type: AST_NODE_TYPES.ConditionalExpression;
}
