import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeParameter } from '../../special/TSTypeParameter/spec';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSMappedType extends BaseNode {
  type: AST_NODE_TYPES.TSMappedType;
  typeParameter: TSTypeParameter;
  readonly?: boolean | '-' | '+';
  optional?: boolean | '-' | '+';
  typeAnnotation?: TypeNode;
  nameType: TypeNode | null;
}
