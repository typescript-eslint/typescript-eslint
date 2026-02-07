import { describe, it, expect } from 'vitest';

import type { ScopeManager } from '../src';
import type { Definition } from '../src/definition';

import { analyze } from '../src';
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

/**
 * Extracts a comparable snapshot from analyze() output:
 * - focuses on the global scope
 * - includes only the minimal information needed for comparison
 * - removes ordering dependencies by sorting
 */
function extractGlobalSnapshot(scopeManager: ScopeManager) {
  const globalScope = scopeManager.globalScope!;

  return {
    variables: [...globalScope.variables.values()]
      .map(variable => ({
        defs: variable.defs.map((def: Definition) => ({
          type: def.type,
        })),
        isTypeVariable: variable.isTypeVariable,
        isValueVariable: variable.isValueVariable,
        name: variable.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

describe('populateGlobalsFromLib – behavior snapshot', () => {
  it('es2018 globals snapshot stays stable', () => {
    const result = analyze(ast, { lib: ['es2018'] });
    const snapshot = extractGlobalSnapshot(result);

    expect(snapshot).toMatchSnapshot();
  });

  it('esnext.full globals snapshot stays stable', () => {
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

describe('populateGlobalsFromLib – error handling', () => {
  it('throws error for invalid lib name', () => {
    expect(() => {
      analyze(ast, { lib: ['invalid-lib-name' as never] });
    }).toThrowError('Invalid value for lib provided: invalid-lib-name');
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
    const combinedResult = analyze(ast, {
      lib: ['es5', 'es2015.promise', 'es2015.symbol'],
    });
    const es5OnlyResult = analyze(ast, { lib: ['es5'] });

    const combinedVars = new Set(
      [...combinedResult.globalScope!.variables.values()].map(v => v.name),
    );
    const es5Vars = new Set(
      [...es5OnlyResult.globalScope!.variables.values()].map(v => v.name),
    );

    for (const varName of es5Vars) {
      expect(combinedVars.has(varName)).toBe(true);
    }
    expect(combinedVars.has('Promise')).toBe(true);
    expect(combinedVars.has('Symbol')).toBe(true);
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

    const es2018OnlySnapshot = extractGlobalSnapshot(es2018Only);
    const es2018WithEs2017Snapshot = extractGlobalSnapshot(es2018WithEs2017);

    expect(es2018WithEs2017Snapshot).toEqual(es2018OnlySnapshot);
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
});
