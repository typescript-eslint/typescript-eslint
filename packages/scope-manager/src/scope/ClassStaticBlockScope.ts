import type { TSESTree } from '@typescript-eslint/types';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';
import type { ScopeManager } from '../ScopeManager';

class ClassStaticBlockScope extends ScopeBase<
  ScopeType.classStaticBlock,
  TSESTree.StaticBlock,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: ClassStaticBlockScope['upper'],
    block: ClassStaticBlockScope['block'],
  ) {
    super(scopeManager, ScopeType.classStaticBlock, upperScope, block, false);
  }
}

export { ClassStaticBlockScope };
