import { describe, it, expect } from 'vitest';

import type { ScopeManager } from '../src';

import { analyze, ImplicitLibVariable } from '../src';
import { parse } from './test-utils';

// Test code that heavily relies on lib-provided globals
const CODE = `
const arr: Array<number> = [1, 2, 3];
const map: Map<string, number> = new Map();
const set: Set<string> = new Set();
const promise: Promise<void> = Promise.resolve();

function foo(): void {}

type T1 = Partial<{ a: number }>;
type T2 = Record<string, number>;
`;

const ast = parse(CODE, { range: true });

function pruneSnapshot(value: unknown): unknown {
  if (value == null || value === false) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const prunedItems = value
      .map(item => pruneSnapshot(item))
      .filter(item => item != null);

    return prunedItems.length === 0 ? undefined : prunedItems;
  }

  if (typeof value === 'object') {
    const prunedEntries = Object.entries(value)
      .map(([key, childValue]) => [key, pruneSnapshot(childValue)] as const)
      .filter(
        ([, childValue]) =>
          childValue != null &&
          (!Array.isArray(childValue) || childValue.length > 0) &&
          (typeof childValue !== 'object' ||
            Object.entries(childValue).length > 0),
      );

    return prunedEntries.length === 0
      ? undefined
      : Object.fromEntries(prunedEntries);
  }

  return value;
}

/**
 * Extracts a comparable snapshot from analyze() output:
 * - focuses on the global scope
 * - includes only the minimal information needed for comparison
 * - removes ordering dependencies by sorting
 */
function extractGlobalSnapshot(scopeManager: ScopeManager) {
  const globalScope = scopeManager.globalScope!;

  return pruneSnapshot({
    variables: Object.fromEntries(
      [...globalScope.variables.values()]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(variable => {
          const varKind =
            variable.isTypeVariable && variable.isValueVariable
              ? 'both'
              : variable.isTypeVariable
                ? 'type'
                : 'value';
          const defs = variable.defs.map(def => def.type);
          return [
            variable.name,
            defs.length === 0 ? varKind : { defs, variable: varKind },
          ];
        }),
    ),
  });
}

describe('populateGlobalsFromLib – behavior snapshot', () => {
  it('es2018 used globals snapshot stays stable', () => {
    const result = analyze(ast, { lib: ['es2018'] });
    const snapshot = extractGlobalSnapshot(result);

    expect(snapshot).toMatchSnapshot();
  });

  it('esnext.full used globals snapshot stays stable', () => {
    const result = analyze(ast, { lib: ['esnext.full'] });
    const snapshot = extractGlobalSnapshot(result);

    expect(snapshot).toMatchSnapshot();
  });

  it('no-lib baseline snapshot stays stable', () => {
    const result = analyze(ast, { lib: [] });
    const snapshot = extractGlobalSnapshot(result);

    expect(snapshot).toMatchSnapshot();
  });
});

describe('populateGlobalsFromLib – selective population', () => {
  it('does not populate unused globals', () => {
    const result = analyze(parse('const local = 1;', { range: true }), {
      lib: ['esnext.full'],
    });

    expect([...result.globalScope!.set.keys()].sort()).toEqual([
      'const',
      'local',
    ]);
  });

  it('populates only the referenced lib global', () => {
    const result = analyze(parse('const map = new Map();', { range: true }), {
      lib: ['es2015'],
    });

    expect([...result.globalScope!.set.keys()].sort()).toEqual([
      'Map',
      'const',
      'map',
    ]);
  });

  it('does not treat property names as referenced globals', () => {
    const result = analyze(
      parse('const object = { Map: 1 }; object.Map;', { range: true }),
      { lib: ['es2015'] },
    );

    expect([...result.globalScope!.set.keys()].sort()).toEqual([
      'const',
      'object',
    ]);
  });
});

describe('populateGlobalsFromLib – error handling', () => {
  it('throws error for invalid lib name', () => {
    expect(() => {
      analyze(ast, { lib: ['invalid-lib-name' as never] });
    }).toThrow('Invalid value for lib provided: invalid-lib-name');
  });
});

describe('populateGlobalsFromLib – lib dependency flattening', () => {
  it('es2018 includes all transitive dependencies from es2017, es2016, etc.', () => {
    const es2018Result = analyze(ast, { lib: ['es2018'] });
    const es5Result = analyze(ast, { lib: ['es5'] });

    const es2018Vars = new Set(
      [...es2018Result.globalScope!.variables.values()].map(v => v.name),
    );
    const es5Vars = new Set(
      [...es5Result.globalScope!.variables.values()].map(v => v.name),
    );

    for (const varName of es5Vars) {
      expect(es2018Vars.has(varName)).toBe(true);
    }

    expect(es2018Vars.size).toBeGreaterThan(es5Vars.size);
  });

  it('multiple libs are merged correctly', () => {
    const combinedResult = analyze(
      parse('type P = Promise<void>; type S = Symbol;', {
        range: true,
      }),
      {
        lib: ['es5', 'es2015.promise', 'es2015.symbol'],
      },
    );

    const combinedVars = combinedResult.globalScope!.set;
    expect(combinedVars.has('Promise')).toBe(true);
    expect(combinedVars.has('Symbol')).toBe(true);
  });

  it('resolves a global from a transitive lib dependency', () => {
    const result = analyze(
      parse('new SharedArrayBuffer(0);', { range: true }),
      {
        lib: ['es2018'],
      },
    );
    const sharedArrayBuffer = result.globalScope!.set.get('SharedArrayBuffer');
    const reference = result.globalScope!.references.find(
      reference => reference.identifier.name === 'SharedArrayBuffer',
    );

    expect(sharedArrayBuffer).toBeInstanceOf(ImplicitLibVariable);
    expect(reference?.resolved).toBe(sharedArrayBuffer);
  });
});

describe('populateGlobalsFromLib – deduplication', () => {
  it('duplicate libs in array produce same result as single lib', () => {
    const singleResult = analyze(ast, { lib: ['es2018'] });
    const duplicateResult = analyze(ast, {
      lib: ['es2018', 'es2018', 'es2018'],
    });

    const singleSnapshot = extractGlobalSnapshot(singleResult);
    const duplicateSnapshot = extractGlobalSnapshot(duplicateResult);

    expect(duplicateSnapshot).toEqual(singleSnapshot);
  });

  it('overlapping libs are deduplicated correctly', () => {
    const es2018Only = analyze(ast, { lib: ['es2018'] });
    const es2018WithEs2017 = analyze(ast, { lib: ['es2018', 'es2017'] });
    const reversedLibOrder = analyze(ast, { lib: ['es2017', 'es2018'] });

    const es2018OnlySnapshot = extractGlobalSnapshot(es2018Only);
    const es2018WithEs2017Snapshot = extractGlobalSnapshot(es2018WithEs2017);
    const reversedLibOrderSnapshot = extractGlobalSnapshot(reversedLibOrder);

    expect(es2018WithEs2017Snapshot).toEqual(es2018OnlySnapshot);
    expect(reversedLibOrderSnapshot).toEqual(es2018OnlySnapshot);
  });

  it('does not mix cached results for different lib sets', () => {
    const mapAst = parse('new Map();', { range: true });

    const es5Result = analyze(mapAst, { lib: ['es5'] });
    const es2015Result = analyze(mapAst, { lib: ['es2015'] });
    const repeatedEs5Result = analyze(mapAst, { lib: ['es5'] });

    expect(es5Result.globalScope!.set.has('Map')).toBe(false);
    expect(es2015Result.globalScope!.set.has('Map')).toBe(true);
    expect(repeatedEs5Result.globalScope!.set.has('Map')).toBe(false);
  });

  it('merges type and value definitions from overlapping libs', () => {
    const result = analyze(
      parse('type Items = Array<string>; const Constructor = Array;', {
        range: true,
      }),
      { lib: ['es2018'] },
    );
    const arrayVariable = result.globalScope!.set.get('Array');

    expect(arrayVariable?.isTypeVariable).toBe(true);
    expect(arrayVariable?.isValueVariable).toBe(true);
    expect(
      result
        .globalScope!.references.filter(
          reference => reference.identifier.name === 'Array',
        )
        .every(reference => reference.resolved === arrayVariable),
    ).toBe(true);
  });

  it('merges type and value definitions regardless of definition order', () => {
    const result = analyze(
      parse('type Items = Map<string, number>; const map = new Map();', {
        range: true,
      }),
      { lib: ['es2015.iterable', 'es2015.collection'] },
    );
    const mapVariable = result.globalScope!.set.get('Map');

    expect(mapVariable?.isTypeVariable).toBe(true);
    expect(mapVariable?.isValueVariable).toBe(true);
    expect(
      result
        .globalScope!.references.filter(
          reference => reference.identifier.name === 'Map',
        )
        .every(reference => reference.resolved === mapVariable),
    ).toBe(true);
  });
});

describe('populateGlobalsFromLib – const assertion global', () => {
  it('const type variable is always registered for const assertions', () => {
    const noLibResult = analyze(ast, { lib: [] });
    const globalScope = noLibResult.globalScope!;

    const constVar = [...globalScope.variables.values()].find(
      v => v.name === 'const',
    );

    expect(constVar).toBeDefined();
    expect(constVar?.isTypeVariable).toBe(true);
    expect(constVar?.isValueVariable).toBe(false);
  });

  it('const type variable exists alongside other lib globals', () => {
    const result = analyze(ast, { lib: ['es2018'] });
    const globalScope = result.globalScope!;

    const constVar = [...globalScope.variables.values()].find(
      v => v.name === 'const',
    );

    expect(constVar).toBeDefined();
    expect(constVar?.isTypeVariable).toBe(true);
    expect(constVar?.isValueVariable).toBe(false);
  });

  it.each(['{} as const', '<const>{}'])(
    'resolves the type reference created by %s',
    expression => {
      const result = analyze(
        parse(`const value = ${expression};`, { range: true }),
        { lib: [] },
      );
      const constVariable = result.globalScope!.set.get('const');

      expect(constVariable?.isTypeVariable).toBe(true);
      expect(constVariable?.isValueVariable).toBe(false);
      expect(constVariable?.references).toHaveLength(1);
      expect(constVariable?.references[0].resolved).toBe(constVariable);
    },
  );

  it('does not treat a const declaration as a reference to the special global', () => {
    const result = analyze(parse('const value = 1;', { range: true }), {
      lib: [],
    });

    expect(result.globalScope!.set.get('const')?.references).toHaveLength(0);
  });
});
