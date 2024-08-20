import type { TSESTree } from '@typescript-eslint/types';

import { DefinitionBase } from './DefinitionBase';
import { DefinitionType } from './DefinitionType';

class TSModuleNameDefinition extends DefinitionBase<
  DefinitionType.TSModuleName,
  TSESTree.TSModuleDeclaration,
  null,
  TSESTree.Identifier
> {
  public readonly isTypeDefinition = true;

  public readonly isVariableDefinition = true;
  constructor(name: TSESTree.Identifier, node: TSModuleNameDefinition['node']) {
    super(DefinitionType.TSModuleName, name, node, null);
  }
}

export { TSModuleNameDefinition };
