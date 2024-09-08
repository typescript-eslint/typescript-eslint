import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';

export interface ReturnStatement extends BaseNode {
  argument: Expression | null;
  type: AST_NODE_TYPES.ReturnStatement;
}
