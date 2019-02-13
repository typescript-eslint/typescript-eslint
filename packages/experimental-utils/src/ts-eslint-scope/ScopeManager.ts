import { TSESTree } from '@typescript-eslint/typescript-estree';
import ESLintScopeManager from 'eslint-scope/lib/scope-manager';
import { Scope } from './Scope';
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

interface ScopeManager<SC extends Scope = Scope> {
  __options: ScopeManagerOptions;
  __currentScope: SC;
  __nodeToScope: WeakMap<TSESTree.Node, SC[]>;
  __declaredVariables: WeakMap<TSESTree.Node, Variable[]>;

  scopes: SC[];
  globalScope: SC;

  __useDirective(): boolean;
  __isOptimistic(): boolean;
  __ignoreEval(): boolean;
  __isNodejsScope(): boolean;
  isModule(): boolean;
  isImpliedStrict(): boolean;
  isStrictModeSupported(): boolean;

  // Returns appropriate scope for this node.
  __get(node: TSESTree.Node): SC[] | undefined;
  getDeclaredVariables(node: TSESTree.Node): Variable[];
  acquire(node: TSESTree.Node, inner?: boolean): SC | null;
  acquireAll(node: TSESTree.Node): SC | null;
  release(node: TSESTree.Node, inner?: boolean): SC | null;
  attach(): void;
  detach(): void;

  __nestScope<T extends Scope>(scope: T): T;
  __nestGlobalScope(node: TSESTree.Node): SC;
  __nestBlockScope(node: TSESTree.Node): SC;
  __nestFunctionScope(node: TSESTree.Node, isMethodDefinition: boolean): SC;
  __nestForScope(node: TSESTree.Node): SC;
  __nestCatchScope(node: TSESTree.Node): SC;
  __nestWithScope(node: TSESTree.Node): SC;
  __nestClassScope(node: TSESTree.Node): SC;
  __nestSwitchScope(node: TSESTree.Node): SC;
  __nestModuleScope(node: TSESTree.Node): SC;
  __nestFunctionExpressionNameScope(node: TSESTree.Node): SC;

  __isES6(): boolean;
}
const ScopeManager = ESLintScopeManager as {
  new <SC extends Scope = Scope>(options: ScopeManagerOptions): ScopeManager<
    SC
  >;
};

export { ScopeManager, ScopeManagerOptions };
