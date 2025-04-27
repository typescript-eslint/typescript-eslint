import { ScopeType } from '../../src/index.js';
import { getRealVariables, parseAndAnalyze } from '../test-utils/index.js';

describe('global increment', () => {
  it('becomes read/write', () => {
    const { scopeManager } = parseAndAnalyze('b++;');

    expect(scopeManager.scopes).toHaveLength(1);

    const scope = scopeManager.scopes[0];
    const variables = getRealVariables(scope.variables);
    assert.isScopeOfType(scope, ScopeType.global);
    expect(variables).toHaveLength(0);
    expect(scope.references).toHaveLength(1);
    expect(scope.references[0].isReadWrite()).toBeTruthy();
  });
});
