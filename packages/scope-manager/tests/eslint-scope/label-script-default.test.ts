import { ScopeType } from '../../src/scope';
import { getRealVariables, parseAndAnalyze } from '../test-utils';

describe('label (script default: globals stay through)', () => {
  it('should count child node references when globals are not resolved', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      var foo = 5;

      label: while (true) {
        console.log(foo);
        break;
      }
    `,
      { resolveGlobalVarsInScript: false },
    );

    expect(scopeManager.scopes).toHaveLength(2);

    let scope = scopeManager.scopes[0];
    let variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.global);
    expect(variables).toHaveLength(1);
    expect(variables[0].name).toBe('foo');
    expect(scope.through).toHaveLength(3);
    expect(scope.through[2].identifier.name).toBe('foo');
    expect(scope.through[2].isRead()).toBe(true);

    scope = scopeManager.scopes[1];
    variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.block);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(2);
    expect(scope.references[0].identifier.name).toBe('console');
    expect(scope.references[1].identifier.name).toBe('foo');
  });
});
