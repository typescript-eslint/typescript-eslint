import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { BlockStatement } from '../../statement/BlockStatement/spec';
import type { BindingName } from '../../unions/BindingName';

export interface CatchClause extends BaseNode {
  body: BlockStatement;
  param: BindingName | null;
  type: AST_NODE_TYPES.CatchClause;
}
