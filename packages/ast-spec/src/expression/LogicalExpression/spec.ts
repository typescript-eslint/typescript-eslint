import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';

export interface LogicalExpression extends BaseNode {
  left: Expression;
  operator: '&&' | '??' | '||';
  right: Expression;
  type: AST_NODE_TYPES.LogicalExpression;
}
