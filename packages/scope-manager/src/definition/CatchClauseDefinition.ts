import type { TSESTree } from '@typescript-eslint/types';

import { DefinitionBase } from './DefinitionBase';
import { DefinitionType } from './DefinitionType';

export class CatchClauseDefinition extends DefinitionBase<
  DefinitionType.CatchClause,
  TSESTree.CatchClause,
  null,
  TSESTree.Identifier
> {
  public readonly isTypeDefinition = false;
  public readonly isVariableDefinition = true;

  constructor(name: TSESTree.Identifier, node: CatchClauseDefinition['node']) {
    super(DefinitionType.CatchClause, name, node, null);
  }
}
