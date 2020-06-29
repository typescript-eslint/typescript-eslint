import { TSESTree } from '@typescript-eslint/types';
import { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';
import { ScopeManager } from '../ScopeManager';

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
