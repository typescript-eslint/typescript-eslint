import type { TSESTree } from '@typescript-eslint/types';

import { FunctionNameDefinition } from '../definition';
import type { ScopeManager } from '../ScopeManager';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';

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
