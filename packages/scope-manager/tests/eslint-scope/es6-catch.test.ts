import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { ScopeType } from '../../src/index.js';
import { getRealVariables, parseAndAnalyze } from '../test-utils/index.js';

describe('ES6 catch', () => {
  it('takes binding pattern', () => {
    const { scopeManager } = parseAndAnalyze(`
      try {
      } catch ({ a, b, c, d }) {
        let e = 20;
        a;
        b;
        c;
        d;
      }
    `);

    expect(scopeManager.scopes).toHaveLength(4);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.global);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBe(false);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.block);
    expect(scope.block.type).toBe(AST_NODE_TYPES.BlockStatement);
    expect(scope.isStrict).toBe(false);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.catch);
    expect(scope.block.type).toBe(AST_NODE_TYPES.CatchClause);
    expect(scope.isStrict).toBe(false);

    expect(variables).toHaveLength(4);
    expect(variables[0].name).toBe('a');
    expect(variables[1].name).toBe('b');
    expect(variables[2].name).toBe('c');
    expect(variables[3].name).toBe('d');
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[3];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.block);
    expect(scope.block.type).toBe(AST_NODE_TYPES.BlockStatement);
    expect(scope.isStrict).toBe(false);
    expect(variables).toHaveLength(1);
    expect(variables.map(variable => variable.name)).toStrictEqual(['e']);
    expect(scope.references.map(ref => ref.identifier.name)).toStrictEqual([
      'e',
      'a',
      'b',
      'c',
      'd',
    ]);
  });
});
