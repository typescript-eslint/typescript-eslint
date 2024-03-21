import type { TSESTree } from '@typescript-eslint/types';

import { DefinitionBase } from './DefinitionBase';
import { DefinitionType } from './DefinitionType';

class ImplicitGlobalVariableDefinition extends DefinitionBase<
  DefinitionType.ImplicitGlobalVariable,
  TSESTree.Node,
  null,
  TSESTree.BindingName
> {
  public readonly isTypeDefinition = false;

  public readonly isVariableDefinition = true;
  constructor(
    name: TSESTree.BindingName,
    node: ImplicitGlobalVariableDefinition['node'],
  ) {
    super(DefinitionType.ImplicitGlobalVariable, name, node, null);
  }
}

export { ImplicitGlobalVariableDefinition };
