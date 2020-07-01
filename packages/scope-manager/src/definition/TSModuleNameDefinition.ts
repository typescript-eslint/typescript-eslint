import { TSESTree } from '@typescript-eslint/types';
import { DefinitionType } from './DefinitionType';
import { DefinitionBase } from './DefinitionBase';

class TSModuleNameDefinition extends DefinitionBase<
  DefinitionType.TSModuleName,
  TSESTree.TSModuleDeclaration,
  null,
  TSESTree.Identifier
> {
  constructor(name: TSESTree.Identifier, node: TSModuleNameDefinition['node']) {
    super(DefinitionType.TSModuleName, name, node, null);
  }

  public readonly isTypeDefinition = true;
  public readonly isVariableDefinition = true;
}

export { TSModuleNameDefinition };
