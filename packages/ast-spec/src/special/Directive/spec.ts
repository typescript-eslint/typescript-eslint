import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Literal } from '../../unions/Literal';

export interface Directive extends BaseNode {
  type: AST_NODE_TYPES.ExpressionStatement;
  expression: Literal;
  directive: string;
}
