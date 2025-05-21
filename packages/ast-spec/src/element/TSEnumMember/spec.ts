import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type { PropertyNameNonComputed } from '../../unions/PropertyName';

export interface TSEnumMember extends BaseNode {
  type: AST_NODE_TYPES.TSEnumMember;
  id: PropertyNameNonComputed;
  initializer: Expression | undefined;
  /**
   * @deprecated the enum member is always non-computed.
   */
  computed: boolean;
}
