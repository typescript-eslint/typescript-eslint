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
  key: PropertyName;
  optional: boolean;
  computed: boolean;
  typeAnnotation: TSTypeAnnotation | undefined;
  readonly: boolean;
  static: boolean;
  accessibility: Accessibility | undefined;
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
