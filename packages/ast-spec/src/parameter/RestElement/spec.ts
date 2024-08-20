import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Decorator } from '../../special/Decorator/spec';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { DestructuringPattern } from '../../unions/DestructuringPattern';
import type { AssignmentPattern } from '../AssignmentPattern/spec';

export interface RestElement extends BaseNode {
  argument: DestructuringPattern;
  decorators: Decorator[];
  optional: boolean;
  type: AST_NODE_TYPES.RestElement;
  typeAnnotation: TSTypeAnnotation | undefined;
  value: AssignmentPattern | undefined;
}
