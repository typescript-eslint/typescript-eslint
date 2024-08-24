import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSEnumMember } from '../../element/TSEnumMember/spec';

export interface TSEnumBody extends BaseNode {
  members: TSEnumMember[];
  type: AST_NODE_TYPES.TSEnumBody;
}
