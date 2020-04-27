/* eslint-disable @typescript-eslint/no-explicit-any */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import {
  Scope as ESLintScope,
  GlobalScope as ESLintGlobalScope,
  ModuleScope as ESLintModuleScope,
  FunctionExpressionNameScope as ESLintFunctionExpressionNameScope,
  CatchScope as ESLintCatchScope,
  WithScope as ESLintWithScope,
  BlockScope as ESLintBlockScope,
  SwitchScope as ESLintSwitchScope,
  FunctionScope as ESLintFunctionScope,
  ForScope as ESLintForScope,
  ClassScope as ESLintClassScope,
} from 'eslint-scope/lib/scope';
import { Definition } from './Definition';
import { Reference, ReferenceFlag } from './Reference';
import { ScopeManager } from './ScopeManager';
import { Variable } from './Variable';

type ScopeType =
  | 'block'
  | 'catch'
  | 'class'
  | 'for'
  | 'function'
  | 'function-expression-name'
  | 'global'
  | 'module'
  | 'switch'
  | 'with'
  | 'TDZ';

interface Scope {
  /**
   * A reference to the scope-defining syntax node.
   */
  block: TSESTree.Node;
  /**
   * List of nested {@link Scope}s.
   */
  childScopes: this[];
  /**
   * Whether this is a scope that contains an 'eval()' invocation.
   */
  directCallToEvalScope: boolean;
  /**
   * Generally, through the lexical scoping of JS you can always know
   * which variable an identifier in the source code refers to. There are
   * a few exceptions to this rule. With 'global' and 'with' scopes you
   * can only decide at runtime which variable a reference refers to.
   * Moreover, if 'eval()' is used in a scope, it might introduce new
   * bindings in this or its parent scopes.
   * All those scopes are considered 'dynamic'.
   */
  dynamic: boolean;
  /**
   * Whether this scope is created by a FunctionExpression.
   */
  functionExpressionScope: boolean;
  /**
   * Whether 'use strict' is in effect in this scope.
   */
  isStrict: boolean;
  /**
   * Any variable {@link Reference|reference} found in this scope. This
   * includes occurrences of local variables as well as variables from
   * parent scopes (including the global scope). For local variables
   * this also includes defining occurrences (like in a 'var' statement).
   * In a 'function' scope this does not include the occurrences of the
   * formal parameter in the parameter list.
   */
  references: Reference[];
  /**
   * The scoped {@link Variable}s of this scope, as `{ Variable.name: Variable }`.
   */
  set: Map<string, Variable>;
  /**
   * The tainted variables of this scope, as `{ Variable.name: boolean }`.
   */
  taints: Map<string, boolean>;
  thisFound?: boolean;
  /**
   * The {@link Reference|references} that are not resolved with this scope.
   */
  through: Reference[];
  type: ScopeType;
  /**
   * Reference to the parent {@link Scope}.
   */
  upper: this | null;
  /**
   * The scoped {@link Variable}s of this scope. In the case of a
   * 'function' scope this includes the automatic argument *arguments* as
   * its first element, as well as all further formal arguments.
   */
  variables: Variable[];
  /**
   * For 'global' and 'function' scopes, this is a self-reference. For
   * other scope types this is the *variableScope* value of the
   * parent scope.
   */
  variableScope: this;
  __left: Reference[];
  __declaredVariables: WeakMap<TSESTree.Node, Variable[]>;

  __shouldStaticallyClose<TScopemanager = ScopeManager>(
    scopeManager: TScopemanager,
  ): boolean;
  __shouldStaticallyCloseForGlobal(ref: any): boolean;
  __staticCloseRef(ref: any): void;
  __dynamicCloseRef(ref: any): void;
  __globalCloseRef(ref: any): void;
  __close<TScopemanager = ScopeManager>(scopeManager: TScopemanager): this;
  /**
   * To override by function scopes.
   * References in default parameters isn't resolved to variables which are in their function body.
   */
  __isValidResolution(ref: any, variable: any): boolean;
  __resolve(ref: Reference): boolean;
  __delegateToUpperScope(ref: any): void;
  __addDeclaredVariablesOfNode(variable: any, node: TSESTree.Node): void;
  __defineGeneric(
    name: string,
    set: Map<string, Variable>,
    variables: Variable[],
    node: TSESTree.Identifier,
    def: Definition,
  ): void;

  __define(node: TSESTree.Node, def: Definition): void;

  __referencing(
    node: TSESTree.Node,
    assign?: ReferenceFlag,
    writeExpr?: TSESTree.Node,
    maybeImplicitGlobal?: any,
    partial?: any,
    init?: any,
  ): void;

  __detectEval(): void;
  __detectThis(): void;
  __isClosed(): boolean;

  /**
   * returns resolved {@link Reference}
   */
  resolve(ident: TSESTree.Node): Reference;

  /**
   * returns this scope is static
   */
  isStatic(): boolean;

  /**
   * returns this scope has materialized arguments
   */
  isArgumentsMaterialized(): boolean;

  /**
   * returns this scope has materialized `this` reference
   */
  isThisMaterialized(): boolean;

  isUsedName(name: any): boolean;
}
interface ScopeConstructor {
  new (
    scopeManager: ScopeManager,
    type: ScopeType,
    upperScope: Scope | null,
    block: TSESTree.Node | null,
    isMethodDefinition: boolean,
  ): Scope;
}
const Scope = ESLintScope as ScopeConstructor;

interface GlobalScope extends Scope {
  __defineImplicit(node: TSESTree.Node, def: Definition): void;
}
const GlobalScope = ESLintGlobalScope as ScopeConstructor & {
  new (scopeManager: ScopeManager, block: TSESTree.Node | null): GlobalScope;
};

interface ModuleScope extends Scope {
  type: 'module';
}
const ModuleScope = ESLintModuleScope as ScopeConstructor & {
  new (
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ): ModuleScope;
};

interface FunctionExpressionNameScope extends Scope {
  type: 'function-expression-name';
  functionExpressionScope: boolean;
}
const FunctionExpressionNameScope = ESLintFunctionExpressionNameScope as ScopeConstructor & {
  new (
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ): FunctionExpressionNameScope;
};

interface CatchScope extends Scope {
  type: 'catch';
}
const CatchScope = ESLintCatchScope as ScopeConstructor & {
  new (
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ): CatchScope;
};

interface WithScope extends Scope {
  type: 'with';
}
const WithScope = ESLintWithScope as ScopeConstructor & {
  new (
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ): WithScope;
};

interface BlockScope extends Scope {
  type: 'block';
}
const BlockScope = ESLintBlockScope as ScopeConstructor & {
  new (
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ): BlockScope;
};

interface SwitchScope extends Scope {
  type: 'switch';
}
const SwitchScope = ESLintSwitchScope as ScopeConstructor & {
  new (
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ): SwitchScope;
};

interface FunctionScope extends Scope {
  __defineArguments(): void;
}
const FunctionScope = ESLintFunctionScope as ScopeConstructor & {
  new (
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
    isMethodDefinition: boolean,
  ): FunctionScope;
};

interface ForScope extends Scope {
  type: 'for';
}
const ForScope = ESLintForScope as ScopeConstructor & {
  new (
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ): ForScope;
};

interface ClassScope extends Scope {
  type: 'class';
}
const ClassScope = ESLintClassScope as ScopeConstructor & {
  new (
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ): ClassScope;
};

export {
  BlockScope,
  CatchScope,
  ClassScope,
  ForScope,
  FunctionExpressionNameScope,
  FunctionScope,
  GlobalScope,
  ModuleScope,
  Scope,
  ScopeType,
  SwitchScope,
  WithScope,
};
