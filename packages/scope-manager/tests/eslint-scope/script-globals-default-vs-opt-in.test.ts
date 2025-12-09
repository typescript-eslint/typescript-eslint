import { ScopeType } from '../../src/scope';
import { parseAndAnalyze } from '../test-utils';

describe('script globals: default vs opt-in', () => {
  it('default (ESLint 8/9): globals stay through', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      console.log(a);
      var a = 1;
    `,
      { sourceType: 'script' },
    );

    const globalScope = scopeManager.globalScope!;
    const aVar = globalScope.set.get('a');
    expect(aVar).toBeDefined();

    // a is not resolved; remains in through
    expect(globalScope.through.some(ref => ref.identifier.name === 'a')).toBe(
      true,
    );
    // console is also through
    expect(
      globalScope.through.some(ref => ref.identifier.name === 'console'),
    ).toBe(true);
  });

  it('opt-in (ESLint 10): globals resolved in script mode', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      console.log(a);
      var a = 1;
    `,
      { sourceType: 'script', resolveGlobalVarsInScript: true },
    );

    const globalScope = scopeManager.globalScope!;
    expect(globalScope.type).toBe(ScopeType.global);
    const aVar = globalScope.set.get('a');
    expect(aVar).toBeDefined();

    // a is resolved; no longer in through
    expect(globalScope.through.some(ref => ref.identifier.name === 'a')).toBe(
      false,
    );
    // console still through
    expect(
      globalScope.through.some(ref => ref.identifier.name === 'console'),
    ).toBe(true);
  });

  it('dual type/value ref does not bind type side when globals injected', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      const x: typeof Foo = Foo;
    `,
      { sourceType: 'script', resolveGlobalVarsInScript: true },
    );

    scopeManager.addGlobals(['Foo']);

    const globalScope = scopeManager.globalScope!;
    const fooVar = globalScope.set.get('Foo');
    expect(fooVar).toBeDefined();

    // value ref can bind; type ref should remain unresolved (still in through)
    const valueRef = fooVar!.references.find(ref => ref.isValueReference);
    expect(valueRef).toBeDefined();
    // ensure injected variable did not pick up any type references
    expect(fooVar!.references.some(ref => ref.isTypeReference)).toBe(false);
  });

  it('function declarations resolve in script mode when opted-in', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      function foo() {}
      foo();
    `,
      { sourceType: 'script', resolveGlobalVarsInScript: true },
    );

    const globalScope = scopeManager.globalScope!;
    const fooVar = globalScope.set.get('foo');
    expect(fooVar).toBeDefined();
    expect(fooVar!.references.length).toBeGreaterThan(0);
    expect(globalScope.through.some(ref => ref.identifier.name === 'foo')).toBe(
      false,
    );
  });

  it('let/const resolve in script mode even when flag is false', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      let a = 1;
      const b = 2;
      console.log(a, b);
    `,
      { sourceType: 'script', resolveGlobalVarsInScript: false },
    );

    const globalScope = scopeManager.globalScope!;
    expect(globalScope.through.some(ref => ref.identifier.name === 'a')).toBe(
      false,
    );
    expect(globalScope.through.some(ref => ref.identifier.name === 'b')).toBe(
      false,
    );
    expect(
      globalScope.through.some(ref => ref.identifier.name === 'console'),
    ).toBe(true);
  });

  it('module mode is unaffected by the script flag', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      var a = 1;
      a;
    `,
      { sourceType: 'module', resolveGlobalVarsInScript: false },
    );

    // module scopes do not place var in the global scope set
    expect(scopeManager.globalScope!.set.has('a')).toBe(false);
  });

  it('class declarations resolve in script mode even when flag is false', () => {
    const { scopeManager } = parseAndAnalyze(
      `
      class Foo {}
      new Foo();
    `,
      { sourceType: 'script', resolveGlobalVarsInScript: false },
    );

    const globalScope = scopeManager.globalScope!;
    expect(globalScope.through.some(ref => ref.identifier.name === 'Foo')).toBe(
      false,
    );
    expect(
      globalScope.through.some(ref => ref.identifier.name === 'console'),
    ).toBe(false);
  });
});
