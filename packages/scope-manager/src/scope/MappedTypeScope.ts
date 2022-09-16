import type { TSESTree } from '@typescript-eslint/types';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';
import type { ScopeManager } from '../ScopeManager';

class MappedTypeScope extends ScopeBase<
  ScopeType.mappedType,
  TSESTree.TSMappedType,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: MappedTypeScope['upper'],
    block: MappedTypeScope['block'],
  ) {
    super(scopeManager, ScopeType.mappedType, upperScope, block, false);
  }
}

export { MappedTypeScope };
