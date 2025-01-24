import type { TSESTree } from '@typescript-eslint/types';

import { DefinitionBase } from './DefinitionBase';
import { DefinitionType } from './DefinitionType';

export class FunctionNameDefinition extends DefinitionBase<
  DefinitionType.FunctionName,
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.TSDeclareFunction
  | TSESTree.TSEmptyBodyFunctionExpression,
  null,
  TSESTree.Identifier
> {
  public readonly isTypeDefinition = false;
  public readonly isVariableDefinition = true;

  constructor(name: TSESTree.Identifier, node: FunctionNameDefinition['node']) {
    super(DefinitionType.FunctionName, name, node, null);
  }
}
