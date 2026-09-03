import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';

interface YieldExpressionBase extends BaseNode {
  type: AST_NODE_TYPES.YieldExpression;
  argument: Expression | null;
  delegate: boolean;
}

export interface YieldStarExpression extends YieldExpressionBase {
  argument: Expression;
  delegate: true;
}

export interface YieldNoStarExpression extends YieldExpressionBase {
  delegate: false;
}

export type YieldExpression = YieldNoStarExpression | YieldStarExpression;
