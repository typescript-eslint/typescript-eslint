import { TSESTree } from '@typescript-eslint/types';
import { DefinitionType } from './DefinitionType';
import { DefinitionBase } from './DefinitionBase';

class CatchClauseDefinition extends DefinitionBase<
  DefinitionType.CatchClause,
  TSESTree.CatchClause,
  null,
  TSESTree.BindingName
> {
  constructor(name: TSESTree.BindingName, node: CatchClauseDefinition['node']) {
    super(DefinitionType.CatchClause, name, node, null);
  }

  public readonly isTypeDefinition = false;
  public readonly isVariableDefinition = true;
}

export { CatchClauseDefinition };
