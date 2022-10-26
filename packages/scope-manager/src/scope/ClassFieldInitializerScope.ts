import type { TSESTree } from '@typescript-eslint/types';

import type { ScopeManager } from '../ScopeManager';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';

class ClassFieldInitializerScope extends ScopeBase<
  ScopeType.classFieldInitializer,
  // the value expression itself is the block
  TSESTree.Expression,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: ClassFieldInitializerScope['upper'],
    block: ClassFieldInitializerScope['block'],
  ) {
    super(
      scopeManager,
      ScopeType.classFieldInitializer,
      upperScope,
      block,
      false,
    );
  }
}

export { ClassFieldInitializerScope };
