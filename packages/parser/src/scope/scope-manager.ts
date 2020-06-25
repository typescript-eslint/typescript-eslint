import { TSESLintScope } from '@typescript-eslint/experimental-utils';
import { TSESTree } from '@typescript-eslint/types';
import { EmptyFunctionScope, EnumScope } from './scopes';

/**
 * based on eslint-scope
 */
export class ScopeManager extends TSESLintScope.ScopeManager {
  scopes!: TSESLintScope.Scope[];
  globalScope!: TSESLintScope.Scope;

  constructor(options: TSESLintScope.ScopeManagerOptions) {
    super(options);
  }

  /** @internal */
  __nestEnumScope(node: TSESTree.TSEnumDeclaration): TSESLintScope.Scope {
    return this.__nestScope(new EnumScope(this, this.__currentScope, node));
  }

  /** @internal */
  __nestEmptyFunctionScope(
    node: TSESTree.TSDeclareFunction,
  ): TSESLintScope.Scope {
    return this.__nestScope(
      new EmptyFunctionScope(this, this.__currentScope, node),
    );
  }
}
