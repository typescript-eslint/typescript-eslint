import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionBase } from '../../base/FunctionBase';
import type { BlockStatement } from '../../statement/BlockStatement/spec';

export interface FunctionExpression extends FunctionBase {
  type: AST_NODE_TYPES.FunctionExpression;
  body: BlockStatement;
  expression?: never;
}
