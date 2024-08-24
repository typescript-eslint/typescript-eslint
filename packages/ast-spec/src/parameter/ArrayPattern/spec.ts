import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Decorator } from '../../special/Decorator/spec';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { DestructuringPattern } from '../../unions/DestructuringPattern';

export interface ArrayPattern extends BaseNode {
  decorators: Decorator[];
  elements: (DestructuringPattern | null)[];
  optional: boolean;
  type: AST_NODE_TYPES.ArrayPattern;
  typeAnnotation: TSTypeAnnotation | undefined;
}
