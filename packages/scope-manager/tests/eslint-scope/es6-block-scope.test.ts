import {
  expectToBeBlockScope,
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

describe('ES6 block scope', () => {
  it('let is materialized in ES6 block scope#1', () => {
    const { scopeManager } = parseAndAnalyze(`
      {
        let i = 20;
        i;
      }
    `);

    expect(scopeManager.scopes).toHaveLength(2); // Program and BlockStatement scope.

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0); // No variable in Program scope.

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(variables).toHaveLength(1); // `i` in block scope.
    expect(variables[0].name).toBe('i');
    expect(scope.references).toHaveLength(2);
    expect(scope.references[0].identifier.name).toBe('i');
    expect(scope.references[1].identifier.name).toBe('i');
  });

  it('function delaration is materialized in ES6 block scope', () => {
    const { scopeManager } = parseAndAnalyze(`
      {
        function test() {
        }
        test();
      }
    `);

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('test');
    expect(scope.references).toHaveLength(1);
    expect(scope.references[0].identifier.name).toBe('test');

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0);
  });

  it('let is not hoistable#1', () => {
    const { scopeManager } = parseAndAnalyze(`
      var i = 42; (1)
      {
        i;  // (2) ReferenceError at runtime.
        let i = 20;  // (2)
        i;  // (2)
      }
    `);

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('i');
    expect(scope.references).toHaveLength(1);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('i');
    expect(scope.references).toHaveLength(3);
    expect(scope.references[0].resolved).toBe(variables[0]);
    expect(scope.references[1].resolved).toBe(variables[0]);
    expect(scope.references[2].resolved).toBe(variables[0]);
  });

  it('let is not hoistable#2', () => {
    const { scopeManager } = parseAndAnalyze(`
      (function () {
        var i = 42; // (1)
        i;  // (1)
        {
          i;  // (3)
          {
            i;  // (2)
            let i = 20;  // (2)
            i;  // (2)
          }
          let i = 30;  // (3)
          i;  // (3)
        }
        i;  // (1)
      }());
    `);

    expect(scopeManager.scopes).toHaveLength(4);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(variables).toHaveLength(2);
    expect(variables[0].name).toBe('arguments');
    expect(variables[1].name).toBe('i');
    const v1 = variables[1];

    expect(scope.references).toHaveLength(3);
    expect(scope.references[0].resolved).toBe(v1);
    expect(scope.references[1].resolved).toBe(v1);
    expect(scope.references[2].resolved).toBe(v1);

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('i');
    const v3 = variables[0];

    expect(scope.references).toHaveLength(3);
    expect(scope.references[0].resolved).toBe(v3);
    expect(scope.references[1].resolved).toBe(v3);
    expect(scope.references[2].resolved).toBe(v3);

    scope = scopeManager.scopes[3];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('i');
    const v2 = variables[0];

    expect(scope.references).toHaveLength(3);
    expect(scope.references[0].resolved).toBe(v2);
    expect(scope.references[1].resolved).toBe(v2);
    expect(scope.references[2].resolved).toBe(v2);
  });
});
