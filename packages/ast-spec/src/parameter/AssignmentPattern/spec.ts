import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Decorator } from '../../special/Decorator/spec';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { BindingName } from '../../unions/BindingName';
import type { Expression } from '../../unions/Expression';

export interface AssignmentPattern extends BaseNode {
  decorators: Decorator[];
  left: BindingName;
  optional: boolean;
  right: Expression;
  type: AST_NODE_TYPES.AssignmentPattern;
  typeAnnotation: TSTypeAnnotation | undefined;
}
