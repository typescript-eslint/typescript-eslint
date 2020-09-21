import { AST_NODE_TYPES } from '@typescript-eslint/types';
import {
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

describe('ES6 arrow function expression', () => {
  it('materialize scope for arrow function expression', () => {
    const { scopeManager } = parseAndAnalyze(`
      var arrow = () => {
        let i = 0;
        var j = 20;
        console.log(i);
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
    expect(scope.block.type).toBe(AST_NODE_TYPES.ArrowFunctionExpression);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(2);

    // There's no "arguments"
    expect(variables[0].name).toBe('i');
    expect(variables[1].name).toBe('j');
  });

  it('generate bindings for parameters', () => {
    const { scopeManager } = parseAndAnalyze('var arrow = (a, b, c, d) => {}');

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
    expect(scope.block.type).toBe(AST_NODE_TYPES.ArrowFunctionExpression);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(4);

    // There's no "arguments"
    expect(variables[0].name).toBe('a');
    expect(variables[1].name).toBe('b');
    expect(variables[2].name).toBe('c');
    expect(variables[3].name).toBe('d');
  });

  it('inherits upper scope strictness', () => {
    const { scopeManager } = parseAndAnalyze(`
      "use strict";
      var arrow = () => {};
    `);

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.Program);
    expect(scope.isStrict).toBeTruthy();
    expect(variables).toHaveLength(1);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.ArrowFunctionExpression);
    expect(scope.isStrict).toBeTruthy();
    expect(variables).toHaveLength(0);
  });

  it('is strict when a strictness directive is used', () => {
    const { scopeManager } = parseAndAnalyze(`
      var arrow = () => {
        "use strict";
      };
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
    expect(scope.block.type).toBe(AST_NODE_TYPES.ArrowFunctionExpression);
    expect(scope.isStrict).toBeTruthy();
    expect(variables).toHaveLength(0);
  });

  it('works with no body', () => {
    const { scopeManager } = parseAndAnalyze('var arrow = a => a;');

    expect(scopeManager.scopes).toHaveLength(2);

    const scope = scopeManager.scopes[1];
    const variables = getRealVariables(scope.variables);

    expectToBeFunctionScope(scope);
    expect(scope.block.type).toBe(AST_NODE_TYPES.ArrowFunctionExpression);
    expect(scope.isStrict).toBeFalsy();
    expect(variables).toHaveLength(1);
  });
});
