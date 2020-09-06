import {
  expectToBeBlockScope,
  expectToBeCatchScope,
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

describe('catch', () => {
  it('creates scope', () => {
    const { scopeManager } = parseAndAnalyze(`
      (function () {
        try {
        } catch (e) {
        }
      }());
    `);

    expect(scopeManager.scopes).toHaveLength(5);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[3];
    variables = getRealVariables(scope.variables);
    expectToBeCatchScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('e');
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[4];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);
  });
});
