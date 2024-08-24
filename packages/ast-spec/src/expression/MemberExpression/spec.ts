import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { PrivateIdentifier } from '../../special/PrivateIdentifier/spec';
import type { Expression } from '../../unions/Expression';
import type { Identifier } from '../Identifier/spec';

interface MemberExpressionBase extends BaseNode {
  computed: boolean;
  object: Expression;
  optional: boolean;
  property: Expression | Identifier | PrivateIdentifier;
}

export interface MemberExpressionComputedName extends MemberExpressionBase {
  computed: true;
  property: Expression;
  type: AST_NODE_TYPES.MemberExpression;
}

export interface MemberExpressionNonComputedName extends MemberExpressionBase {
  computed: false;
  property: Identifier | PrivateIdentifier;
  type: AST_NODE_TYPES.MemberExpression;
}

export type MemberExpression =
  | MemberExpressionComputedName
  | MemberExpressionNonComputedName;
