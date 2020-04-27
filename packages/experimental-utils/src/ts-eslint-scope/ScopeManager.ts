import { TSESTree } from '@typescript-eslint/typescript-estree';
import ESLintScopeManager from 'eslint-scope/lib/scope-manager';
import { Scope, GlobalScope } from './Scope';
import { Variable } from './Variable';

interface ScopeManagerOptions {
  directive?: boolean;
  optimistic?: boolean;
  ignoreEval?: boolean;
  nodejsScope?: boolean;
  sourceType?: 'module' | 'script';
  impliedStrict?: boolean;
  ecmaVersion?: number;
}

interface ScopeManager {
  __options: ScopeManagerOptions;
  __currentScope: Scope;
  __nodeToScope: WeakMap<TSESTree.Node, Scope[]>;
  __declaredVariables: WeakMap<TSESTree.Node, Variable[]>;

  scopes: Scope[];
  globalScope: GlobalScope;

  __useDirective(): boolean;
  __isOptimistic(): boolean;
  __ignoreEval(): boolean;
  __isNodejsScope(): boolean;
  isModule(): boolean;
  isImpliedStrict(): boolean;
  isStrictModeSupported(): boolean;

  /**
   * Returns appropriate scope for this node.
   */
  __get(node: TSESTree.Node): Scope[] | undefined;
  /**
   * Get variables that are declared by the node.
   *
   * "are declared by the node" means the node is same as `Variable.defs[].node` or `Variable.defs[].parent`.
   * If the node declares nothing, this method returns an empty array.
   */
  getDeclaredVariables(node: TSESTree.Node): Variable[];
  /**
   * acquire scope from node.
   */
  acquire(node: TSESTree.Node, inner?: boolean): Scope | null;
  acquireAll(node: TSESTree.Node): Scope | null;
  release(node: TSESTree.Node, inner?: boolean): Scope | null;
  attach(): void;
  detach(): void;

  __nestScope<T extends Scope>(scope: T): T;
  __nestGlobalScope(node: TSESTree.Node): Scope;
  __nestBlockScope(node: TSESTree.Node): Scope;
  __nestFunctionScope(node: TSESTree.Node, isMethodDefinition: boolean): Scope;
  __nestForScope(node: TSESTree.Node): Scope;
  __nestCatchScope(node: TSESTree.Node): Scope;
  __nestWithScope(node: TSESTree.Node): Scope;
  __nestClassScope(node: TSESTree.Node): Scope;
  __nestSwitchScope(node: TSESTree.Node): Scope;
  __nestModuleScope(node: TSESTree.Node): Scope;
  __nestFunctionExpressionNameScope(node: TSESTree.Node): Scope;

  __isES6(): boolean;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ScopeManagerStatic {}
interface ScopeManagerConstructor {
  new (options: ScopeManagerOptions): ScopeManager;
}

const ScopeManager = ESLintScopeManager as ScopeManagerConstructor &
  ScopeManagerStatic;

export { ScopeManager, ScopeManagerOptions };
