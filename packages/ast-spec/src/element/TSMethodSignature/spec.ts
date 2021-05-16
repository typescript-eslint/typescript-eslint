import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { Accessibility } from '../../base/Accessibility';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { TSTypeParameterDeclaration } from '../../special/TSTypeParameterDeclaration/spec';
import type { Parameter } from '../../unions/Parameter';
import type {
  PropertyName,
  PropertyNameComputed,
  PropertyNameNonComputed,
} from '../../unions/PropertyName';

interface TSMethodSignatureBase extends BaseNode {
  type: AST_NODE_TYPES.TSMethodSignature;
  key: PropertyName;
  computed: boolean;
  params: Parameter[];
  optional?: boolean;
  returnType?: TSTypeAnnotation;
  readonly?: boolean;
  typeParameters?: TSTypeParameterDeclaration;
  accessibility?: Accessibility;
  export?: boolean;
  static?: boolean;
}

export interface TSMethodSignatureComputedName extends TSMethodSignatureBase {
  key: PropertyNameComputed;
  computed: true;
}
export interface TSMethodSignatureNonComputedName
  extends TSMethodSignatureBase {
  key: PropertyNameNonComputed;
  computed: false;
}

export type TSMethodSignature =
  | TSMethodSignatureComputedName
  | TSMethodSignatureNonComputedName;
