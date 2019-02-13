import {
  TSESTree,
  TSESLintScope,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { ScopeManager } from './scope-manager';

export class Scope extends TSESLintScope.Scope {
  /** @internal */
  __defineType(node: TSESTree.Node, def: TSESLintScope.Definition): void {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      this.__defineGeneric(node.name, this.set, this.variables, node, def);
    }
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
  /** @internal */
  __defineType(node: TSESTree.Node, def: TSESLintScope.Definition): void {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      this.__defineGeneric(node.name, this.set, this.variables, node, def);

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
  /** @internal */
  __defineType(node: TSESTree.Node, def: TSESLintScope.Definition): void {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      this.__defineGeneric(node.name, this.set, this.variables, node, def);
    }
  }
}

export class WithScope extends TSESLintScope.WithScope implements Scope {
  /** @internal */
  __defineType(node: TSESTree.Node, def: TSESLintScope.Definition): void {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      this.__defineGeneric(node.name, this.set, this.variables, node, def);
    }
  }
}

export class FunctionScope extends TSESLintScope.FunctionScope
  implements Scope {
  /** @internal */
  __defineType(node: TSESTree.Node, def: TSESLintScope.Definition): void {
    if (node && node.type === AST_NODE_TYPES.Identifier) {
      this.__defineGeneric(node.name, this.set, this.variables, node, def);
    }
  }
}

// eslint simple scopes

export class ModuleScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'module', upperScope, block, false);
  }
}

export class CatchScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'catch', upperScope, block, false);
  }
}

export class BlockScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'block', upperScope, block, false);
  }
}

export class SwitchScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'switch', upperScope, block, false);
  }
}

export class ForScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'for', upperScope, block, false);
  }
}

export class ClassScope extends Scope {
  constructor(
    scopeManager: ScopeManager,
    upperScope: Scope,
    block: TSESTree.Node | null,
  ) {
    super(scopeManager, 'class', upperScope, block, false);
  }
}
