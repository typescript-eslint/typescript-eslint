import { TSESTree, TSESLintScope } from '@typescript-eslint/experimental-utils';
import {
  EmptyFunctionScope,
  EnumScope,
  InterfaceScope,
  TypeAliasScope,
} from './scopes';

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

  /** @internal */
  __nestInterfaceScope(
    node: TSESTree.TSInterfaceDeclaration,
  ): TSESLintScope.Scope {
    return this.__nestScope(
      new InterfaceScope(this, this.__currentScope, node),
    );
  }

  /** @internal */
  __nestTypeAliasScope(
    node: TSESTree.TSTypeAliasDeclaration,
  ): TSESLintScope.Scope {
    return this.__nestScope(
      new TypeAliasScope(this, this.__currentScope, node),
    );
  }

  // TODO: override __nest**Scope methods with new scope classes
}
