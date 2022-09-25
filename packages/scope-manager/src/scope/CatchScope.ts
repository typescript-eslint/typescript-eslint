import type { TSESTree } from '@typescript-eslint/types';

import type { ScopeManager } from '../ScopeManager';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';

class CatchScope extends ScopeBase<
  ScopeType.catch,
  TSESTree.CatchClause,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: CatchScope['upper'],
    block: CatchScope['block'],
  ) {
    super(scopeManager, ScopeType.catch, upperScope, block, false);
  }
}

export { CatchScope };
