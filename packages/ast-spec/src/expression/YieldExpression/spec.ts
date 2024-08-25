import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';

export interface YieldExpression extends BaseNode {
  argument: Expression | undefined;
  delegate: boolean;
  type: AST_NODE_TYPES.YieldExpression;
}
