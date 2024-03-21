import type { TSESTree } from '@typescript-eslint/types';

import { DefinitionBase } from './DefinitionBase';
import { DefinitionType } from './DefinitionType';

class TypeDefinition extends DefinitionBase<
  DefinitionType.Type,
  | TSESTree.TSInterfaceDeclaration
  | TSESTree.TSTypeAliasDeclaration
  | TSESTree.TSTypeParameter,
  null,
  TSESTree.Identifier
> {
  public readonly isTypeDefinition = true;

  public readonly isVariableDefinition = false;
  constructor(name: TSESTree.Identifier, node: TypeDefinition['node']) {
    super(DefinitionType.Type, name, node, null);
  }
}

export { TypeDefinition };
