import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionBase } from '../../base/FunctionBase';

export interface TSEmptyBodyFunctionExpression extends FunctionBase {
  body: null;
  id: null;
  type: AST_NODE_TYPES.TSEmptyBodyFunctionExpression;
}
