import {
  expectToBeFunctionScope,
  expectToBeGlobalScope,
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
    expectToBeGlobalScope(scope);
    expect(scope.variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    expectToBeFunctionScope(scope);
    expect(scope.variables).toHaveLength(1);
    expect(scope.variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(1);
    expect(scope.references[0].resolved).toBe(scope.variables[0]);
  });
});
