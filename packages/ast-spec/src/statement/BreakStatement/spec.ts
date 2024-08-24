import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';

export interface BreakStatement extends BaseNode {
  label: Identifier | null;
  type: AST_NODE_TYPES.BreakStatement;
}
