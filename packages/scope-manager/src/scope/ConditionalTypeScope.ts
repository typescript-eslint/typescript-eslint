import { TSESTree } from '@typescript-eslint/types';
import { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';
import { ScopeManager } from '../ScopeManager';

class ConditionalTypeScope extends ScopeBase<
  ScopeType.conditionalType,
  TSESTree.TSConditionalType,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: ConditionalTypeScope['upper'],
    block: ConditionalTypeScope['block'],
  ) {
    super(scopeManager, ScopeType.conditionalType, upperScope, block, false);
  }
}

export { ConditionalTypeScope };
