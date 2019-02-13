import { TSESTree } from '@typescript-eslint/typescript-estree';

import EslintScopeManager, {
  ScopeManagerOptions
} from 'eslint-scope/lib/scope-manager';
import {
  Scope,
  EmptyFunctionScope,
  EnumScope,
  InterfaceScope,
  TypeAliasScope,
  GlobalScope,
  ModuleScope,
  FunctionExpressionNameScope,
  SwitchScope,
  CatchScope,
  WithScope,
  BlockScope,
  ForScope,
  FunctionScope,
  ClassScope
} from './scopes';

/**
 * based on eslint-scope
 */
export class ScopeManager extends EslintScopeManager<Scope> {
  scopes!: Scope[];
  globalScope!: Scope;

  constructor(options: ScopeManagerOptions) {
    super(options);
  }

  /** @internal */
  __nestEnumScope(node: TSESTree.TSEnumDeclaration): Scope {
    return this.__nestScope(new EnumScope(this, this.__currentScope, node));
  }

  /** @internal */
  __nestEmptyFunctionScope(node: TSESTree.TSDeclareFunction): Scope {
    return this.__nestScope(
      new EmptyFunctionScope(this, this.__currentScope, node)
    );
  }

  /** @internal */
  __nestInterfaceScope(node: TSESTree.TSInterfaceDeclaration): Scope {
    return this.__nestScope(
      new InterfaceScope(this, this.__currentScope, node)
    );
  }

  /** @internal */
  __nestTypeAliasScope(node: TSESTree.TSTypeAliasDeclaration): Scope {
    return this.__nestScope(
      new TypeAliasScope(this, this.__currentScope, node)
    );
  }

  /// eslint scopes

  /** @internal */
  __nestGlobalScope(node: TSESTree.Node): Scope {
    return this.__nestScope(new GlobalScope(this, node));
  }

  /** @internal */
  __nestBlockScope(node: TSESTree.Node): Scope {
    return this.__nestScope(new BlockScope(this, this.__currentScope, node));
  }

  /** @internal */
  __nestFunctionScope(node: TSESTree.Node, isMethodDefinition: boolean): Scope {
    return this.__nestScope(
      new FunctionScope(this, this.__currentScope, node, isMethodDefinition)
    );
  }

  /** @internal */
  __nestForScope(node: TSESTree.Node): Scope {
    return this.__nestScope(new ForScope(this, this.__currentScope, node));
  }

  /** @internal */
  __nestCatchScope(node: TSESTree.Node): Scope {
    return this.__nestScope(new CatchScope(this, this.__currentScope, node));
  }

  /** @internal */
  __nestWithScope(node: TSESTree.Node): Scope {
    return this.__nestScope(new WithScope(this, this.__currentScope, node));
  }

  /** @internal */
  __nestClassScope(node: TSESTree.Node): Scope {
    return this.__nestScope(new ClassScope(this, this.__currentScope, node));
  }

  /** @internal */
  __nestSwitchScope(node: TSESTree.Node): Scope {
    return this.__nestScope(new SwitchScope(this, this.__currentScope, node));
  }

  /** @internal */
  __nestModuleScope(node: TSESTree.Node): Scope {
    return this.__nestScope(new ModuleScope(this, this.__currentScope, node));
  }

  /** @internal */
  __nestFunctionExpressionNameScope(node: TSESTree.Node): Scope {
    return this.__nestScope(
      new FunctionExpressionNameScope(this, this.__currentScope, node)
    );
  }
}
