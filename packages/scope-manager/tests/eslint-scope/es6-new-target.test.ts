import { AST_NODE_TYPES } from '@typescript-eslint/types';

import { ScopeType } from '../../src/index.js';
import { getRealVariables, parseAndAnalyze } from '../test-utils/index.js';

describe('ES6 new.target', () => {
  it('should not make references of new.target', () => {
    const { scopeManager } = parseAndAnalyze(`
      class A {
        constructor() {
          new.target;
        }
      }
    `);

    expect(scopeManager.scopes).toHaveLength(3);

    const scope = scopeManager.scopes[2];
    const variables = getRealVariables(scope.variables);

    assert.isScopeOfType(scope, ScopeType.function);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionExpression);
    expect(scope.isStrict).toBe(true);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0);
  });
});
