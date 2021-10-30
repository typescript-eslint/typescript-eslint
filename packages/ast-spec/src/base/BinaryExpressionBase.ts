import type { PrivateIdentifier } from '../special/PrivateIdentifier/spec';
import type { Expression } from '../unions/Expression';
import type { BaseNode } from './BaseNode';

export interface BinaryExpressionBase extends BaseNode {
  operator: string;
  left: Expression | PrivateIdentifier;
  right: Expression;
}
