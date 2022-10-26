import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSEnumMember } from '../../element/TSEnumMember/spec';
import type { Identifier } from '../../expression/Identifier/spec';

export interface TSEnumDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSEnumDeclaration;
  /**
   * Whether this is a `const` enum.
   * ```
   * const enum Foo {...}
   * ```
   */
  // TODO(#5020) - make this `false` if it is not `const`
  const?: boolean;
  /**
   * Whether this is a `declare`d enum.
   * ```
   * declare enum Foo {...}
   * ```
   */
  // TODO(#5020) - make this `false` if it is not `declare`d
  declare?: boolean;
  /**
   * The enum name.
   */
  id: Identifier;
  /**
   * The enum members.
   */
  members: TSEnumMember[];
}
