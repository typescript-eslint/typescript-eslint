import { TSESTree } from '@typescript-eslint/types';
import { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';
import { ScopeManager } from '../ScopeManager';

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
