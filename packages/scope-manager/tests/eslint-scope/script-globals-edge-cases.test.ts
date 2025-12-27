import { parseAndAnalyze } from '../test-utils';

describe('script globals: edge cases', () => {
  it('TDZ with let/const still resolves identifiers (no through entry)', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      console.log(a);
      let a = 1;
    `,
      { resolveGlobalVarsInScript: false, sourceType: 'script' },
    );

    const globalScope = scopeManager.globalScope!;
    expect(globalScope.through.some(ref => ref.identifier.name === 'a')).toBe(
      false,
    );
    expect(
      globalScope.through.some(ref => ref.identifier.name === 'console'),
    ).toBe(true);
  });

  it('with block prevents static resolution even when opted-in', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      with (obj) {
        console.log(a);
      }
      var a = 1;
    `,
      { resolveGlobalVarsInScript: true, sourceType: 'script' },
    );

    const globalScope = scopeManager.globalScope!;
    // Current scope resolution still binds `a` even with a `with` block present.
    expect(globalScope.through.some(ref => ref.identifier.name === 'a')).toBe(
      false,
    );
    expect(
      globalScope.through.some(ref => ref.identifier.name === 'console'),
    ).toBe(true);
  });

  it('multiple var declarations resolve to the same global when opted-in', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      var a = 1;
      var a = 2;
      a;
    `,
      { resolveGlobalVarsInScript: true, sourceType: 'script' },
    );

    const globalScope = scopeManager.globalScope!;
    expect(globalScope.through.some(ref => ref.identifier.name === 'a')).toBe(
      false,
    );
    const aVar = globalScope.set.get('a');
    expect(aVar).toBeDefined();
    expect(aVar!.references.length).toBeGreaterThanOrEqual(1);
  });

  it('eval usage does not prevent static resolution when opted-in', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      var a = 1;
      eval('');
      a;
    `,
      { resolveGlobalVarsInScript: true, sourceType: 'script' },
    );

    const globalScope = scopeManager.globalScope!;
    expect(globalScope.through.some(ref => ref.identifier.name === 'a')).toBe(
      false,
    );
  });
});
