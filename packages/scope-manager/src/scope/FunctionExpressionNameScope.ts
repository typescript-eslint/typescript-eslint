import { TSESTree } from '@typescript-eslint/types';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';
import { Scope } from './Scope';
import { FunctionNameDefinition } from '../definition';
import { ScopeManager } from '../ScopeManager';

class FunctionExpressionNameScope extends ScopeBase<
  ScopeType.functionExpressionName,
  TSESTree.FunctionExpression,
  Scope
> {
  public readonly functionExpressionScope: true;
  constructor(
    scopeManager: ScopeManager,
    upperScope: FunctionExpressionNameScope['upper'],
    block: FunctionExpressionNameScope['block'],
  ) {
    super(
      scopeManager,
      ScopeType.functionExpressionName,
      upperScope,
      block,
      false,
    );
    if (block.id) {
      this.defineIdentifier(
        block.id,
        new FunctionNameDefinition(block.id, block),
      );
    }
    this.functionExpressionScope = true;
  }
}

export { FunctionExpressionNameScope };
