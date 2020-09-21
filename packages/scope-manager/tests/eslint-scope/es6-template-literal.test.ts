import { AST_NODE_TYPES } from '@typescript-eslint/types';
import {
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

describe('ES6 template literal', () => {
  it('refer variables', () => {
    const { scopeManager } = parseAndAnalyze(`
      (function () {
        let i, j, k;
        function testing() { }
        let template = testing\`testing \${i} and \${j}\`
        return template;
      }());
    `);

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);

    expectToBeGlobalScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.FunctionExpression);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(6);
    expect(variables[0].name).toBe('arguments');
    expect(variables[1].name).toBe('i');
    expect(variables[2].name).toBe('j');
    expect(variables[3].name).toBe('k');
    expect(variables[4].name).toBe('testing');
    expect(variables[5].name).toBe('template');
    expect(scope.references).toHaveLength(5);
    expect(scope.references[0].identifier.name).toBe('template');
    expect(scope.references[1].identifier.name).toBe('testing');
    expect(scope.references[2].identifier.name).toBe('i');
    expect(scope.references[3].identifier.name).toBe('j');
    expect(scope.references[4].identifier.name).toBe('template');
  });
});
