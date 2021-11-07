import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSIndexedAccessType extends BaseNode {
  type: AST_NODE_TYPES.TSIndexedAccessType;
  objectType: TypeNode;
  indexType: TypeNode;
}
