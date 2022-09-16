import type { TSESTree } from '@typescript-eslint/types';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';
import type { ScopeManager } from '../ScopeManager';

class ModuleScope extends ScopeBase<ScopeType.module, TSESTree.Program, Scope> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: ModuleScope['upper'],
    block: ModuleScope['block'],
  ) {
    super(scopeManager, ScopeType.module, upperScope, block, false);
  }
}

export { ModuleScope };
