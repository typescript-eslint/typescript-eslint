import { AST_NODE_TYPES } from '@typescript-eslint/types';
import {
  expectToBeGlobalScope,
  expectToBeSwitchScope,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

describe('ES6 switch', () => {
  it('materialize scope', () => {
    const { scopeManager } = parseAndAnalyze(`
      switch (ok) {
        case hello:
          let i = 20;
          i;
          break;

        default:
          let test = 30;
          test;
      }
    `);

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(1);
    expect(scope.references[0].identifier.name).toBe('ok');

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeSwitchScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.SwitchStatement);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(2);
    expect(variables[0].name).toBe('i');
    expect(variables[1].name).toBe('test');
    expect(scope.references).toHaveLength(5);
    expect(scope.references[0].identifier.name).toBe('hello');
    expect(scope.references[1].identifier.name).toBe('i');
    expect(scope.references[2].identifier.name).toBe('i');
    expect(scope.references[3].identifier.name).toBe('test');
    expect(scope.references[4].identifier.name).toBe('test');
  });
});
