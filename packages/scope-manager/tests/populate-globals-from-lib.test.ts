import { describe, it, expect } from 'vitest';

import type { ScopeManager } from '../src';
import { analyze } from '../src';
import type { Definition } from '../src/definition';
import { parse } from './test-utils';

// 테스트용 코드 (lib 전역을 폭넓게 사용)
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
 * analyze 결과에서
 * - global scope
 * - 비교 가능한 최소 정보만 추출
 * - 순서 의존성 제거
 */
function extractGlobalSnapshot(scopeManager: ScopeManager) {
  const globalScope = scopeManager.globalScope!;

  return {
    variables: [...globalScope.variables.values()]
      .map(variable => ({
        name: variable.name,
        isTypeVariable: variable.isTypeVariable,
        isValueVariable: variable.isValueVariable,
        defs: variable.defs.map((def: Definition) => ({
          type: def.type,
        })),
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

    // es2018은 es5의 모든 전역 변수를 포함해야 함
    for (const varName of es5Vars) {
      expect(es2018Vars.has(varName)).toBe(true);
    }

    // es2018은 es5보다 더 많은 전역 변수를 가져야 함 (Promise, Symbol 등)
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

    // combined는 es5의 모든 변수 + Promise, Symbol을 포함해야 함
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
    // es2018은 이미 es2017을 포함하므로, 명시적으로 es2017을 추가해도 결과가 같아야 함
    const es2018Only = analyze(ast, { lib: ['es2018'] });
    const es2018WithEs2017 = analyze(ast, { lib: ['es2018', 'es2017'] });

    const es2018OnlySnapshot = extractGlobalSnapshot(es2018Only);
    const es2018WithEs2017Snapshot = extractGlobalSnapshot(es2018WithEs2017);

    expect(es2018WithEs2017Snapshot).toEqual(es2018OnlySnapshot);
  });
});

describe('populateGlobalsFromLib – const assertion global', () => {
  it('const type variable is always registered for const assertions', () => {
    // lib이 비어있어도 const 타입 변수는 등록되어야 함
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
