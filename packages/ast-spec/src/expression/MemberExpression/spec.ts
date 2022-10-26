import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { PrivateIdentifier } from '../../special/PrivateIdentifier/spec';
import type { Expression } from '../../unions/Expression';
import type { LeftHandSideExpression } from '../../unions/LeftHandSideExpression';
import type { Identifier } from '../Identifier/spec';

interface MemberExpressionBase extends BaseNode {
  object: LeftHandSideExpression;
  property: Expression | Identifier | PrivateIdentifier;
  computed: boolean;
  optional: boolean;
}

export interface MemberExpressionComputedName extends MemberExpressionBase {
  type: AST_NODE_TYPES.MemberExpression;
  property: Expression;
  computed: true;
}

export interface MemberExpressionNonComputedName extends MemberExpressionBase {
  type: AST_NODE_TYPES.MemberExpression;
  property: Identifier | PrivateIdentifier;
  computed: false;
}

export type MemberExpression =
  | MemberExpressionComputedName
  | MemberExpressionNonComputedName;
