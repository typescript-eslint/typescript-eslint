import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { TSFunctionSignatureBase } from '../../base/TSFunctionSignatureBase';

export interface TSConstructorType extends TSFunctionSignatureBase {
  abstract: boolean;
  type: AST_NODE_TYPES.TSConstructorType;
}
