import {
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

describe('arguments', () => {
  it('arguments are correctly materialized', () => {
    const { scopeManager } = parseAndAnalyze(`
      (function () {
        arguments;
      }());
    `);

    expect(scopeManager.scopes).toHaveLength(2);

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
    expect(scope.references).toHaveLength(1);
    expect(scope.references[0].resolved).toBe(variables[0]);
  });
});
