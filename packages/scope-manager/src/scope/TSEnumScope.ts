import type { TSESTree } from '@typescript-eslint/types';

import type { ScopeManager } from '../ScopeManager';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';

class TSEnumScope extends ScopeBase<
  ScopeType.tsEnum,
  TSESTree.TSEnumDeclaration,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: TSEnumScope['upper'],
    block: TSEnumScope['block'],
  ) {
    super(scopeManager, ScopeType.tsEnum, upperScope, block, false);
  }
}

export { TSEnumScope };
