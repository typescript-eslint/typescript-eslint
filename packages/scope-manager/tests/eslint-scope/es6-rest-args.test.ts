import { AST_NODE_TYPES } from '@typescript-eslint/types';
import {
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  expectToBeIdentifier,
  expectToBeParameterDefinition,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

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
    expectToBeGlobalScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(1);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(variables).toHaveLength(2);
    expect(variables[0].name).toBe('arguments');
    expect(variables[1].name).toBe('bar');
    expectToBeIdentifier(variables[1].defs[0].name);
    expect(variables[1].defs[0].name.name).toBe('bar');
    expectToBeParameterDefinition(variables[1].defs[0]);
    expect(variables[1].defs[0].rest).toBeTruthy();
  });
});
