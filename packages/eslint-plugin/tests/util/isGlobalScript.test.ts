import { parseForESLint } from '@typescript-eslint/parser';

import { isGlobalScript } from '../../src/util/isGlobalScript.js';

function check(code: string, sourceType: 'module' | 'script' = 'module') {
  const { ast } = parseForESLint(code, { sourceType });
  return isGlobalScript({ ast });
}

describe(isGlobalScript, () => {
  it.for([
    [''],
    ['interface Array<T> { custom(): T[]; }'],
    ['declare function keys(o: object): string[];'],
    ['import x = Foo.bar;'],
    ['export as namespace Foo;'],
    ['declare global { interface String { custom(): string } }'],
    ['declare module "m" { export const a: 1; }'],
    ['namespace N { export const a = 1; }'],
    ['const x = import("m");'],
    ['function f() { return require("m"); }'],
  ] as const)(
    'returns true for a file with no top-level import or export: %s',
    ([code], { expect }) => {
      expect(check(code)).toBe(true);
    },
  );

  it.for([
    ['export {};'],
    ['export const a = 1;'],
    ['export interface Foo {}'],
    ['export declare function f(): void;'],
    ['export default 1;'],
    ['export * from "m";'],
    ['export * as ns from "m";'],
    ['export { a } from "m";'],
    ['import "m";'],
    ['import x from "m";'],
    ['import type { T } from "m";'],
    ['import x = require("m");'],
    ['export import x = require("m");'],
    ['export import x = Foo.bar;'],
    ['export = Foo;'],
    ['interface Array<T> {}\nexport {};'],
  ] as const)(
    'returns false for a file with a top-level import or export: %s',
    ([code], { expect }) => {
      expect(check(code)).toBe(false);
    },
  );

  it('returns true for a file parsed as a script with no import or export', () => {
    expect(check('interface Array<T> {}', 'script')).toBe(true);
  });

  it.for([
    ['interface Array<T> {}\nexport {};'],
    ['export const a = 1;'],
    ['import x = require("m");'],
    ['export = Foo;'],
  ] as const)(
    'returns false for a file parsed as a script with a top-level import or export: %s',
    ([code], { expect }) => {
      expect(check(code, 'script')).toBe(false);
    },
  );
});
