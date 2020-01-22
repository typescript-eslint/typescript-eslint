import {
  TSESTree,
  TSESLintScope,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { ScopeManager } from './scope-manager';

function defineType(
  this: Scope,
  node: TSESTree.Node,
  def: TSESLintScope.Definition,
): void {
  if (node && node.type === AST_NODE_TYPES.Identifier) {
    this.__defineGeneric(node.name, this.setTypes, this.variables, node, def);
  }
}

function resolveType(this: Scope, ref: TSESLintScope.Reference): boolean {
  const name = ref.identifier.name;

  if (!this.setTypes.has(name)) {
    return false;
  }
  const variable = this.setTypes.get(name);

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

function resolveTypeLike(this: Scope, ref: TSESLintScope.Reference): boolean {
  const name = ref.identifier.name;

  if (!this.set.has(name)) {
    return false;
  }
  const variable = this.set.get(name);
  if (!this.__isValidResolution(ref, variable)) {
    return false;
  }

  if (
    !variable.defs.some(
      d =>
        d.type === 'ClassName' ||
        d.type === 'EnumName' ||
        d.type === 'ImportBinding',
    )
  ) {
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

export class Scope extends TSESLintScope.Scope {
  setTypes: Map<string, TSESLintScope.Variable> = new Map();

  /** @internal */
  __defineType = defineType;

  /** @internal */
  __shouldStaticallyCloseForGlobal(this: Scope, ref: TSESLintScope.Reference) {
    const name = ref.identifier.name;
    if (this.setTypes.has(name)) {
      return false;
    }

    return super.__shouldStaticallyCloseForGlobal(ref);
  }

  /** @internal */
  __resolve(ref: TSESLintScope.Reference): boolean {
    if (ref.typeMode) {
      return resolveType.call(this, ref) || resolveTypeLike.call(this, ref);
    }
    return super.__resolve(ref);
  }
}

/** The scope class for enum. */
export class EnumScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.TSEnumDeclaration | null,
  ) {
    super(scopeManager, 'enum', upperScope, block, false);
  }
}

/** The scope class for empty functions. */
export class EmptyFunctionScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.TSDeclareFunction | null,
  ) {
    super(scopeManager, 'empty-function', upperScope, block, false);
  }
}

export class InterfaceScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.TSInterfaceDeclaration | null,
  ) {
    super(scopeManager, 'interface', upperScope, block, false);
  }
}

export class TypeAliasScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.TSTypeAliasDeclaration | null,
  ) {
    super(scopeManager, 'type-alias', upperScope, block, false);
  }
}

/// eslint scopes

export class GlobalScope extends TSESLintScope.GlobalScope implements Scope {
  setTypes: Map<string, TSESLintScope.Variable> = new Map();

  /** @internal */
  __shouldStaticallyCloseForGlobal(this: Scope, ref: TSESLintScope.Reference) {
    const name = ref.identifier.name;
    if (this.setTypes.has(name)) {
      return false;
    }

    return super.__shouldStaticallyCloseForGlobal(ref);
  }

  /** @internal */
  __resolve(ref: TSESLintScope.Reference): boolean {
    if (ref.typeMode) {
      return resolveType.call(this, ref) || resolveTypeLike.call(this, ref);
    }
    return super.__resolve(ref);
  }

  /** @internal */
  __defineType(node: TSESTree.Node, def: TSESLintScope.Definition): void {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      this.__defineGeneric(node.name, this.setTypes, this.variables, node, def);

      // Set `variable.eslintUsed` to tell ESLint that the variable is exported.
      const variable = this.set.get(node.name);
      if (variable) {
        variable.eslintUsed = true;
      }
    }
  }

  /** @internal */
  __define(
    node: TSESTree.Identifier,
    definition: TSESLintScope.Definition,
  ): void {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      super.__define(node, definition);

      // Set `variable.eslintUsed` to tell ESLint that the variable is exported.
      const variable = this.set.get(node.name);
      if (variable) {
        variable.eslintUsed = true;
      }
    }
  }
}

export class FunctionExpressionNameScope
  extends TSESLintScope.FunctionExpressionNameScope
  implements Scope {
  setTypes: Map<string, TSESLintScope.Variable> = new Map();

  /** @internal */
  __defineType = defineType;

  /** @internal */
  __shouldStaticallyCloseForGlobal(this: Scope, ref: TSESLintScope.Reference) {
    const name = ref.identifier.name;
    if (this.setTypes.has(name)) {
      return false;
    }

    return super.__shouldStaticallyCloseForGlobal(ref);
  }

  /** @internal */
  __resolve(ref: TSESLintScope.Reference): boolean {
    if (ref.typeMode) {
      return resolveType.call(this, ref) || resolveTypeLike.call(this, ref);
    }
    return super.__resolve(ref);
  }
}

export class WithScope extends TSESLintScope.WithScope implements Scope {
  setTypes: Map<string, TSESLintScope.Variable> = new Map();

  /** @internal */
  __defineType = defineType;

  /** @internal */
  __shouldStaticallyCloseForGlobal(this: Scope, ref: TSESLintScope.Reference) {
    const name = ref.identifier.name;
    if (this.setTypes.has(name)) {
      return false;
    }

    return super.__shouldStaticallyCloseForGlobal(ref);
  }

  /** @internal */
  __resolve(ref: TSESLintScope.Reference): boolean {
    if (ref.typeMode) {
      return resolveType.call(this, ref) || resolveTypeLike.call(this, ref);
    }
    return super.__resolve(ref);
  }
}

export class FunctionScope extends TSESLintScope.FunctionScope
  implements Scope {
  setTypes: Map<string, TSESLintScope.Variable> = new Map();

  /** @internal */
  __defineType = defineType;

  /** @internal */
  __shouldStaticallyCloseForGlobal(this: Scope, ref: TSESLintScope.Reference) {
    const name = ref.identifier.name;
    if (this.setTypes.has(name)) {
      return false;
    }

    return super.__shouldStaticallyCloseForGlobal(ref);
  }

  /** @internal */
  __resolve(ref: TSESLintScope.Reference): boolean {
    if (ref.typeMode) {
      return resolveType.call(this, ref) || resolveTypeLike.call(this, ref);
    } else {
      return super.__resolve(ref);
    }
  }
}

// eslint simple scopes

export class ModuleScope extends Scope implements TSESLintScope.ModuleScope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'module', upperScope, block, false);
  }
}

export class CatchScope extends Scope implements TSESLintScope.CatchScope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'catch', upperScope, block, false);
  }
}

export class BlockScope extends Scope implements TSESLintScope.BlockScope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'block', upperScope, block, false);
  }
}

export class SwitchScope extends Scope implements TSESLintScope.SwitchScope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'switch', upperScope, block, false);
  }
}

export class ForScope extends Scope implements TSESLintScope.ForScope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'for', upperScope, block, false);
  }
}

export class ClassScope extends Scope implements TSESLintScope.ClassScope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'class', upperScope, block, false);
  }
}
