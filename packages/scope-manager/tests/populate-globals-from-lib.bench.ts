import { describe, test } from 'vitest';

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
    test('simple code', async ({ bench }) => {
      await bench('simple code', () => {
        analyze(simpleAst, { lib: ['es5'] });
      }).run();
    });
  });

  describe('es2018', () => {
    test('medium code', async ({ bench }) => {
      await bench('medium code', () => {
        analyze(mediumAst, { lib: ['es2018'] });
      }).run();
    });
  });

  describe('esnext.full', () => {
    test('complex code', async ({ bench }) => {
      await bench('complex code', () => {
        analyze(complexAst, { lib: ['esnext.full'] });
      }).run();
    });
  });

  describe('repeated analyze (cache signal)', () => {
    test('100x analyze with esnext.full', async ({ bench }) => {
      await bench('100x analyze with esnext.full', () => {
        for (let i = 0; i < 100; i++) {
          analyze(simpleAst, { lib: ['esnext.full'] });
        }
      }).run();
    });
  });
});
