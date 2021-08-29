import type { AST_NODE_TYPES } from '../../ast-node-types';
import type { BaseNode } from '../../base/BaseNode';
import type { Identifier } from '../../expression/Identifier/spec';
import type { TSTypeParameterDeclaration } from '../../special/TSTypeParameterDeclaration/spec';
import type { TypeNode } from '../../unions/TypeNode';

export interface TSTypeAliasDeclaration extends BaseNode {
  type: AST_NODE_TYPES.TSTypeAliasDeclaration;
  id: Identifier;
  typeAnnotation: TypeNode;
  declare?: boolean;
  typeParameters?: TSTypeParameterDeclaration;
}
