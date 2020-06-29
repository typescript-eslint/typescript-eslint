import { TSESTree } from '@typescript-eslint/types';
import { DefinitionType } from './DefinitionType';
import { DefinitionBase } from './DefinitionBase';

class VariableDefinition extends DefinitionBase<
  DefinitionType.Variable,
  TSESTree.VariableDeclarator,
  TSESTree.VariableDeclaration,
  TSESTree.Identifier
> {
  constructor(
    name: TSESTree.Identifier,
    node: VariableDefinition['node'],
    decl: TSESTree.VariableDeclaration,
  ) {
    super(DefinitionType.Variable, name, node, decl);
  }

  public readonly isTypeDefinition = false;
  public readonly isVariableDefinition = true;
}

export { VariableDefinition };
