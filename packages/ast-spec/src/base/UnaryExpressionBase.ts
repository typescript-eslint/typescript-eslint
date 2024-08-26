import type { Expression } from '../unions/Expression';
import type { BaseNode } from './BaseNode';

export interface UnaryExpressionBase extends BaseNode {
  argument: Expression;
  operator: string;
  prefix: boolean;
}
