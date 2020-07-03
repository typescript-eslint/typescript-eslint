import { TSESTree } from '@typescript-eslint/types';
import { DefinitionType } from './DefinitionType';
import { DefinitionBase } from './DefinitionBase';

class TypeDefinition extends DefinitionBase<
  DefinitionType.Type,
  | TSESTree.TSInterfaceDeclaration
  | TSESTree.TSTypeAliasDeclaration
  | TSESTree.TSTypeParameter,
  null,
  TSESTree.Identifier
> {
  constructor(name: TSESTree.Identifier, node: TypeDefinition['node']) {
    super(DefinitionType.Type, name, node, null);
  }

  public readonly isTypeDefinition = true;
  public readonly isVariableDefinition = false;
}

export { TypeDefinition };
