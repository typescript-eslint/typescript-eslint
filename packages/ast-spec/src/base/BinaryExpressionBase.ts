import type { Expression } from '../unions/Expression';
import type { BaseNode } from './BaseNode';

export interface BinaryExpressionBase extends BaseNode {
  operator: string;
  left: Expression;
  right: Expression;
}
