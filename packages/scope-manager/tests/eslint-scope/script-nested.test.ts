import { ScopeType } from '../../src/scope';
import { parseAndAnalyze } from '../test-utils';

describe('Global resolution in script mode', () => {
  it('resolves global var references in nested functions', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      var a = 1;
      function foo() {
        function bar() {
          return a;
        }
      }
    `,
      { sourceType: 'script', resolveGlobalVarsInScript: true },
    );

    const globalScope = scopeManager.globalScope!;
    expect(globalScope.type).toBe(ScopeType.global);

    const aVar = globalScope.set.get('a');
    expect(aVar).toBeDefined();

    const fooScope = globalScope.childScopes[0];
    const barScope = fooScope.childScopes[0];

    expect(barScope.references).toHaveLength(1);
    const ref = barScope.references[0];
    expect(ref.identifier.name).toBe('a');
    expect(ref.resolved).toBe(aVar);
  });

  it('resolves multiple mixed globals injected via addGlobals', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      var a = 1;
      console.log(b);
    `,
      { sourceType: 'script', resolveGlobalVarsInScript: true },
    );

    scopeManager.addGlobals(['b']);

    const globalScope = scopeManager.globalScope!;
    const bVar = globalScope.set.get('b');
    expect(bVar).toBeDefined();

    expect(bVar!.references.length).toBeGreaterThan(0);
    const foundRef = bVar!.references[0];
    expect(foundRef.identifier.name).toBe('b');

    const consoleRef = globalScope.through.find(
      r => r.identifier.name === 'console',
    );
    expect(consoleRef).toBeDefined();
  });
});
