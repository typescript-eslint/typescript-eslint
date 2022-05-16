import { TSESTree } from '@typescript-eslint/types';
import { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';
import { assert } from '../assert';
import { ScopeManager } from '../ScopeManager';

class WithScope extends ScopeBase<
  ScopeType.with,
  TSESTree.WithStatement,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: WithScope['upper'],
    block: WithScope['block'],
  ) {
    super(scopeManager, ScopeType.with, upperScope, block, false);
  }
  close(scopeManager: ScopeManager): Scope | null {
    if (this.shouldStaticallyClose()) {
      return super.close(scopeManager);
    }
    assert(this.leftToResolve);
    this.leftToResolve.forEach(ref => this.delegateToUpperScope(ref));
    this.leftToResolve = null;
    return this.upper;
  }
}

export { WithScope };
