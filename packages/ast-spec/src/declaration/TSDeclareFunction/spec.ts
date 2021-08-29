import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { FunctionDeclarationBase } from '../../base/FunctionDeclarationBase';

export interface TSDeclareFunction extends FunctionDeclarationBase {
  type: AST_NODE_TYPES.TSDeclareFunction;
}
