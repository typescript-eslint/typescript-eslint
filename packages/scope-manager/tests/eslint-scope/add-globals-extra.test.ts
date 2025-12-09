import { ScopeManager } from '../../src/ScopeManager';
import { parseAndAnalyze } from '../test-utils';

describe('addGlobals (extra cases)', () => {
  it('deduplicates and binds multiple globals', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      console.log(a, b);
    `,
      { resolveGlobalVarsInScript: false, sourceType: 'script' },
    );

    scopeManager.addGlobals(['a', 'a', 'b']);

    const globalScope = scopeManager.globalScope!;

    const varA = globalScope.set.get('a');
    const varB = globalScope.set.get('b');
    expect(varA).toBeDefined();
    expect(varB).toBeDefined();

    expect(varA!.references.some(ref => ref.identifier.name === 'a')).toBe(
      true,
    );
    expect(varB!.references.some(ref => ref.identifier.name === 'b')).toBe(
      true,
    );

    // console remains unresolved
    expect(
      globalScope.through.some(ref => ref.identifier.name === 'console'),
    ).toBe(true);
  });

  it('ignores non-string/empty names', () => {
    const { scopeManager } = parseAndAnalyze('console.log(x);', {
      resolveGlobalVarsInScript: false,
      sourceType: 'script',
    });

    // @ts-expect-error testing defensive handling
    scopeManager.addGlobals(['', null, 'x']);

    const globalScope = scopeManager.globalScope!;
    const varX = globalScope.set.get('x');
    expect(varX).toBeDefined();
    expect(varX!.references).toHaveLength(1);

    expect(
      globalScope.through.some(ref => ref.identifier.name === 'console'),
    ).toBe(true);
  });

  it('does not double-bind when a global already exists', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      var a = 1;
      console.log(a);
    `,
      { resolveGlobalVarsInScript: true, sourceType: 'script' },
    );

    const beforeThrough = [...scopeManager.globalScope!.through];

    scopeManager.addGlobals(['a']);

    const globalScope = scopeManager.globalScope!;
    const varA = globalScope.set.get('a');
    expect(varA).toBeDefined();

    // through should not gain duplicates; console remains, a is resolved
    expect(
      globalScope.through.some(ref => ref.identifier.name === 'console'),
    ).toBe(true);
    expect(globalScope.through.some(ref => ref.identifier.name === 'a')).toBe(
      false,
    );
    // sanity: through size does not grow after addGlobals
    expect(globalScope.through).toHaveLength(beforeThrough.length);
  });

  it('removes implicit unresolved when injected', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      foo = 1;
    `,
      { resolveGlobalVarsInScript: false, sourceType: 'script' },
    );

    const globalScope = scopeManager.globalScope!;
    expect(globalScope.through.some(ref => ref.identifier.name === 'foo')).toBe(
      true,
    );

    scopeManager.addGlobals(['foo']);

    expect(globalScope.through.some(ref => ref.identifier.name === 'foo')).toBe(
      false,
    );
  });

  it('handles an empty names array as a no-op', () => {
    const { scopeManager } = parseAndAnalyze('foo;', {
      resolveGlobalVarsInScript: false,
      sourceType: 'script',
    });
    const throughBefore = scopeManager.globalScope!.through.length;
    scopeManager.addGlobals([]);
    expect(scopeManager.globalScope!.through).toHaveLength(throughBefore);
  });

  it('handles multiple addGlobals calls with different names', () => {
    const { scopeManager } = parseAndAnalyze('foo; bar; baz;', {
      resolveGlobalVarsInScript: false,
      sourceType: 'script',
    });

    scopeManager.addGlobals(['foo']);
    scopeManager.addGlobals(['bar']);

    const throughNames = scopeManager.globalScope!.through.map(
      ref => ref.identifier.name,
    );
    expect(throughNames).toEqual(['baz']);
  });

  it('is a no-op when names is not an array', () => {
    const { scopeManager } = parseAndAnalyze('foo;', {
      resolveGlobalVarsInScript: false,
      sourceType: 'script',
    });
    const throughBefore = scopeManager.globalScope!.through.length;
    // @ts-expect-error testing defensive branch
    scopeManager.addGlobals(null);
    expect(scopeManager.globalScope!.through).toHaveLength(throughBefore);
  });

  it('typeof query in type position does not bind to value-only globals', () => {
    const { scopeManager } = parseAndAnalyze('type X = typeof foo;', {
      resolveGlobalVarsInScript: false,
      sourceType: 'script',
    });
    const globalScope = scopeManager.globalScope!;

    scopeManager.addGlobals(['foo']);

    const fooVar = globalScope.set.get('foo');
    expect(fooVar).toBeDefined();
    // Injected variable should not pick up type-only references even if ESLint treats them as globals.
    expect(fooVar!.references.some(ref => ref.isTypeReference)).toBe(false);
  });

  it('binds value-side heritage references for injected globals', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      class MyErr extends Error {}
      new MyErr();
    `,
      { resolveGlobalVarsInScript: false, sourceType: 'script' },
    );

    const globalScope = scopeManager.globalScope!;
    // Before injection, Error should be unresolved.
    expect(
      globalScope.through.some(ref => ref.identifier.name === 'Error'),
    ).toBe(true);

    scopeManager.addGlobals(['Error']);

    const errorVar = globalScope.set.get('Error');
    expect(errorVar).toBeDefined();
    // Ensure at least the value-side reference (heritage) is bound.
    expect(
      errorVar!.references.some(
        ref => ref.identifier.name === 'Error' && ref.isValueReference,
      ),
    ).toBe(true);
    // No type references should be attached to the injected global by default.
    expect(errorVar!.references.some(ref => ref.isTypeReference)).toBe(false);
  });

  it('type-only refs remain unresolved for injected globals', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      type Only = GlobalType;
    `,
      { resolveGlobalVarsInScript: false, sourceType: 'script' },
    );

    scopeManager.addGlobals(['GlobalType']);
    const globalScope = scopeManager.globalScope!;
    expect(
      globalScope.through.some(ref => ref.identifier.name === 'GlobalType'),
    ).toBe(true);
    const varGlobal = globalScope.set.get('GlobalType');
    expect(varGlobal).toBeDefined();
    expect(varGlobal!.references.some(ref => ref.isTypeReference)).toBe(false);
  });

  it('no-ops when globalScope is null', () => {
    const scopeManager = new ScopeManager({ sourceType: 'script' });
    scopeManager.addGlobals(['foo']);
    expect(scopeManager.globalScope).toBeNull();
  });

  it('tolerates missing implicit state', () => {
    const { scopeManager } = parseAndAnalyze('foo;', {
      resolveGlobalVarsInScript: false,
      sourceType: 'script',
    });

    const globalScope = scopeManager.globalScope!;
    delete (globalScope as unknown as { implicit?: unknown }).implicit;

    scopeManager.addGlobals(['foo']);
    expect(globalScope.through.some(ref => ref.identifier.name === 'foo')).toBe(
      false,
    );
  });

  it('tolerates non-array implicit leftToBeResolved', () => {
    const { scopeManager } = parseAndAnalyze('foo;', {
      resolveGlobalVarsInScript: false,
      sourceType: 'script',
    });

    const globalScope = scopeManager.globalScope!;
    (
      globalScope as unknown as { implicit?: { leftToBeResolved: unknown } }
    ).implicit = { leftToBeResolved: null };

    scopeManager.addGlobals(['foo']);
    expect(globalScope.through.some(ref => ref.identifier.name === 'foo')).toBe(
      false,
    );
  });
});
