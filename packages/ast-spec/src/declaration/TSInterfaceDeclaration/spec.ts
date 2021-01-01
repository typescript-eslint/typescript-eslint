import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSInterfaceBody } from '../../special/TSInterfaceBody/spec';
import type { TSInterfaceHeritage } from '../../special/TSInterfaceHeritage/spec';
import type { TSTypeParameterDeclaration } from '../../special/TSTypeParameterDeclaration/spec';

export interface TSInterfaceDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSInterfaceDeclaration;
  body: TSInterfaceBody;
  id: Identifier;
  typeParameters?: TSTypeParameterDeclaration;
  extends?: TSInterfaceHeritage[];
  implements?: TSInterfaceHeritage[];
  abstract?: boolean;
  declare?: boolean;
}
