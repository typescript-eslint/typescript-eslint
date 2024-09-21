import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';

export interface TSExternalModuleReference extends BaseNode {
  expression: StringLiteral;
  type: AST_NODE_TYPES.TSExternalModuleReference;
}
