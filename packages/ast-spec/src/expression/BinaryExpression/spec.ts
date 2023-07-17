import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { PrivateIdentifier } from '../../special/PrivateIdentifier/spec';
import type { Expression } from '../../unions/Expression';
import type { ValueOf } from '../../utils';
import type { BinaryOperatorToText } from './BinaryOperatorToText';

export * from './BinaryOperatorToText';

export interface BinaryExpression extends BaseNode {
  type: AST_NODE_TYPES.BinaryExpression;
  operator: ValueOf<BinaryOperatorToText>;
  left: Expression | PrivateIdentifier;
  right: Expression;
}
