import type { TSESTree } from '@typescript-eslint/types';

import type { ScopeManager } from '../ScopeManager';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';

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
