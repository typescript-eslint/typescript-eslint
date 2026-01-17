import { bench, describe } from 'vitest';

import { analyze } from '../src';
import { parse } from './test-utils';

const SIMPLE_CODE = `const x = 1;`;

const MEDIUM_CODE = `
const arr: Array<number> = [1, 2, 3];
const map: Map<string, number> = new Map();
const set: Set<string> = new Set();
const promise: Promise<void> = Promise.resolve();
`;

const COMPLEX_CODE = `
const map: Map<string, number> = new Map();
const set: Set<string> = new Set();
const weakMap: WeakMap<object, string> = new WeakMap();
const promise: Promise<void> = Promise.resolve();
const symbol: symbol = Symbol('test');

type T1 = Partial<{ a: number }>;
type T2 = Record<string, number>;

declare const document: Document;
declare const window: Window;
`;

const simpleAst = parse(SIMPLE_CODE, { range: true });
const mediumAst = parse(MEDIUM_CODE, { range: true });
const complexAst = parse(COMPLEX_CODE, { range: true });

describe('populateGlobalsFromLib performance', () => {
  describe('es5', () => {
    bench('simple code', () => {
      analyze(simpleAst, { lib: ['es5'] });
    });
  });

  describe('es2018', () => {
    bench('medium code', () => {
      analyze(mediumAst, { lib: ['es2018'] });
    });
  });

  describe('esnext.full', () => {
    bench('complex code', () => {
      analyze(complexAst, { lib: ['esnext.full'] });
    });
  });

  describe('repeated analyze (cache signal)', () => {
    bench('100x analyze with esnext.full', () => {
      for (let i = 0; i < 100; i++) {
        analyze(simpleAst, { lib: ['esnext.full'] });
      }
    });
  });
});
