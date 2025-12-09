import { analyze } from '../../src/analyze';
import { ScopeType } from '../../src/scope';
import { parse, parseAndAnalyze } from '../test-utils';

describe('addGlobals', () => {
  it('binds unresolved globals to injected variables', () => {
    const ast = parse('foo = 1;');
    const scopeManager = analyze(ast);

    const globalScope = scopeManager.globalScope;
    expect(globalScope).not.toBeNull();
    const scope = globalScope!;
    expect(scope.type).toBe(ScopeType.global);
    expect(scope.through).toHaveLength(1);
    expect(scope.through[0].identifier.name).toBe('foo');

    scopeManager.addGlobals(['foo']);

    expect(scope.set.has('foo')).toBe(true);
    const variable = scope.set.get('foo');
    expect(variable).toBeDefined();
    expect(variable!.references).toHaveLength(1);
    expect(variable!.references[0].identifier.name).toBe('foo');
    expect(scope.through).toHaveLength(0);
  });

  it('is idempotent when called multiple times', () => {
    const ast = parse('foo;');
    const scopeManager = analyze(ast);
    const scope = scopeManager.globalScope!;

    scopeManager.addGlobals(['foo']);
    scopeManager.addGlobals(['foo']);

    const variable = scope.set.get('foo');
    expect(variable).toBeDefined();
    expect(variable!.references).toHaveLength(1);
    expect(scope.through).toHaveLength(0);
  });

  it('does not bind type references when globals are value-only', () => {
    const { scopeManager } = parseAndAnalyze('type T = Foo;');
    const scope = scopeManager.globalScope!;

    expect(scope.through).toHaveLength(1);
    const ref = scope.through[0];
    expect(ref.isTypeReference).toBe(true);
    expect(ref.resolved).toBeNull();

    scopeManager.addGlobals(['Foo']);

    const variable = scope.set.get('Foo');
    expect(variable).toBeDefined();
    expect(variable!.isTypeVariable).toBe(false);
    expect(variable!.references).toHaveLength(0);
    expect(scope.through).toHaveLength(1);
    expect(scope.through[0]).toBe(ref);
    expect(scope.through[0].resolved).toBeNull();
  });

  it('binds value refs but not type refs for the same injected name', () => {
    const { scopeManager } = parseAndAnalyze('type T = Foo; const x = Foo;');
    const scope = scopeManager.globalScope!;

    // Expect one type ref (Foo in type T) and one value ref (Foo in const x).
    const typeRefs = scope.through.filter(ref => ref.isTypeReference);
    const valueRefs = scope.through.filter(ref => !ref.isTypeReference);
    expect(typeRefs).toHaveLength(1);
    expect(valueRefs).toHaveLength(1);

    scopeManager.addGlobals(['Foo']);

    const variable = scope.set.get('Foo');
    expect(variable).toBeDefined();
    expect(variable!.isTypeVariable).toBe(false);

    // Value ref should bind.
    expect(variable!.references.some(ref => !ref.isTypeReference)).toBe(true);
    // Type ref should remain unresolved.
    expect(typeRefs[0].resolved).toBeNull();
    expect(scope.through).toContain(typeRefs[0]);
    // Only the type ref remains in through.
    expect(scope.through).toHaveLength(1);
  });

  it('does not bind dual (type+value) references for value-only globals', () => {
    const { scopeManager } = parseAndAnalyze('const x: typeof Foo = Foo;');
    const scope = scopeManager.globalScope!;

    const dualRefs = scope.through.filter(
      ref => ref.isTypeReference && !ref.isValueReference,
    );
    // In practice, the typeof Foo in the type position is a type ref; Foo in value position is a value ref.
    expect(scope.through.length).toBeGreaterThanOrEqual(2);

    scopeManager.addGlobals(['Foo']);

    const variable = scope.set.get('Foo');
    expect(variable).toBeDefined();
    expect(variable!.isTypeVariable).toBe(false);

    // Value side should bind.
    expect(variable!.references.some(ref => !ref.isTypeReference)).toBe(true);
    // Type side should remain unresolved.
    for (const ref of dualRefs) {
      expect(ref.resolved).toBeNull();
    }
  });

  it('binds multiple injected globals in one call', () => {
    const { scopeManager } = parseAndAnalyze('foo; bar; baz;');
    const scope = scopeManager.globalScope!;

    expect(scope.through).toHaveLength(3);
    scopeManager.addGlobals(['foo', 'bar', 'baz']);

    expect(scope.through).toHaveLength(0);
    expect(scope.set.has('foo')).toBe(true);
    expect(scope.set.has('bar')).toBe(true);
    expect(scope.set.has('baz')).toBe(true);
  });

  it('resolves references to global var declarations in script mode', () => {
    const { scopeManager } = parseAndAnalyze('var foo; console.log(foo);', {
      sourceType: 'script',
      resolveGlobalVarsInScript: true,
    });
    const scope = scopeManager.globalScope!;

    const foo = scope.set.get('foo');
    expect(foo).toBeDefined();
    expect(foo!.references.length).toBeGreaterThan(0);
    expect(scope.through).toHaveLength(1);
    expect(scope.through[0].identifier.name).toBe('console');
  });
});
