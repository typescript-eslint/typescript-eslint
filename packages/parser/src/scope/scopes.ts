import { TSESTree, TSESLintScope } from '@typescript-eslint/experimental-utils';
import { ScopeManager } from './scope-manager';

export class Scope extends TSESLintScope.Scope {
  /** @internal */
  __resolve(ref: TSESLintScope.Reference): boolean {
    const name = ref.identifier.name;

    if (!this.set.has(name)) {
      return false;
    }
    const variable = this.set.get(name)!;

    if (!this.__isValidResolution(ref, variable)) {
      return false;
    }
    variable.references.push(ref);
    variable.stack =
      variable.stack && ref.from.variableScope === this.variableScope;
    if (ref.tainted) {
      variable.tainted = true;
      this.taints.set(variable.name, true);
    }
    ref.resolved = variable;

    return true;
  }
}

/** The scope class for enum. */
export class EnumScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: TSESLintScope.Scope,
    block: TSESTree.TSEnumDeclaration | null,
  ) {
    super(scopeManager, 'enum', upperScope, block, false);
  }
}

/** The scope class for empty functions. */
export class EmptyFunctionScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: TSESLintScope.Scope,
    block: TSESTree.TSDeclareFunction | null,
  ) {
    super(scopeManager, 'empty-function', upperScope, block, false);
  }
}

export class InterfaceScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: TSESLintScope.Scope,
    block: TSESTree.TSInterfaceDeclaration | null,
  ) {
    super(scopeManager, 'interface', upperScope, block, false);
  }
}

export class TypeAliasScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: TSESLintScope.Scope,
    block: TSESTree.TSTypeAliasDeclaration | null,
  ) {
    super(scopeManager, 'type-alias', upperScope, block, false);
  }
}

// TODO: extend all Scopes
