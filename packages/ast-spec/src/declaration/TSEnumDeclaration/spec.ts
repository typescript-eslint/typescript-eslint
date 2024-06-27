import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { TSEnumMember } from '../../element/TSEnumMember/spec';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSEnumBody } from '../../special/TSEnumBody/spec';

export interface TSEnumDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSEnumDeclaration;
  /**
   * The body of the enum.
   */
  body: TSEnumBody;
  /**
   * Whether this is a `const` enum.
   * ```
   * const enum Foo {...}
   * ```
   */
  const: boolean;
  /**
   * Whether this is a `declare`d enum.
   * ```
   * declare enum Foo {...}
   * ```
   */
  declare: boolean;
  /**
   * The enum name.
   */
  id: Identifier;
  /**
   * The enum members.
   * @deprecated Use {@link body} instead.
   */
  members: TSEnumMember[];
}
