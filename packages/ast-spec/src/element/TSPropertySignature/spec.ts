import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { Accessibility } from '../../base/Accessibility';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { Expression } from '../../unions/Expression';
import type {
  PropertyName,
  PropertyNameComputed,
  PropertyNameNonComputed,
} from '../../unions/PropertyName';

interface TSPropertySignatureBase extends BaseNode {
  type: AST_NODE_TYPES.TSPropertySignature;
  key: PropertyName;
  optional?: boolean;
  computed: boolean;
  typeAnnotation?: TSTypeAnnotation;
  initializer?: Expression;
  readonly?: boolean;
  static?: boolean;
  export?: boolean;
  accessibility?: Accessibility;
}

export interface TSPropertySignatureComputedName
  extends TSPropertySignatureBase {
  key: PropertyNameComputed;
  computed: true;
}

export interface TSPropertySignatureNonComputedName
  extends TSPropertySignatureBase {
  key: PropertyNameNonComputed;
  computed: false;
}

export type TSPropertySignature =
  | TSPropertySignatureComputedName
  | TSPropertySignatureNonComputedName;
