import { TSESTree } from '@typescript-eslint/types';
import { DefinitionType } from './DefinitionType';
import { DefinitionBase } from './DefinitionBase';

class ClassNameDefinition extends DefinitionBase<
  DefinitionType.ClassName,
  TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  null,
  TSESTree.Identifier
> {
  constructor(name: TSESTree.Identifier, node: ClassNameDefinition['node']) {
    super(DefinitionType.ClassName, name, node, null);
  }

  public readonly isTypeDefinition = true;
  public readonly isVariableDefinition = true;
}

export { ClassNameDefinition };
