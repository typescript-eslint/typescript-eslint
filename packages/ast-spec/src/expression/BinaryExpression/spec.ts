import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { PrivateIdentifier } from '../../special/PrivateIdentifier/spec';
import type { Expression } from '../../unions/Expression';
import type { ValueOf } from '../../utils';
import type { BinaryOperatorToText } from './BinaryOperatorToText';

export * from './BinaryOperatorToText';

export interface BinaryExpression extends BaseNode {
  left: Expression | PrivateIdentifier;
  operator: ValueOf<BinaryOperatorToText>;
  right: Expression;
  type: AST_NODE_TYPES.BinaryExpression;
}
