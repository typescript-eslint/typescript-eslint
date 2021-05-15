import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSParenthesizedType extends BaseNode {
  type: AST_NODE_TYPES.TSParenthesizedType;
  typeAnnotation: TypeNode;
}
