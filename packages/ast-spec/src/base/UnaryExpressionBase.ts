import type { Expression } from '../unions/Expression';
import type { BaseNode } from './BaseNode';

export interface UnaryExpressionBase extends BaseNode {
  operator: string;
  prefix: boolean;
  argument: Expression;
}
