import type { TSESTree } from '@typescript-eslint/types';

import type { ScopeManager } from '../ScopeManager';
import type { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';

class ClassScope extends ScopeBase<
  ScopeType.class,
  TSESTree.ClassDeclaration | TSESTree.ClassExpression,
  Scope
> {
  constructor(
    scopeManager: ScopeManager,
    upperScope: ClassScope['upper'],
    block: ClassScope['block'],
  ) {
    super(scopeManager, ScopeType.class, upperScope, block, false);
  }
}

export { ClassScope };
