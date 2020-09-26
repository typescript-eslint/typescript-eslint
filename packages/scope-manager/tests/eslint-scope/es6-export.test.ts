import {
  expectToBeFunctionNameDefinition,
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  expectToBeModuleScope,
  expectToBeVariableDefinition,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

describe('export declaration', () => {
  // http://people.mozilla.org/~jorendorff/es6-draft.html#sec-static-and-runtme-semantics-module-records
  it('should create variable bindings', () => {
    const { scopeManager } = parseAndAnalyze('export var v;', 'module');

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('v');
    expectToBeVariableDefinition(variables[0].defs[0]);
    expect(scope.references).toHaveLength(0);
  });

  it('should create function declaration bindings', () => {
    const { scopeManager } = parseAndAnalyze(
      'export default function f(){};',
      'module',
    );

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('f');
    expectToBeFunctionNameDefinition(variables[0].defs[0]);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0);
  });

  it('should export function expression', () => {
    const { scopeManager } = parseAndAnalyze(
      'export default function(){};',
      'module',
    );

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0);
  });

  it('should export literal', () => {
    const { scopeManager } = parseAndAnalyze('export default 42;', 'module');

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);
  });

  it('should refer exported references#1', () => {
    const { scopeManager } = parseAndAnalyze(
      'const x = 1; export {x};',
      'module',
    );

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(variables).toHaveLength(1);
    expect(scope.references).toHaveLength(2);
    expect(scope.references[0].identifier.name).toBe('x');
    expect(scope.references[1].identifier.name).toBe('x');
  });

  it('should refer exported references#2', () => {
    const { scopeManager } = parseAndAnalyze(
      'const v = 1; export {v as x};',
      'module',
    );

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(variables).toHaveLength(1);
    expect(scope.references).toHaveLength(2);
    expect(scope.references[0].identifier.name).toBe('v');
    expect(scope.references[1].identifier.name).toBe('v');
  });

  it('should not refer exported references from other source#1', () => {
    const { scopeManager } = parseAndAnalyze(
      'export {x} from "mod";',
      'module',
    );

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);
  });

  it('should not refer exported references from other source#2', () => {
    const { scopeManager } = parseAndAnalyze(
      'export {v as x} from "mod";',
      'module',
    );

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);
  });

  it('should not refer exported references from other source#3', () => {
    const { scopeManager } = parseAndAnalyze('export * from "mod";', 'module');

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeModuleScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);
  });
});
