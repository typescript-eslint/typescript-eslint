import type { TSESTree } from '@typescript-eslint/types';

import { DefinitionBase } from './DefinitionBase';
import { DefinitionType } from './DefinitionType';

class TSEnumMemberDefinition extends DefinitionBase<
  DefinitionType.TSEnumMember,
  TSESTree.TSEnumMember,
  null,
  TSESTree.Identifier | TSESTree.StringLiteral
> {
  public readonly isTypeDefinition = true;

  public readonly isVariableDefinition = true;
  constructor(
    name: TSESTree.Identifier | TSESTree.StringLiteral,
    node: TSEnumMemberDefinition['node'],
  ) {
    super(DefinitionType.TSEnumMember, name, node, null);
  }
}

export { TSEnumMemberDefinition };
