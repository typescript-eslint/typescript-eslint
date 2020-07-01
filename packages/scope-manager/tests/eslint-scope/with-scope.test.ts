import {
  expectToBeBlockScope,
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  expectToBeWithScope,
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
    expectToBeGlobalScope(scope);
    expect(scope.variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    expectToBeFunctionScope(scope);
    expect(scope.variables).toHaveLength(1);
    expect(scope.variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(1);
    expect(scope.references[0].resolved).toBeNull();

    scope = scopeManager.scopes[2];
    expectToBeWithScope(scope);
    expect(scope.variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[3];
    expectToBeBlockScope(scope);
    expect(scope.variables).toHaveLength(0);
    expect(scope.references).toHaveLength(1);
    expect(scope.references[0].identifier.name).toBe('testing');
    expect(scope.references[0].resolved).toBeNull();
  });
});
