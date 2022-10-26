import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { PrivateIdentifier } from '../../special/PrivateIdentifier/spec';
import type { Expression } from '../../unions/Expression';

export interface BinaryExpression extends BaseNode {
  type: AST_NODE_TYPES.BinaryExpression;
  operator: string;
  left: Expression | PrivateIdentifier;
  right: Expression;
}
