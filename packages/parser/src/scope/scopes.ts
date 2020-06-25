import { TSESLintScope } from '@typescript-eslint/experimental-utils';
import { TSESTree } from '@typescript-eslint/types';
import { ScopeManager } from './scope-manager';

/** The scope class for enum. */
export class EnumScope extends TSESLintScope.Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: TSESLintScope.Scope,
    block: TSESTree.TSEnumDeclaration | null,
  ) {
    super(scopeManager, 'enum', upperScope, block, false);
  }
}

/** The scope class for empty functions. */
export class EmptyFunctionScope extends TSESLintScope.Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: TSESLintScope.Scope,
    block: TSESTree.TSDeclareFunction | null,
  ) {
    super(scopeManager, 'empty-function', upperScope, block, false);
  }
}
