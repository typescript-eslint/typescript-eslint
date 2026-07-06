import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/types';
import { describe, it, expect } from 'vitest';

import { analyze, ScopeManager } from '../src';
import { Referencer } from '../src/referencer';
import { parse } from './test-utils';

// Test code that heavily relies on lib-provided globals
const CODE = `
const arr: Array<number> = [1, 2, 3];
const map: Map<string, number> = new Map();
const set: Set<string> = new Set();
const promise: Promise<void> = Promise.resolve();
const symbol: symbol = Symbol('test');

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

function getGlobalVariableNames(scopeManager: ScopeManager): string[] {
  return [...scopeManager.globalScope!.variables.values()]
    .map(variable => variable.name)
    .sort((a, b) => a.localeCompare(b));
}

describe('populateGlobalsFromLib – behavior', () => {
  const expectedNames = [
    'arr',
    'Array',
    'const',
    'foo',
    'map',
    'Map',
    'Partial',
    'promise',
    'Promise',
    'Record',
    'set',
    'Set',
    'symbol',
    'Symbol',
    'T1',
    'T2',
  ];

  it('es2018 materializes only globals whose names appear in the program', () => {
    const result = analyze(ast, { lib: ['es2018'] });

    expect(getGlobalVariableNames(result)).toEqual(expectedNames);
  });

  it('esnext.full materializes only globals whose names appear in the program', () => {
    const result = analyze(ast, { lib: ['esnext.full'] });

    expect(getGlobalVariableNames(result)).toEqual(expectedNames);
  });

  it('no-lib baseline only contains declared variables plus const', () => {
    const result = analyze(ast, { lib: [] });

    expect(getGlobalVariableNames(result)).toEqual([
      'arr',
      'const',
      'foo',
      'map',
      'promise',
      'set',
      'symbol',
      'T1',
      'T2',
    ]);
  });

  it('uses comment identifier tokens as candidates', () => {
    const commentAst = parse('/* global Array */', {
      comment: true,
      range: true,
    });
    const result = analyze(commentAst, { lib: ['es5'] });

    expect(getGlobalVariableNames(result)).toEqual(['Array', 'const']);
  });

  it('uses JSX identifiers as candidates', () => {
    const jsxAst = parse('const element = <Map />;', {
      jsx: true,
      range: true,
    });
    const result = analyze(jsxAst, { lib: ['es2015.collection'] });
    const names = getGlobalVariableNames(result);

    expect(names).toContain('Map');
    expect(names).not.toContain('Set');
  });

  it('uses fallback child keys without traversing parent links', () => {
    const fallbackAst = parse('/* see Map */', {
      comment: true,
      range: true,
    });

    (fallbackAst as unknown as { body: unknown[] }).body.push({
      parent: {
        name: 'WeakMap',
        type: AST_NODE_TYPES.Identifier,
      },
      type: 'TestNode',
      value: {
        name: 'Set',
        type: AST_NODE_TYPES.Identifier,
      },
      values: [
        {
          name: 'WeakSet',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    });
    (fallbackAst as unknown as { comments: unknown[] }).comments.unshift(
      null,
      { type: AST_TOKEN_TYPES.Block },
      42,
    );

    const scopeManager = new ScopeManager({ sourceType: 'script' });
    const referencer = new Referencer(
      {
        jsxFragmentName: null,
        jsxPragma: 'React',
        lib: ['es2015.collection'],
      },
      scopeManager,
    );

    referencer.visit(fallbackAst);

    expect(getGlobalVariableNames(scopeManager)).toEqual([
      'const',
      'Map',
      'Set',
      'WeakSet',
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
