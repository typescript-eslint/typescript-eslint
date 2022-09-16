import type { TSESTree } from '@typescript-eslint/types';

import type { ScopeManager } from '../ScopeManager';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';

class TSModuleScope extends ScopeBase<
  ScopeType.tsModule,
  TSESTree.TSModuleDeclaration,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: TSModuleScope['upper'],
    block: TSModuleScope['block'],
  ) {
    super(scopeManager, ScopeType.tsModule, upperScope, block, false);
  }
}

export { TSModuleScope };
