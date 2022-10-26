import type { TSESTree } from '@typescript-eslint/types';

import type { ScopeManager } from '../ScopeManager';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';

class ForScope extends ScopeBase<
  ScopeType.for,
  TSESTree.ForInStatement | TSESTree.ForOfStatement | TSESTree.ForStatement,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: ForScope['upper'],
    block: ForScope['block'],
  ) {
    super(scopeManager, ScopeType.for, upperScope, block, false);
  }
}

export { ForScope };
