import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type { Statement } from '../../unions/Statement';

export interface WithStatement extends BaseNode {
  type: AST_NODE_TYPES.WithStatement;
  object: Expression;
  body: Statement;
}
