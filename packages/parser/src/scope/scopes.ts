import * as esScope from 'eslint-scope/lib/scope';
import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import { ScopeManager } from './scope-manager';
import { Reference } from 'eslint-scope';
import { Definition } from 'eslint-scope/lib/definition';
import Variable from 'eslint-scope/lib/variable';

export class Scope extends esScope.Scope {
  setTypes: Map<string, Variable> = new Map();
  types: Variable[] = [];

  /** @internal */
  __defineType(node: TSESTree.Node, def: Definition) {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      this.__defineGeneric(node.name, this.setTypes, this.types, node, def);
    }
  }

  /** @internal */
  __resolve(ref: Reference): boolean {
    return super.__resolve(ref);
  }
}

/** The scope class for enum. */
export class EnumScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.TSEnumDeclaration | null
  ) {
    super(scopeManager, 'enum', upperScope, block, false);
  }
}

/** The scope class for empty functions. */
export class EmptyFunctionScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.TSDeclareFunction | null
  ) {
    super(scopeManager, 'empty-function', upperScope, block, false);
  }
}

export class InterfaceScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.TSInterfaceDeclaration | null
  ) {
    super(scopeManager, 'interface', upperScope, block, false);
  }
}

export class TypeAliasScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.TSTypeAliasDeclaration | null
  ) {
    super(scopeManager, 'type-alias', upperScope, block, false);
  }
}

/// eslint scopes

export class GlobalScope extends esScope.GlobalScope {
  setTypes: Map<string, Variable> = new Map();
  types: Variable[] = [];

  /** @internal */
  __defineType(node: TSESTree.Node, def: Definition) {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      this.__defineGeneric(node.name, this.setTypes, this.types, node, def);
    }
  }

  __define(node: TSESTree.Identifier, definition: Definition) {
    super.__define(node, definition);

    // Set `variable.eslintUsed` to tell ESLint that the variable is exported.
    const variable = this.set.get(node.name);
    if (variable) {
      variable.eslintUsed = true;
    }
  }
}

export class FunctionExpressionNameScope extends esScope.FunctionExpressionNameScope {
  setTypes: Map<string, Variable> = new Map();
  types: Variable[] = [];

  /** @internal */
  __defineType(node: TSESTree.Node, def: Definition) {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      this.__defineGeneric(node.name, this.setTypes, this.types, node, def);
    }
  }
}

export class WithScope extends esScope.WithScope {
  setTypes: Map<string, Variable> = new Map();
  types: Variable[] = [];

  /** @internal */
  __defineType(node: TSESTree.Node, def: Definition) {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      this.__defineGeneric(node.name, this.setTypes, this.types, node, def);
    }
  }
}

export class FunctionScope extends esScope.FunctionScope {
  setTypes: Map<string, Variable> = new Map();
  types: Variable[] = [];

  /** @internal */
  __defineType(node: TSESTree.Node, def: Definition) {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      this.__defineGeneric(node.name, this.setTypes, this.types, node, def);
    }
  }
}

// eslint simple scopes

export class ModuleScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null
  ) {
    super(scopeManager, 'module', upperScope, block, false);
  }
}

export class CatchScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null
  ) {
    super(scopeManager, 'catch', upperScope, block, false);
  }
}

export class BlockScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null
  ) {
    super(scopeManager, 'block', upperScope, block, false);
  }
}

export class SwitchScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null
  ) {
    super(scopeManager, 'switch', upperScope, block, false);
  }
}

export class ForScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null
  ) {
    super(scopeManager, 'for', upperScope, block, false);
  }
}

export class ClassScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null
  ) {
    super(scopeManager, 'class', upperScope, block, false);
  }
}
