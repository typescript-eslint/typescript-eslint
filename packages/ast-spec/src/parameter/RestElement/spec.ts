import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Decorator } from '../../special/Decorator/spec';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { DestructuringPattern } from '../../unions/DestructuringPattern';
import type { AssignmentPattern } from '../AssignmentPattern/spec';

export interface RestElement extends BaseNode {
  type: AST_NODE_TYPES.RestElement;
  argument: DestructuringPattern;
  typeAnnotation?: TSTypeAnnotation;
  optional?: boolean;
  value?: AssignmentPattern;
  decorators?: Decorator[];
}
