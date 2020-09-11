import {
  expectToBeBlockScope,
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  expectToBeWithScope,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

describe('with', () => {
  it('creates scope', () => {
    const { scopeManager } = parseAndAnalyze(
      `
        (function () {
          with (obj) {
            testing;
          }
        }());
      `,
      'script',
    );

    expect(scopeManager.scopes).toHaveLength(4);

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
    expect(scope.references[0].resolved).toBeNull();

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    expectToBeWithScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[3];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(1);
    expect(scope.references[0].identifier.name).toBe('testing');
    expect(scope.references[0].resolved).toBeNull();
  });
});
