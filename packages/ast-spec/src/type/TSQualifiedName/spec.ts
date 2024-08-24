import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { EntityName } from '../../unions/EntityName';

export interface TSQualifiedName extends BaseNode {
  left: EntityName;
  right: Identifier;
  type: AST_NODE_TYPES.TSQualifiedName;
}
