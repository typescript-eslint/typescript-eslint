import { TSESTree } from '@typescript-eslint/types';
import { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';
import { ScopeManager } from '../ScopeManager';

class BlockScope extends ScopeBase<
  ScopeType.block,
  TSESTree.BlockStatement,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: BlockScope['upper'],
    block: BlockScope['block'],
  ) {
    super(scopeManager, ScopeType.block, upperScope, block, false);
  }
}

export { BlockScope };
