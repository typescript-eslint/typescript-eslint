import { TSESTree } from '@typescript-eslint/types';
import { DefinitionType } from './DefinitionType';
import { DefinitionBase } from './DefinitionBase';

class TSEnumMemberDefinition extends DefinitionBase<
  DefinitionType.TSEnumMember,
  TSESTree.TSEnumMember,
  null,
  TSESTree.Identifier | TSESTree.StringLiteral
> {
  constructor(
    name: TSESTree.Identifier | TSESTree.StringLiteral,
    node: TSEnumMemberDefinition['node'],
  ) {
    super(DefinitionType.TSEnumMember, name, node, null);
  }

  public readonly isTypeDefinition = true;
  public readonly isVariableDefinition = true;
}

export { TSEnumMemberDefinition };
