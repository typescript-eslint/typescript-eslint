import { ScopeType } from '../../src/scope';
import { parseAndAnalyze } from '../test-utils';

describe('module var scoping (flag has no effect)', () => {
  it('keeps var scoped to module (not global)', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      var a = 1;
      a;
    `,
      { resolveGlobalVarsInScript: true, sourceType: 'module' },
    );

    const globalScope = scopeManager.globalScope!;
    expect(globalScope.type).toBe(ScopeType.global);
    // var a should not live in the global scope set for modules
    expect(globalScope.set.has('a')).toBe(false);
    // module scope should own 'a'
    const moduleScope = scopeManager.scopes.find(
      s => s.type === ScopeType.module,
    );
    expect(moduleScope?.set.has('a')).toBe(true);
  });
});
