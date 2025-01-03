import type { TSESTree } from '@typescript-eslint/types';

import { AST_NODE_TYPES } from '@typescript-eslint/types';

import type {
  CatchClauseDefinition,
  ClassNameDefinition,
  Definition,
  FunctionNameDefinition,
  ImplicitGlobalVariableDefinition,
  ImportBindingDefinition,
  ParameterDefinition,
  VariableDefinition,
} from '../../src/definition';
import type {
  BlockScope,
  CatchScope,
  ClassFieldInitializerScope,
  ClassScope,
  ForScope,
  FunctionExpressionNameScope,
  FunctionScope,
  GlobalScope,
  ModuleScope,
  Scope,
  SwitchScope,
  WithScope,
} from '../../src/scope';

import { DefinitionType } from '../../src/definition';
import { ScopeType } from '../../src/scope';

//////////////////
// EXPECT SCOPE //
//////////////////

export function expectToBeBlockScope(
  scope: Scope,
): asserts scope is BlockScope {
  expect(scope.type).toBe(ScopeType.block);
}
export function expectToBeCatchScope(
  scope: Scope,
): asserts scope is CatchScope {
  expect(scope.type).toBe(ScopeType.catch);
}
export function expectToBeClassFieldInitializerScope(
  scope: Scope,
): asserts scope is ClassFieldInitializerScope {
  expect(scope.type).toBe(ScopeType.classFieldInitializer);
}
export function expectToBeClassScope(
  scope: Scope,
): asserts scope is ClassScope {
  expect(scope.type).toBe(ScopeType.class);
}
export function expectToBeForScope(scope: Scope): asserts scope is ForScope {
  expect(scope.type).toBe(ScopeType.for);
}
export function expectToBeFunctionScope(
  scope: Scope,
): asserts scope is FunctionScope {
  expect(scope.type).toBe(ScopeType.function);
}
export function expectToBeFunctionExpressionNameScope(
  scope: Scope,
): asserts scope is FunctionExpressionNameScope {
  expect(scope.type).toBe(ScopeType.functionExpressionName);
}
export function expectToBeGlobalScope(
  scope: Scope,
): asserts scope is GlobalScope {
  expect(scope.type).toBe(ScopeType.global);
}
export function expectToBeModuleScope(
  scope: Scope,
): asserts scope is ModuleScope {
  expect(scope.type).toBe(ScopeType.module);
}
export function expectToBeSwitchScope(
  scope: Scope,
): asserts scope is SwitchScope {
  expect(scope.type).toBe(ScopeType.switch);
}
export function expectToBeWithScope(scope: Scope): asserts scope is WithScope {
  expect(scope.type).toBe(ScopeType.with);
}

///////////////////////
// EXPECT DEFINITION //
///////////////////////

export function expectToBeCatchClauseDefinition(
  def: Definition,
): asserts def is CatchClauseDefinition {
  expect(def.type).toBe(DefinitionType.CatchClause);
}
export function expectToBeClassNameDefinition(
  def: Definition,
): asserts def is ClassNameDefinition {
  expect(def.type).toBe(DefinitionType.ClassName);
}
export function expectToBeFunctionNameDefinition(
  def: Definition,
): asserts def is FunctionNameDefinition {
  expect(def.type).toBe(DefinitionType.FunctionName);
}
export function expectToBeImplicitGlobalVariableDefinition(
  def: Definition,
): asserts def is ImplicitGlobalVariableDefinition {
  expect(def.type).toBe(DefinitionType.ImplicitGlobalVariable);
}
export function expectToBeImportBindingDefinition(
  def: Definition,
): asserts def is ImportBindingDefinition {
  expect(def.type).toBe(DefinitionType.ImportBinding);
}
export function expectToBeParameterDefinition(
  def: Definition,
): asserts def is ParameterDefinition {
  expect(def.type).toBe(DefinitionType.Parameter);
}
export function expectToBeVariableDefinition(
  def: Definition,
): asserts def is VariableDefinition {
  expect(def.type).toBe(DefinitionType.Variable);
}

/////////////////
// EXPECT MISC //
/////////////////

export function expectToBeIdentifier(
  node: TSESTree.Node | null | undefined,
): asserts node is TSESTree.Identifier {
  expect(node?.type).toBe(AST_NODE_TYPES.Identifier);
}
