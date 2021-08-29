import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSAsExpression } from '../../expression/TSAsExpression/spec';
import type { Statement } from '../../unions/Statement';

export interface ThrowStatement extends BaseNode {
  type: AST_NODE_TYPES.ThrowStatement;
  argument: Statement | TSAsExpression | null;
}
