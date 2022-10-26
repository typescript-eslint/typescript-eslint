import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSTypeParameterDeclaration } from '../../special/TSTypeParameterDeclaration/spec';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSTypeAliasDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSTypeAliasDeclaration;
  /**
   * Whether the type was `declare`d.
   * ```
   * declare type T = 1;
   * ```
   */
  // TODO(#5020) - make this `false` if it is not `declare`d
  declare?: boolean;
  /**
   * The name of the type.
   */
  id: Identifier;
  /**
   * The "value" (type) of the declaration
   */
  typeAnnotation: TypeNode;
  /**
   * The generic type parameters declared for the type.
   * This is `undefined` if there are no generic type parameters declared.
   */
  typeParameters?: TSTypeParameterDeclaration;
}
