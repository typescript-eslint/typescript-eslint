/* eslint-disable @typescript-eslint/no-namespace */

import * as scopeManager from '@typescript-eslint/scope-manager';

namespace Scope {
  export type ScopeManager = scopeManager.ScopeManager;
  export type Reference = scopeManager.Reference;
  export type Variable =
    | scopeManager.Variable
    | scopeManager.ESLintScopeVariable;
  export type Scope = scopeManager.Scope;
  export const ScopeType = scopeManager.ScopeType;
  // TODO - in the next major, clean this up with a breaking change
  export type DefinitionType = scopeManager.Definition;
  export type Definition = scopeManager.Definition;
  export const DefinitionType = scopeManager.DefinitionType;

  export namespace Definitions {
    export type CatchClauseDefinition = scopeManager.CatchClauseDefinition;
    export type ClassNameDefinition = scopeManager.ClassNameDefinition;
    export type FunctionNameDefinition = scopeManager.FunctionNameDefinition;
    export type ImplicitGlobalVariableDefinition =
      scopeManager.ImplicitGlobalVariableDefinition;
    export type ImportBindingDefinition = scopeManager.ImportBindingDefinition;
    export type ParameterDefinition = scopeManager.ParameterDefinition;
    export type TSEnumMemberDefinition = scopeManager.TSEnumMemberDefinition;
    export type TSEnumNameDefinition = scopeManager.TSEnumNameDefinition;
    export type TSModuleNameDefinition = scopeManager.TSModuleNameDefinition;
    export type TypeDefinition = scopeManager.TypeDefinition;
    export type VariableDefinition = scopeManager.VariableDefinition;
  }
  export namespace Scopes {
    export type BlockScope = scopeManager.BlockScope;
    export type CatchScope = scopeManager.CatchScope;
    export type ClassScope = scopeManager.ClassScope;
    export type ConditionalTypeScope = scopeManager.ConditionalTypeScope;
    export type ForScope = scopeManager.ForScope;
    export type FunctionExpressionNameScope =
      scopeManager.FunctionExpressionNameScope;
    export type FunctionScope = scopeManager.FunctionScope;
    export type FunctionTypeScope = scopeManager.FunctionTypeScope;
    export type GlobalScope = scopeManager.GlobalScope;
    export type MappedTypeScope = scopeManager.MappedTypeScope;
    export type ModuleScope = scopeManager.ModuleScope;
    export type SwitchScope = scopeManager.SwitchScope;
    export type TSEnumScope = scopeManager.TSEnumScope;
    export type TSModuleScope = scopeManager.TSModuleScope;
    export type TypeScope = scopeManager.TypeScope;
    export type WithScope = scopeManager.WithScope;
  }
}

export { Scope };
