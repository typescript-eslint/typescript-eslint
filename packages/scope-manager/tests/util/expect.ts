import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/types';
import {
  CatchClauseDefinition,
  ClassNameDefinition,
  Definition,
  DefinitionType,
  FunctionNameDefinition,
  ImplicitGlobalVariableDefinition,
  ImportBindingDefinition,
  ParameterDefinition,
  VariableDefinition,
} from '../../src/definition';
import {
  BlockScope,
  CatchScope,
  ClassScope,
  ForScope,
  FunctionExpressionNameScope,
  FunctionScope,
  GlobalScope,
  ModuleScope,
  Scope,
  ScopeType,
  SwitchScope,
  WithScope,
} from '../../src/scope';

//////////////////
// EXPECT SCOPE //
//////////////////

function expectToBeBlockScope(scope: Scope): asserts scope is BlockScope {
  expect(scope.type).toBe(ScopeType.block);
}
function expectToBeCatchScope(scope: Scope): asserts scope is CatchScope {
  expect(scope.type).toBe(ScopeType.catch);
}
function expectToBeClassScope(scope: Scope): asserts scope is ClassScope {
  expect(scope.type).toBe(ScopeType.class);
}
function expectToBeForScope(scope: Scope): asserts scope is ForScope {
  expect(scope.type).toBe(ScopeType.for);
}
function expectToBeFunctionScope(scope: Scope): asserts scope is FunctionScope {
  expect(scope.type).toBe(ScopeType.function);
}
function expectToBeFunctionExpressionNameScope(
  scope: Scope,
): asserts scope is FunctionExpressionNameScope {
  expect(scope.type).toBe(ScopeType.functionExpressionName);
}
function expectToBeGlobalScope(scope: Scope): asserts scope is GlobalScope {
  expect(scope.type).toBe(ScopeType.global);
}
function expectToBeModuleScope(scope: Scope): asserts scope is ModuleScope {
  expect(scope.type).toBe(ScopeType.module);
}
function expectToBeSwitchScope(scope: Scope): asserts scope is SwitchScope {
  expect(scope.type).toBe(ScopeType.switch);
}
function expectToBeWithScope(scope: Scope): asserts scope is WithScope {
  expect(scope.type).toBe(ScopeType.with);
}

export {
  expectToBeBlockScope,
  expectToBeCatchScope,
  expectToBeClassScope,
  expectToBeForScope,
  expectToBeFunctionExpressionNameScope,
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  expectToBeModuleScope,
  expectToBeSwitchScope,
  expectToBeWithScope,
};

///////////////////////
// EXPECT DEFINITION //
///////////////////////

function expectToBeCatchClauseDefinition(
  def: Definition,
): asserts def is CatchClauseDefinition {
  expect(def.type).toBe(DefinitionType.CatchClause);
}
function expectToBeClassNameDefinition(
  def: Definition,
): asserts def is ClassNameDefinition {
  expect(def.type).toBe(DefinitionType.ClassName);
}
function expectToBeFunctionNameDefinition(
  def: Definition,
): asserts def is FunctionNameDefinition {
  expect(def.type).toBe(DefinitionType.FunctionName);
}
function expectToBeImplicitGlobalVariableDefinition(
  def: Definition,
): asserts def is ImplicitGlobalVariableDefinition {
  expect(def.type).toBe(DefinitionType.ImplicitGlobalVariable);
}
function expectToBeImportBindingDefinition(
  def: Definition,
): asserts def is ImportBindingDefinition {
  expect(def.type).toBe(DefinitionType.ImportBinding);
}
function expectToBeParameterDefinition(
  def: Definition,
): asserts def is ParameterDefinition {
  expect(def.type).toBe(DefinitionType.Parameter);
}
function expectToBeVariableDefinition(
  def: Definition,
): asserts def is VariableDefinition {
  expect(def.type).toBe(DefinitionType.Variable);
}

export {
  expectToBeCatchClauseDefinition,
  expectToBeClassNameDefinition,
  expectToBeFunctionNameDefinition,
  expectToBeImplicitGlobalVariableDefinition,
  expectToBeImportBindingDefinition,
  expectToBeParameterDefinition,
  expectToBeVariableDefinition,
};

/////////////////
// EXPECT MISC //
/////////////////

function expectToBeIdentifier(
  node: TSESTree.Node | null | undefined,
): asserts node is TSESTree.Identifier {
  expect(node?.type).toBe(AST_NODE_TYPES.Identifier);
}

export { expectToBeIdentifier };
