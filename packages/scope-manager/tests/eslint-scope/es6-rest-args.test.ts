import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { DefinitionType, ScopeType } from '../../src/index.js';
import { getRealVariables, parseAndAnalyze } from '../test-utils/index.js';

describe('ES6 rest arguments', () => {
  it('materialize rest argument in scope', () => {
    const { scopeManager } = parseAndAnalyze(`
      function foo(...bar) {
        return bar;
      }
    `);

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.global);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(1);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.function);
    expect(variables).toHaveLength(2);
    expect(variables[0].name).toBe('arguments');
    expect(variables[1].name).toBe('bar');
    assert.isNodeOfType(variables[1].defs[0].name, AST_NODE_TYPES.Identifier);
    expect(variables[1].defs[0].name.name).toBe('bar');
    assert.isDefinitionOfType(variables[1].defs[0], DefinitionType.Parameter);
    expect(variables[1].defs[0].rest).toBeTruthy();
  });
});
