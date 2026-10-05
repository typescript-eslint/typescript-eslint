import type { TSESTree } from '@typescript-eslint/types';

import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type { Definition } from '../definition';
import type { Reference } from '../referencer/Reference';
import type { ScopeManager } from '../ScopeManager';
import type {
  ImplicitLibVariableMap,
  ImplicitLibVariableOptions,
  Variable,
} from '../variable';
import type { Scope } from './Scope';

import { assert } from '../assert';
import { ImplicitGlobalVariableDefinition } from '../definition/ImplicitGlobalVariableDefinition';
import { ImplicitLibVariable } from '../variable';
import { ScopeBase } from './ScopeBase';
import { ScopeType } from './ScopeType';

export class GlobalScope extends ScopeBase<
  ScopeType.global,
  TSESTree.Program,
  /**
   * The global scope has no parent.
   */
  null
> {
  readonly #implicitLibVariables: ImplicitLibVariableMap;

  // note this is accessed in used in the legacy eslint-scope tests, so it can't be true private
  private readonly implicit: {
    readonly set: Map<string, Variable>;
    variables: Variable[];
    /**
     * List of {@link Reference}s that are left to be resolved (i.e. which
     * need to be linked to the variable they refer to).
     */
    leftToBeResolved: Reference[];
  };

  constructor(
    scopeManager: ScopeManager,
    block: GlobalScope['block'],
    implicitLibVariables: ImplicitLibVariableMap = new Map(),
  ) {
    super(scopeManager, ScopeType.global, null, block, false);
    this.#implicitLibVariables = implicitLibVariables;
    this.implicit = {
      leftToBeResolved: [],
      set: new Map<string, Variable>(),
      variables: [],
    };
  }

  public addVariables(names: string[]): void {
    for (const name of names) {
      this.defineVariable(name, this.set, this.variables, null, null);

      this.implicit.set.delete(name);
    }

    const nameSet = new Set(names);
    for (const reference of this.through) {
      if (nameSet.has(reference.identifier.name)) {
        const variable = this.set.get(reference.identifier.name);
        assert(
          variable,
          `Expected variable with name "${reference.identifier.name}" to be specified.`,
        );

        reference.resolved = variable;
        variable.references.push(reference);
      }
    }

    this.through = this.through.filter(
      reference => !nameSet.has(reference.identifier.name),
    );
    this.implicit.variables = this.implicit.variables.filter(
      variable => !nameSet.has(variable.name),
    );
    this.implicit.leftToBeResolved = this.implicit.leftToBeResolved.filter(
      reference => !nameSet.has(reference.identifier.name),
    );
  }

  public override close(scopeManager: ScopeManager): Scope | null {
    assert(this.leftToResolve);

    const names = new Set<string>();
    for (const ref of this.leftToResolve) {
      names.add(ref.identifier.name);
    }
    for (const scope of scopeManager.scopes) {
      for (const variable of scope.variables) {
        names.add(variable.name);
      }
    }

    for (const name of names) {
      const options = this.#implicitLibVariables.get(name);
      if (options && !this.set.has(name)) {
        this.defineImplicitVariable(name, options);
      }
    }

    for (const ref of this.leftToResolve) {
      if (ref.maybeImplicitGlobal && !this.set.has(ref.identifier.name)) {
        // create an implicit global variable from assignment expression
        const info = ref.maybeImplicitGlobal;
        const node = info.pattern;
        if (node.type === AST_NODE_TYPES.Identifier) {
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
    super.close(scopeManager);
    this.implicit.leftToBeResolved = [...this.through];

    return null;
  }

  public override defineIdentifier(
    node: TSESTree.Identifier,
    def: Definition,
  ): void {
    const options = this.#implicitLibVariables.get(node.name);
    if (!options || this.set.has(node.name)) {
      super.defineIdentifier(node, def);
      return;
    }

    this.defineVariable(
      new ImplicitLibVariable(this, node.name, options),
      this.set,
      this.variables,
      node,
      def,
    );
  }

  public defineImplicitVariable(
    name: string,
    options: ImplicitLibVariableOptions,
  ): void {
    this.defineVariable(
      new ImplicitLibVariable(this, name, options),
      this.set,
      this.variables,
      null,
      null,
    );
  }
}
