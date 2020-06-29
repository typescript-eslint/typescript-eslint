import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { expectToBeFunctionScope, parseAndAnalyze } from '../util';

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

    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionExpression);
    expect(scope.isStrict).toBeTruthy();
    expect(scope.variables).toHaveLength(1);
    expect(scope.variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0);
  });
});
