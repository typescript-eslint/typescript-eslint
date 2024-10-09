import type { TSESTree } from '@typescript-eslint/types';

import { DefinitionBase } from './DefinitionBase';
import { DefinitionType } from './DefinitionType';

class TSEnumNameDefinition extends DefinitionBase<
  DefinitionType.TSEnumName,
  TSESTree.TSEnumDeclaration,
  null,
  TSESTree.Identifier
> {
  public readonly isTypeDefinition = true;

  public readonly isVariableDefinition = true;
  constructor(name: TSESTree.Identifier, node: TSEnumNameDefinition['node']) {
    super(DefinitionType.TSEnumName, name, node, null);
  }
}

export { TSEnumNameDefinition };
