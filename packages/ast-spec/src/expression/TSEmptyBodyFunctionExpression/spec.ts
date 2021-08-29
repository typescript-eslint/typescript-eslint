import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionDeclarationBase } from '../../base/FunctionDeclarationBase';

export interface TSEmptyBodyFunctionExpression extends FunctionDeclarationBase {
  type: AST_NODE_TYPES.TSEmptyBodyFunctionExpression;
  body: null;
}
