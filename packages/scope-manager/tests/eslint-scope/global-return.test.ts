import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { DefinitionType, ScopeType } from '../../src/index.js';
import { getRealVariables } from '../test-utils/index.js';
import { parseAndAnalyze } from '../test-utils/parse';

describe('gloablReturn option', () => {
  it('creates a function scope following the global scope immediately', () => {
    const { scopeManager } = parseAndAnalyze(
      `
        "use strict";
        var hello = 20;
      `,
      { globalReturn: true },
    );

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);

    assert.isScopeOfType(scope, ScopeType.global);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.function);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeTruthy();
    expect(variables).toHaveLength(2);
    expect(variables[0].name).toBe('arguments');
    expect(variables[1].name).toBe('hello');
  });

  it('creates a function scope following the global scope immediately and creates module scope', () => {
    const { scopeManager } = parseAndAnalyze("import {x as v} from 'mod';", {
      globalReturn: true,
      sourceType: 'module',
    });

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);

    assert.isScopeOfType(scope, ScopeType.global);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.function);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('arguments');

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.module);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('v');
    assert.isDefinitionOfType(
      variables[0].defs[0],
      DefinitionType.ImportBinding,
    );
    expect(scope.references).toHaveLength(0);
  });
});
