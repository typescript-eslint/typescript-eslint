import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { MemberExpression } from '../../expression/MemberExpression/spec';
import type { TSAsExpression } from '../../expression/TSAsExpression/spec';
import type { TSNonNullExpression } from '../../expression/TSNonNullExpression/spec';
import type { TSSatisfiesExpression } from '../../expression/TSSatisfiesExpression/spec';
import type { TSTypeAssertion } from '../../expression/TSTypeAssertion/spec';
import type { Decorator } from '../../special/Decorator/spec';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { BindingName } from '../../unions/BindingName';
import type { Expression } from '../../unions/Expression';

export interface AssignmentPattern extends BaseNode {
  type: AST_NODE_TYPES.AssignmentPattern;
  decorators: Decorator[];
  left:
    | BindingName
    | MemberExpression
    | TSAsExpression
    | TSNonNullExpression
    | TSSatisfiesExpression
    | TSTypeAssertion;
  optional: boolean;
  right: Expression;
  typeAnnotation: TSTypeAnnotation | undefined;
}
