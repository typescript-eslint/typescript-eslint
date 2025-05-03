import { DefinitionType, ScopeType } from '../../src/index.js';
import { getRealVariables, parseAndAnalyze } from '../test-utils/index.js';

describe('ES6 iteration scope', () => {
  it('let materialize iteration scope for ForInStatement#1', () => {
    const { scopeManager } = parseAndAnalyze(`
      (function () {
        let i = 20;
        for (let i in i) {
          console.log(i);
        }
      }());
    `);

    expect(scopeManager.scopes).toHaveLength(4);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.global);
    expect(variables).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.function);
    expect(variables).toHaveLength(2);
    expect(variables[0].name).toBe('arguments');
    expect(variables[1].name).toBe('i');
    expect(scope.references).toHaveLength(1);
    expect(scope.references[0].identifier.name).toBe('i');
    expect(scope.references[0].resolved).toBe(variables[1]);

    const iterScope = (scope = scopeManager.scopes[2]);
    variables = getRealVariables(scope.variables);
    const iterVariables = getRealVariables(iterScope.variables);
    assert.isScopeOfType(scope, ScopeType.for);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('i');
    expect(scope.references).toHaveLength(2);
    expect(scope.references[0].identifier.name).toBe('i');
    expect(scope.references[0].resolved).toBe(variables[0]);
    expect(scope.references[1].identifier.name).toBe('i');
    expect(scope.references[1].resolved).toBe(variables[0]);

    scope = scopeManager.scopes[3];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.block);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(2);
    expect(scope.references[0].identifier.name).toBe('console');

    assert.isNull(scope.references[0].resolved);

    expect(scope.references[1].identifier.name).toBe('i');
    expect(scope.references[1].resolved).toBe(iterVariables[0]);
  });

  it('let materialize iteration scope for ForInStatement#2', () => {
    const { scopeManager } = parseAndAnalyze(`
      (function () {
        let i = 20;
        for (let { i, j, k } in i) {
          console.log(i);
        }
      }());
    `);

    expect(scopeManager.scopes).toHaveLength(4);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);

    assert.isScopeOfType(scope, ScopeType.global);
    expect(variables).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.function);
    expect(variables).toHaveLength(2);
    expect(variables[0].name).toBe('arguments');
    expect(variables[1].name).toBe('i');
    expect(scope.references).toHaveLength(1);
    expect(scope.references[0].identifier.name).toBe('i');
    expect(scope.references[0].resolved).toBe(variables[1]);

    const iterScope = (scope = scopeManager.scopes[2]);
    variables = getRealVariables(scope.variables);
    const iterVariables = getRealVariables(iterScope.variables);

    assert.isScopeOfType(scope, ScopeType.for);
    expect(variables).toHaveLength(3);
    expect(variables[0].name).toBe('i');
    expect(variables[1].name).toBe('j');
    expect(variables[2].name).toBe('k');
    expect(scope.references).toHaveLength(4);
    expect(scope.references[0].identifier.name).toBe('i');
    expect(scope.references[0].resolved).toBe(variables[0]);
    expect(scope.references[1].identifier.name).toBe('j');
    expect(scope.references[1].resolved).toBe(variables[1]);
    expect(scope.references[2].identifier.name).toBe('k');
    expect(scope.references[2].resolved).toBe(variables[2]);
    expect(scope.references[3].identifier.name).toBe('i');
    expect(scope.references[3].resolved).toBe(variables[0]);

    scope = scopeManager.scopes[3];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.block);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(2);
    expect(scope.references[0].identifier.name).toBe('console');

    assert.isNull(scope.references[0].resolved);

    expect(scope.references[1].identifier.name).toBe('i');
    expect(scope.references[1].resolved).toBe(iterVariables[0]);
  });

  it('let materialize iteration scope for ForStatement#2', () => {
    const { scopeManager } = parseAndAnalyze(`
      (function () {
        let i = 20;
        let obj = {};
        for (let { i, j, k } = obj; i < okok; ++i) {
          console.log(i, j, k);
        }
      }());
    `);

    expect(scopeManager.scopes).toHaveLength(4);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);

    assert.isScopeOfType(scope, ScopeType.global);
    expect(variables).toHaveLength(0);

    const functionScope = (scope = scopeManager.scopes[1]);
    variables = getRealVariables(scope.variables);
    const functionVariables = getRealVariables(functionScope.variables);

    assert.isScopeOfType(scope, ScopeType.function);
    expect(variables).toHaveLength(3);
    expect(variables[0].name).toBe('arguments');
    expect(variables[1].name).toBe('i');
    expect(variables[2].name).toBe('obj');
    expect(scope.references).toHaveLength(2);
    expect(scope.references[0].identifier.name).toBe('i');
    expect(scope.references[0].resolved).toBe(variables[1]);
    expect(scope.references[1].identifier.name).toBe('obj');
    expect(scope.references[1].resolved).toBe(variables[2]);

    const iterScope = (scope = scopeManager.scopes[2]);
    variables = getRealVariables(scope.variables);
    const iterVariables = getRealVariables(iterScope.variables);

    assert.isScopeOfType(scope, ScopeType.for);
    expect(variables).toHaveLength(3);
    expect(variables[0].name).toBe('i');
    assert.isDefinitionOfType(variables[0].defs[0], DefinitionType.Variable);
    expect(variables[1].name).toBe('j');
    assert.isDefinitionOfType(variables[1].defs[0], DefinitionType.Variable);
    expect(variables[2].name).toBe('k');
    assert.isDefinitionOfType(variables[2].defs[0], DefinitionType.Variable);
    expect(scope.references).toHaveLength(7);
    expect(scope.references[0].identifier.name).toBe('i');
    expect(scope.references[0].resolved).toBe(variables[0]);
    expect(scope.references[1].identifier.name).toBe('j');
    expect(scope.references[1].resolved).toBe(variables[1]);
    expect(scope.references[2].identifier.name).toBe('k');
    expect(scope.references[2].resolved).toBe(variables[2]);
    expect(scope.references[3].identifier.name).toBe('obj');
    expect(scope.references[3].resolved).toBe(functionVariables[2]);
    expect(scope.references[4].identifier.name).toBe('i');
    expect(scope.references[4].resolved).toBe(variables[0]);
    expect(scope.references[5].identifier.name).toBe('okok');

    assert.isNull(scope.references[5].resolved);

    expect(scope.references[6].identifier.name).toBe('i');
    expect(scope.references[6].resolved).toBe(variables[0]);

    scope = scopeManager.scopes[3];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.block);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(4);
    expect(scope.references[0].identifier.name).toBe('console');

    assert.isNull(scope.references[0].resolved);

    expect(scope.references[1].identifier.name).toBe('i');
    expect(scope.references[1].resolved).toBe(iterVariables[0]);
    expect(scope.references[2].identifier.name).toBe('j');
    expect(scope.references[2].resolved).toBe(iterVariables[1]);
    expect(scope.references[3].identifier.name).toBe('k');
    expect(scope.references[3].resolved).toBe(iterVariables[2]);
  });
});
