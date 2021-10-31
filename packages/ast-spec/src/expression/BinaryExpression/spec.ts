import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BinaryExpressionBase } from '../../base/BinaryExpressionBase';
import type { PrivateIdentifier } from '../../special/PrivateIdentifier/spec';
import type { Expression } from '../../unions/Expression';

export interface BinaryExpression extends BinaryExpressionBase {
  type: AST_NODE_TYPES.BinaryExpression;
  left: Expression | PrivateIdentifier;
}
