import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSTypeOperator extends BaseNode {
  type: AST_NODE_TYPES.TSTypeOperator;
  typeAnnotation: TypeNode | undefined;
  operator: 'keyof' | 'readonly' | 'unique';
}
