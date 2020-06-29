import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/types';
import { Scope } from './Scope';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';
import { assert } from '../assert';
import { ImplicitGlobalVariableDefinition } from '../definition/ImplicitGlobalVariableDefinition';
import { Reference } from '../referencer/Reference';
import { ScopeManager } from '../ScopeManager';
import {
  Variable,
  ImplicitLibVariable,
  ImplicitLibVariableOptions,
} from '../variable';

class GlobalScope extends ScopeBase<
  ScopeType.global,
  TSESTree.Program,
  /**
   * The global scope has no parent.
   */
  null
> {
  // note this is accessed in used in the legacy eslint-scope tests, so it can't be true private
  private readonly implicit: {
    readonly set: Map<string, Variable>;
    readonly variables: Variable[];
    /**
     * List of {@link Reference}s that are left to be resolved (i.e. which
     * need to be linked to the variable they refer to).
     */
    leftToBeResolved: Reference[];
  };

  constructor(scopeManager: ScopeManager, block: GlobalScope['block']) {
    super(scopeManager, ScopeType.global, null, block, false);
    this.implicit = {
      set: new Map(),
      variables: [],
      leftToBeResolved: [],
    };
  }

  public defineImplicitVariable(options: ImplicitLibVariableOptions): void {
    this.defineVariable(
      new ImplicitLibVariable(this, options),
      this.set,
      this.variables,
      null,
      null,
    );
  }

  public close(scopeManager: ScopeManager): Scope | null {
    assert(this.leftToResolve);

    for (const ref of this.leftToResolve) {
      if (ref.maybeImplicitGlobal && !this.set.has(ref.identifier.name)) {
        // create an implicit global variable from assignment expression
        const info = ref.maybeImplicitGlobal;
        const node = info.pattern;
        if (node && node.type === AST_NODE_TYPES.Identifier) {
          this.defineVariable(
            node.name,
            this.implicit.set,
            this.implicit.variables,
            node,
            new ImplicitGlobalVariableDefinition(info.pattern, info.node),
          );
        }
      }
    }

    this.implicit.leftToBeResolved = this.leftToResolve;
    return super.close(scopeManager);
  }
}

export { GlobalScope };
