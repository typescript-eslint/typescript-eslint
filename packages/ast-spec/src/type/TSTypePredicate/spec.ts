import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { TSThisType } from '../TSThisType/spec';

export interface TSTypePredicate extends BaseNode {
  asserts: boolean;
  parameterName: Identifier | TSThisType;
  type: AST_NODE_TYPES.TSTypePredicate;
  typeAnnotation: TSTypeAnnotation | null;
}
