import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { Accessibility } from '../../base/Accessibility';
import type { BaseNode } from '../../base/BaseNode';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { Parameter } from '../../unions/Parameter';

export interface TSIndexSignature extends BaseNode {
  type: AST_NODE_TYPES.TSIndexSignature;
  parameters: Parameter[];
  typeAnnotation?: TSTypeAnnotation;
  readonly?: boolean;
  accessibility?: Accessibility;
  export?: boolean;
  static?: boolean;
}
