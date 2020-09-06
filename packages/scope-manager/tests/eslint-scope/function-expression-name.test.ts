import {
  expectToBeFunctionExpressionNameScope,
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

describe('function name', () => {
  it('should create its special scope', () => {
    const { scopeManager } = parseAndAnalyze(`
      (function name() {
      }());
    `);

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    const globalScope = scope;
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    // Function expression name scope
    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionExpressionNameScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('name');
    expect(scope.references).toHaveLength(0);
    expect(scope.upper === globalScope).toBeTruthy();

    // Function scope
    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(variables).toHaveLength(1);
    expect(scope.variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0);
    expect(scope.upper === scopeManager.scopes[1]).toBeTruthy();
  });
});
