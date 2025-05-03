import { ScopeType } from '../../src/index.js';
import { getRealVariables, parseAndAnalyze } from '../test-utils/index.js';

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
    assert.isScopeOfType(scope, ScopeType.global);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    // Function expression name scope
    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.functionExpressionName);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('name');
    expect(scope.references).toHaveLength(0);
    expect(scope.upper).toBe(globalScope);

    // Function scope
    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.function);
    expect(variables).toHaveLength(1);
    expect(scope.variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0);
    expect(scope.upper).toBe(scopeManager.scopes[1]);
  });
});
