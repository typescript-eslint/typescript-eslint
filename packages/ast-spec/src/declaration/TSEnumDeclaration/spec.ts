import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSEnumMember } from '../../element/TSEnumMember/spec';
import type { Identifier } from '../../expression/Identifier/spec';
import type { Modifier } from '../../unions/Modifier';

export interface TSEnumDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSEnumDeclaration;
  /**
   * `true` if this is a `const` enum.
   * ```
   * const enum Foo {...}
   * ```
   */
  // TODO - make this `false` if it is not `const`
  const?: boolean;
  /**
   * `true` if this is a `declare`d enum.
   * ```
   * declare enum Foo {...}
   * ```
   */
  // TODO - make this `false` if it is not `declare`d
  declare?: boolean;
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
