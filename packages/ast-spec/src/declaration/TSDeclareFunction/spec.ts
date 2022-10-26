import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionBase } from '../../base/FunctionBase';
import type { BlockStatement } from '../../statement/BlockStatement/spec';

// TODO(#1852) - async + declare are semantically invalid together
export interface TSDeclareFunction extends FunctionBase {
  type: AST_NODE_TYPES.TSDeclareFunction;
  // TODO(#1852) - breaking change enforce this is always `null` like `TSEmptyBodyFunctionExpression`
  body?: BlockStatement;
  // TODO(#5020) - make this always `false` if it is not `declare`d instead of `undefined`
  declare?: boolean;
  expression: false;
}
