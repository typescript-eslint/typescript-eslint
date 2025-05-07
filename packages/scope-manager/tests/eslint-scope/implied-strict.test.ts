import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { ScopeType } from '../../src/index.js';
import { parseAndAnalyze } from '../test-utils/index.js';

describe('impliedStrict option', () => {
  it('ensures all user scopes are strict', () => {
    const { scopeManager } = parseAndAnalyze(
      `
        function foo() {
          function bar() {
            "use strict";
          }
        }
      `,
      {
        impliedStrict: true,
      },
    );

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];

    assert.isScopeOfType(scope, ScopeType.global);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBe(true);

    scope = scopeManager.scopes[1];
    assert.isScopeOfType(scope, ScopeType.function);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionDeclaration);
    expect(scope.isStrict).toBe(true);

    scope = scopeManager.scopes[2];
    assert.isScopeOfType(scope, ScopeType.function);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionDeclaration);
    expect(scope.isStrict).toBe(true);
  });

  it('omits a nodejs global scope when ensuring all user scopes are strict', () => {
    const { scopeManager } = parseAndAnalyze(
      `
        function foo() {}
      `,
      {
        globalReturn: true,
        impliedStrict: true,
      },
    );

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];

    assert.isScopeOfType(scope, ScopeType.global);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBe(false);

    scope = scopeManager.scopes[1];
    assert.isScopeOfType(scope, ScopeType.function);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBe(true);

    scope = scopeManager.scopes[2];
    assert.isScopeOfType(scope, ScopeType.function);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionDeclaration);
    expect(scope.isStrict).toBe(true);
  });

  it('omits a module global scope when ensuring all user scopes are strict', () => {
    const { scopeManager } = parseAndAnalyze('function foo() {}', {
      impliedStrict: true,
      sourceType: 'module',
    });

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];

    assert.isScopeOfType(scope, ScopeType.global);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBe(false);

    scope = scopeManager.scopes[1];
    assert.isScopeOfType(scope, ScopeType.module);
    expect(scope.isStrict).toBe(true);

    scope = scopeManager.scopes[2];
    assert.isScopeOfType(scope, ScopeType.function);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionDeclaration);
    expect(scope.isStrict).toBe(true);
  });
});
