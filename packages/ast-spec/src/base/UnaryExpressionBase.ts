import type { UnaryExpression } from '../expression/UnaryExpression/spec';
import type { LeftHandSideExpression } from '../unions/LeftHandSideExpression';
import type { Literal } from '../unions/Literal';
import type { BaseNode } from './BaseNode';

export interface UnaryExpressionBase extends BaseNode {
  operator: string;
  prefix: boolean;
  argument: LeftHandSideExpression | Literal | UnaryExpression;
}
