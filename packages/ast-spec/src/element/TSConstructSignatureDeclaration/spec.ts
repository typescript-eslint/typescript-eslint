import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { TSFunctionSignatureBase } from '../../base/TSFunctionSignatureBase';

export interface TSConstructSignatureDeclaration
  extends TSFunctionSignatureBase {
  type: AST_NODE_TYPES.TSConstructSignatureDeclaration;
}
