import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionDeclarationBase } from '../../base/FunctionDeclarationBase';
import type { BlockStatement } from '../../statement/BlockStatement/spec';

export interface FunctionExpression extends FunctionDeclarationBase {
  type: AST_NODE_TYPES.FunctionExpression;
  body: BlockStatement;
}
