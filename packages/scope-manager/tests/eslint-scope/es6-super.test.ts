import {
  expectToBeClassScope,
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

describe('ES6 super', () => {
  it('is not handled as reference', () => {
    const { scopeManager } = parseAndAnalyze(`
      class Foo extends Bar {
        constructor() {
          super();
        }

        method() {
          super.method();
        }
      }
    `);

    expect(scopeManager.scopes).toHaveLength(4);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('Foo');
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeClassScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('Foo');
    expect(scope.references).toHaveLength(1);
    expect(scope.references[0].identifier.name).toBe('Bar');

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0); // super is specially handled like `this`.

    scope = scopeManager.scopes[3];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0); // super is specially handled like `this`.
  });
});
