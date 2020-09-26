import { AST_NODE_TYPES } from '@typescript-eslint/types';
import {
  expectToBeBlockScope,
  expectToBeCatchScope,
  expectToBeGlobalScope,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

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
    expectToBeGlobalScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.BlockStatement);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    expectToBeCatchScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.CatchClause);
    expect(scope.isStrict).toBeFalsy();

    expect(variables).toHaveLength(4);
    expect(variables[0].name).toBe('a');
    expect(variables[1].name).toBe('b');
    expect(variables[2].name).toBe('c');
    expect(variables[3].name).toBe('d');
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[3];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.BlockStatement);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(1);
    expect(variables.map(variable => variable.name)).toEqual(['e']);
    expect(scope.references.map(ref => ref.identifier.name)).toEqual([
      'e',
      'a',
      'b',
      'c',
      'd',
    ]);
  });
});
