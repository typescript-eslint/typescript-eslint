import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BinaryExpressionBase } from '../../base/BinaryExpressionBase';
import type { Expression } from '../../unions/Expression';

export interface AssignmentExpression extends BinaryExpressionBase {
  type: AST_NODE_TYPES.AssignmentExpression;
  operator:
    | '-='
    | '??='
    | '**='
    | '*='
    | '/='
    | '&&='
    | '&='
    | '%='
    | '^='
    | '+='
    | '<<='
    | '='
    | '>>='
    | '>>>='
    | '|='
    | '||=';
  left: Expression;
}
