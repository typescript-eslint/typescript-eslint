import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type { ValueOf } from '../../utils';
import type { AssignmentOperatorToText } from './AssignmentOperatorToText';

export type * from './AssignmentOperatorToText';

export interface AssignmentExpression extends BaseNode {
  left: Expression;
  operator: ValueOf<AssignmentOperatorToText>;
  right: Expression;
  type: AST_NODE_TYPES.AssignmentExpression;
}
