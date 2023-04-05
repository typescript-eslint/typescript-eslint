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
  accessibility: Accessibility | undefined;
  computed: boolean;
  key: PropertyName;
  kind: 'get' | 'method' | 'set';
  optional: boolean;
  params: Parameter[];
  readonly: boolean;
  returnType: TSTypeAnnotation | undefined;
  static: boolean;
  typeParameters: TSTypeParameterDeclaration | undefined;
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
