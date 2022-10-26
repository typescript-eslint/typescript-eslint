import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSInterfaceBody } from '../../special/TSInterfaceBody/spec';
import type { TSInterfaceHeritage } from '../../special/TSInterfaceHeritage/spec';
import type { TSTypeParameterDeclaration } from '../../special/TSTypeParameterDeclaration/spec';

export interface TSInterfaceDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSInterfaceDeclaration;
  // TODO(#4759) - breaking change remove this
  abstract?: boolean;
  /**
   * The body of the interface
   */
  body: TSInterfaceBody;
  /**
   * Whether the interface was `declare`d, `undefined` otherwise
   */
  // TODO(#5020) - make this `false` if it is not `declare`d
  declare?: boolean;
  /**
   * The types this interface `extends`
   */
  extends?: TSInterfaceHeritage[];
  /**
   * The name of this interface
   */
  id: Identifier;
  // TODO(#4759) - breaking change remove this
  implements?: TSInterfaceHeritage[];
  /**
   * The generic type parameters declared for the interface.
   * This is `undefined` if there are no generic type parameters declared.
   */
  typeParameters?: TSTypeParameterDeclaration;
}
