import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BinaryExpressionBase } from '../../base/BinaryExpressionBase';
import type { ValueOf } from '../../utils';
import type { AssignmentOperatorToText } from './AssignmentOperatorToText';

export * from './AssignmentOperatorToText';

export interface AssignmentExpression extends BinaryExpressionBase {
  type: AST_NODE_TYPES.AssignmentExpression;
  operator: ValueOf<AssignmentOperatorToText>;
}
