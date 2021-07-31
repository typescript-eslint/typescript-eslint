import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSEnumMember } from '../../element/TSEnumMember/spec';
import type { Identifier } from '../../expression/Identifier/spec';
import type { Modifier } from '../../unions/Modifier';

export interface TSEnumDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSEnumDeclaration;
  id: Identifier;
  members: TSEnumMember[];
  const?: boolean;
  declare?: boolean;
  modifiers?: Modifier[];
}
