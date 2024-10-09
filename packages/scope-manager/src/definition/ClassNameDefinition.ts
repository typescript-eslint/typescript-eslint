import type { TSESTree } from '@typescript-eslint/types';

import { DefinitionBase } from './DefinitionBase';
import { DefinitionType } from './DefinitionType';

class ClassNameDefinition extends DefinitionBase<
  DefinitionType.ClassName,
  TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  null,
  TSESTree.Identifier
> {
  public readonly isTypeDefinition = true;

  public readonly isVariableDefinition = true;
  constructor(name: TSESTree.Identifier, node: ClassNameDefinition['node']) {
    super(DefinitionType.ClassName, name, node, null);
  }
}

export { ClassNameDefinition };
