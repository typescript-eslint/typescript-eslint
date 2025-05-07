import { ScopeType } from '../../src/index.js';
import { getRealVariables, parseAndAnalyze } from '../test-utils/index.js';

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
    assert.isScopeOfType(scope, ScopeType.global);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.function);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.block);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[3];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.catch);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('e');
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[4];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.block);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);
  });
});
