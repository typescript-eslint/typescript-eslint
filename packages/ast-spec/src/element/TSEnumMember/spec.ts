import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { StringLiteral } from '../../expression/literal/StringLiteral/spec';
import type { Expression } from '../../unions/Expression';

export interface TSEnumMember extends BaseNode {
  type: AST_NODE_TYPES.TSEnumMember;
  id: Identifier | StringLiteral;
  initializer: Expression | undefined;
  /**
   * @deprecated the enum member is always non-computed.
   */
  computed: boolean;
}
