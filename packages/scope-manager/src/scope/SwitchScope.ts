import { TSESTree } from '@typescript-eslint/types';
import { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';
import { ScopeManager } from '../ScopeManager';

class SwitchScope extends ScopeBase<
  ScopeType.switch,
  TSESTree.SwitchStatement,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: SwitchScope['upper'],
    block: SwitchScope['block'],
  ) {
    super(scopeManager, ScopeType.switch, upperScope, block, false);
  }
}

export { SwitchScope };
