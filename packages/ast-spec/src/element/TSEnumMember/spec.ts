import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Expression } from '../../unions/Expression';
import type {
  PropertyNameComputed,
  PropertyNameNonComputed,
} from '../../unions/PropertyName';

interface TSEnumMemberBase extends BaseNode {
  type: AST_NODE_TYPES.TSEnumMember;
  computed: boolean;
  id:
    | PropertyNameComputed // this should only happen in semantically invalid code (ts error 1164)
    | PropertyNameNonComputed;
  initializer: Expression | undefined;
}

/**
 * this should only really happen in semantically invalid code (errors 1164 and 2452)
 *
 * @example
 * ```ts
 * // VALID:
 * enum Foo { ['a'] }
 *
 * // INVALID:
 * const x = 'a';
 * enum Foo { [x] }
 * enum Bar { ['a' + 'b'] }
 * ```
 */
export interface TSEnumMemberComputedName extends TSEnumMemberBase {
  computed: true;
  id: PropertyNameComputed;
}

export interface TSEnumMemberNonComputedName extends TSEnumMemberBase {
  computed: false;
  id: PropertyNameNonComputed;
}

export type TSEnumMember =
  | TSEnumMemberComputedName
  | TSEnumMemberNonComputedName;
