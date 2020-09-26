import {
  expectToBeBlockScope,
  expectToBeFunctionScope,
  expectToBeGlobalScope,
  getRealVariables,
  parseAndAnalyze,
} from '../util';

describe('label', () => {
  it('should not create variables', () => {
    const { scopeManager } = parseAndAnalyze(
      'function bar() { q: for(;;) { break q; } }',
    );

    expect(scopeManager.scopes).toHaveLength(3);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('bar');
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeFunctionScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('arguments');
    expect(scope.references).toHaveLength(0);

    scope = scopeManager.scopes[2];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(0);
  });

  it('should count child node references', () => {
    const { scopeManager } = parseAndAnalyze(`
      var foo = 5;

      label: while (true) {
        console.log(foo);
        break;
      }
    `);

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    expectToBeGlobalScope(scope);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('foo');
    expect(scope.through).toHaveLength(3);
    expect(scope.through[2].identifier.name).toBe('foo');
    expect(scope.through[2].isRead()).toBeTruthy();

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    expectToBeBlockScope(scope);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(2);
    expect(scope.references[0].identifier.name).toBe('console');
    expect(scope.references[1].identifier.name).toBe('foo');
  });
});
