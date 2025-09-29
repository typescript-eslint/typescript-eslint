import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type { Statement } from '../../unions/Statement';

export interface IfStatement extends BaseNode {
  type: AST_NODE_TYPES.IfStatement;
  alternate: Statement | null;
  consequent: Statement;
  test: Expression;
}
