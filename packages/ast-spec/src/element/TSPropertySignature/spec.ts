import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { Accessibility } from '../../base/Accessibility';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type {
  PropertyName,
  PropertyNameComputed,
  PropertyNameNonComputed,
} from '../../unions/PropertyName';

interface TSPropertySignatureBase extends BaseNode {
  type: AST_NODE_TYPES.TSPropertySignature;
  typeAnnotation: TSTypeAnnotation | undefined;
  accessibility: Accessibility | undefined;
  computed: boolean;
  key: PropertyName;
  optional: boolean;
  readonly: boolean;
  static: boolean;
}

export interface TSPropertySignatureComputedName
  extends TSPropertySignatureBase {
  computed: true;
  key: PropertyNameComputed;
}

export interface TSPropertySignatureNonComputedName
  extends TSPropertySignatureBase {
  computed: false;
  key: PropertyNameNonComputed;
}

export type TSPropertySignature =
  | TSPropertySignatureComputedName
  | TSPropertySignatureNonComputedName;
