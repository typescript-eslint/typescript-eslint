import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSTypeAssertion extends BaseNode {
  expression: Expression;
  type: AST_NODE_TYPES.TSTypeAssertion;
  typeAnnotation: TypeNode;
}
