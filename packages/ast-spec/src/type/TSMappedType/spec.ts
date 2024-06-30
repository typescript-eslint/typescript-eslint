import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSTypeParameter } from '../../special/TSTypeParameter/spec';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSMappedType extends BaseNode {
  type: AST_NODE_TYPES.TSMappedType;

  /** @deprecated Use {@link `constraint`} and {@link `key`} instead. */
  typeParameter: TSTypeParameter;

  constraint: TypeNode;
  key: Identifier;
  readonly: boolean | '-' | '+' | undefined;
  optional: boolean | '-' | '+' | undefined;
  typeAnnotation: TypeNode | undefined;
  nameType: TypeNode | null;
}
