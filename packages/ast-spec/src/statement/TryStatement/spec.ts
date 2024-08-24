import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { CatchClause } from '../../special/CatchClause/spec';
import type { BlockStatement } from '../BlockStatement/spec';

export interface TryStatement extends BaseNode {
  block: BlockStatement;
  finalizer: BlockStatement | null;
  handler: CatchClause | null;
  type: AST_NODE_TYPES.TryStatement;
}
