import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSTypeAnnotation } from '../../special/TSTypeAnnotation/spec';
import type { TSThisType } from '../TSThisType/spec';

interface TSTypePredicateBase extends BaseNode {
  type: AST_NODE_TYPES.TSTypePredicate;
  asserts: boolean;
  parameterName: Identifier | TSThisType;
  typeAnnotation: TSTypeAnnotation | null;
}

export interface TSTypePredicateWithAsserts extends TSTypePredicateBase {
  asserts: true;
}

export interface TSTypePredicateNoAsserts extends TSTypePredicateBase {
  asserts: false;
  typeAnnotation: TSTypeAnnotation;
}

export type TSTypePredicate =
  | TSTypePredicateNoAsserts
  | TSTypePredicateWithAsserts;
