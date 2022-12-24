import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSEnumMember } from '../../element/TSEnumMember/spec';
import type { Identifier } from '../../expression/Identifier/spec';
import type { Modifier } from '../../unions/Modifier';

export interface TSEnumDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSEnumDeclaration;
  /**
   * Whether this is a `const` enum.
   * ```
   * const enum Foo {...}
   * ```
   */
  const?: true;
  /**
   * Whether this is a `declare`d enum.
   * ```
   * declare enum Foo {...}
   * ```
   */
  declare?: true;
  /**
   * The enum name.
   */
  id: Identifier;
  /**
   * The enum members.
   */
  members: TSEnumMember[];
  // TODO(#4759) - breaking change remove this
  modifiers?: Modifier[];
}
