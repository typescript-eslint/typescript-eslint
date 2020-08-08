import {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import rule, {
  DEFAULT_IGNORED_REGEX_STRING,
  Options,
  MessageIds,
} from '../../src/rules/no-unused-vars-experimental';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

const hasExport = /^export/m;
// const hasImport = /^import .+? from ['"]/m;
function makeExternalModule<
  T extends ValidTestCase<Options> | InvalidTestCase<MessageIds, Options>
>(tests: T[]): T[] {
  return tests.map(t => {
    if (!hasExport.test(t.code)) {
      return {
        ...t,
        code: `${t.code}\nexport const __externalModule = 1;`,
      };
    }
    return t;
  });
}

const DEFAULT_IGNORED_REGEX = new RegExp(
  DEFAULT_IGNORED_REGEX_STRING,
).toString();
ruleTester.run('no-unused-vars-experimental', rule, {
  valid: makeExternalModule([
    ///////////////////////
    // #region variables //
    ///////////////////////
    { code: 'const _x = "unused"' },
    { code: 'export const x = "used";' },
    {
      code: `
const x = "used";
console.log(x);
      `,
    },
    {
      code: `
function foo() {}
foo();
      `,
    },
    { code: 'function _foo() {}' },
    {
      // decorators require the tsconfig compiler option
      // or else they are marked as unused because it is not a valid usage
      code: `
function decorator(_clazz: any) {}

@decorator
export class Foo {}
      `,
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: rootDir,
      },
    },
    {
      code: `
type Foo = { a?: string };
export const foo: Foo = {};
      `,
    },
    {
      code: `
interface Foo { a?: string };
export const foo: Foo = {};
      `,
    },
    { code: 'type _Foo = { a?: string };' },
    { code: 'interface _Foo { a?: string };' },
    {
      code: `
class Foo {}
new Foo();
      `,
    },
    { code: 'class _Foo {}' },
    {
      code: `
export class Foo {
  private foo: string;
  bar() {
    console.log(this.foo);
  }
}
      `,
    },
    {
      code: `
export class Foo {
  private _foo: string;
}
      `,
    },
    {
      code: `
export class Foo {
  private foo() {};
  bar() {
    this.foo();
  }
}
      `,
    },
    {
      code: `
export class Foo {
  private _foo() {};
}
      `,
    },
    {
      code: `
enum Foo { a = 1 }
console.log(Foo.a);
      `,
    },
    { code: 'enum _Foo { a = 1 }' },
    { code: 'export const {a, b} = c;' },
    {
      code: `
const {a, b: {c}} = d;
console.log(a, c);
      `,
    },
    {
      code: `
const {a, b} = c;
console.log(a, b);
      `,
    },
    {
      code: `
const {a: _a, b} = c;
console.log(b);
      `,
    },
    { code: `const {a: _a, b: _b} = c;` },
    { code: 'export const [a, b] = c;' },
    {
      code: `
const [a, b] = c;
console.log(a, b);
      `,
    },
    {
      code: `
const [a, [b]] = c;
console.log(a, b);
      `,
    },
    {
      code: `
const [_a, b] = c;
console.log(b);
      `,
    },
    { code: `const [_a, _b] = c;` },
    // #endregion variables //
    //////////////////////////

    ////////////////////////
    // #region parameters //
    ////////////////////////
    {
      code: `
export function foo(a) {
  console.log(a);
}
      `,
    },
    {
      code: `
export function foo(a: string, b: string) {
  console.log(b);
}
      `,
      options: [
        {
          ignoreArgsIfArgsAfterAreUsed: true,
        },
      ],
    },
    {
      code: `
export class Clazz {
  constructor(a: string, public b: string) {}
}
      `,
      options: [
        {
          ignoreArgsIfArgsAfterAreUsed: true,
        },
      ],
    },
    {
      code: `
export class Clazz {
  constructor(private a: string, public b: string) {}
}
      `,
      options: [
        {
          ignoreArgsIfArgsAfterAreUsed: true,
        },
      ],
    },
    {
      code: `
export class Clazz {
  constructor(private a: string) {}
  foo() { console.log(this.a) }
}
      `,
    },
    { code: 'export function foo({a: _a}) {}' },
    { code: 'export function foo({a: { b: _b }}) {}' },
    { code: 'export function foo([_a]) {}' },
    { code: 'export function foo([[_a]]) {}' },
    {
      code: `
export function foo({a: _a}, used) {
  console.log(used);
}
      `,
      options: [
        {
          ignoreArgsIfArgsAfterAreUsed: true,
        },
      ],
    },
    {
      code: `
export function foo({a: { b: _b }}, used) {
  console.log(used);
}
      `,
      options: [
        {
          ignoreArgsIfArgsAfterAreUsed: true,
        },
      ],
    },
    {
      code: `
export function foo([_a], used) {
  console.log(used);
}
      `,
      options: [
        {
          ignoreArgsIfArgsAfterAreUsed: true,
        },
      ],
    },
    {
      code: `
export function foo([[_a]], used) {
  console.log(used);
}
      `,
      options: [
        {
          ignoreArgsIfArgsAfterAreUsed: true,
        },
      ],
    },
    // #endregion parameters //
    ///////////////////////////

    ////////////////////
    // #region import //
    ////////////////////
    {
      code: `
import defaultImp from "thing";
console.log(defaultImp);
      `,
    },
    {
      code: `
import { named } from "thing";
console.log(named);
      `,
    },
    {
      code: `
import defaultImp, { named } from "thing";
console.log(defaultImp, named);
      `,
    },
    {
      code: `
import defaultImp = require("thing");
console.log(defaultImp, named);
      `,
    },
    {
      code: `
import * as namespace from "thing";
console.log(namespace);
      `,
    },
    {
      code: `
import defaultImp, * as namespace from "thing";
console.log(defaultImp, namespace);
      `,
    },
    { code: 'import _defaultImp from "thing";' },
    { code: 'import { named as _named } from "thing";' },
    { code: 'import _defaultImp, { named as _named } from "thing";' },
    { code: 'import _defaultImp = require("thing");' },
    { code: 'import * as _namespace from "thing";' },
    { code: 'import _defaultImp, * as _namespace from "thing";' },
    // #endregion import //
    ///////////////////////

    //////////////////////
    // #region generics //
    //////////////////////
    { code: 'export function foo<T>(): T {}' },
    { code: 'export function foo<T, T2>(): T & T2 {}' },
    { code: 'export function foo<T, _T2>(): T {}' },
    {
      code: `
export class foo<T> {
  prop: T
}
      `,
    },
    {
      code: `
export class foo<T, T2> {
  prop: T
  prop2: T2
}
      `,
    },
    {
      code: `
export class foo<T, _T2> {
  prop: T
  prop2: T2
}
      `,
    },
    {
      code: `
export interface foo<T> {
  prop: T
}
      `,
    },
    {
      code: `
export interface foo<T, T2> {
  prop: T
  prop2: T2
}
      `,
    },
    {
      code: `
export interface foo<T, _T2> {
  prop: T
  prop2: T2
}
      `,
    },
    {
      code: `
export type foo<T> = {
  prop: T

}
      `,
    },
    {
      code: `
export type foo<T, T2> = {
  prop: T
  prop2: T2
}
      `,
    },
    {
      code: `
export type foo<T, _T2> = {
  prop: T
  prop2: T2
}
      `,
    },
    // #endregion generics //
    /////////////////////////
  ]),
  invalid: makeExternalModule([
    ///////////////////////
    // #region variables //
    ///////////////////////
    {
      code: 'const x = "unused"',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'x',
            type: 'Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 7,
          endColumn: 8,
        },
      ],
    },
    {
      code: 'const x: string = "unused"',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'x',
            type: 'Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 7,
          endColumn: 16,
        },
      ],
    },
    {
      code: 'const x = "unused"',
      options: [
        {
          ignoredNamesRegex: false,
        },
      ],
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'x',
            type: 'Variable',
          },
          line: 1,
          column: 7,
          endColumn: 8,
        },
      ],
    },
    {
      code: 'function foo() {}',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'foo',
            type: 'Function',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 10,
          endColumn: 13,
        },
      ],
    },
    {
      code: 'type Foo = { a?: string };',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'Foo',
            type: 'Type',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 6,
          endColumn: 9,
        },
      ],
    },
    {
      code: 'interface Foo { a?: string };',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'Foo',
            type: 'Interface',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 11,
          endColumn: 14,
        },
      ],
    },
    {
      code: 'class Foo {}',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'Foo',
            type: 'Class',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 7,
          endColumn: 10,
        },
      ],
    },
    {
      code: `
export class Foo {
  private foo: string;
}
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'foo',
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            type: 'Property',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 3,
          column: 11,
          endColumn: 14,
        },
      ],
    },
    {
      code: `
export class Foo {
  private foo() {};
}
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'foo',
            type: 'Method',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 3,
          column: 11,
          endColumn: 14,
        },
      ],
    },
    {
      code: 'enum Foo { a = 1 }',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'Foo',
            type: 'Enum',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 6,
          endColumn: 9,
        },
      ],
    },
    {
      code: `
const {foo, bar} = baz;
console.log(foo);
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'bar',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 2,
          column: 13,
          endColumn: 16,
        },
      ],
    },
    {
      code: `
const [foo, bar] = baz;
console.log(foo);
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'bar',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 2,
          column: 13,
          endColumn: 16,
        },
      ],
    },
    {
      code: 'const {foo, bar} = baz;',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'foo',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 8,
          endColumn: 11,
        },
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'bar',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 13,
          endColumn: 16,
        },
      ],
    },
    {
      code: 'const {foo, bar: _bar} = baz;',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'foo',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 8,
          endColumn: 11,
        },
      ],
    },
    {
      code: 'const [foo, bar] = baz;',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'foo',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 8,
          endColumn: 11,
        },
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'bar',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 13,
          endColumn: 16,
        },
      ],
    },
    {
      code: 'const [foo, _bar] = baz;',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'foo',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 8,
          endColumn: 11,
        },
      ],
    },
    {
      code: 'const [foo, [bar]] = baz;',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'foo',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 8,
          endColumn: 11,
        },
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'bar',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 14,
          endColumn: 17,
        },
      ],
    },
    {
      code: 'const {foo, bar: {baz}} = bam;',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'foo',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 8,
          endColumn: 11,
        },
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'baz',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 19,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'const {foo, bar: [baz]} = bam;',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'foo',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 8,
          endColumn: 11,
        },
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'baz',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 19,
          endColumn: 22,
        },
      ],
    },
    // #endregion variables //
    //////////////////////////

    ////////////////////////
    // #region parameters //
    ////////////////////////
    {
      code: `
export function foo(a, b) {
  console.log(b);
}
      `,
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'a',
            type: 'Parameter',
          },
          line: 2,
          column: 21,
          endColumn: 22,
        },
      ],
    },
    {
      code: `
export function foo(a: string, b: string) {
  console.log(b);
}
      `,
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'a',
            type: 'Parameter',
          },
          line: 2,
          column: 21,
          endColumn: 30,
        },
      ],
    },
    {
      code: `
export class Clazz {
  constructor(a: string, b: string) {
    console.log(b);
  }
}
      `,
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'a',
            type: 'Parameter',
          },
          line: 3,
          column: 15,
          endColumn: 24,
        },
      ],
    },
    {
      code: `
export class Clazz {
  constructor(a: string, public b: string) {}
}
      `,
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'a',
            type: 'Parameter',
          },
          line: 3,
          column: 15,
          endColumn: 24,
        },
      ],
    },
    {
      code: `
export function foo({a}, used) {
  console.log(used);
}
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'a',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 2,
          column: 22,
          endColumn: 23,
        },
      ],
    },
    {
      code: `
export function foo({a: {b}}, used) {
  console.log(used);
}
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'b',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 2,
          column: 26,
          endColumn: 27,
        },
      ],
    },
    {
      code: `
export function foo([a], used) {
  console.log(used);
}
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'a',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 2,
          column: 22,
          endColumn: 23,
        },
      ],
    },
    {
      code: `
export function foo([[a]], used) {
  console.log(used);
}
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'a',
            type: 'Destructured Variable',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 2,
          column: 23,
          endColumn: 24,
        },
      ],
    },
    // #endregion parameters //
    ///////////////////////////

    ////////////////////
    // #region import //
    ////////////////////
    {
      code: 'import foo = require("test")',
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'foo',
            type: 'Import',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 1,
          column: 8,
          endColumn: 11,
        },
      ],
    },
    {
      code: 'import defaultImp from "thing";',
      errors: [
        {
          messageId: 'unusedImport',
          line: 1,
          column: 1,
          endColumn: 32,
        },
      ],
    },
    {
      code: 'import { named } from "thing";',
      errors: [
        {
          messageId: 'unusedImport',
          line: 1,
          column: 1,
          endColumn: 31,
        },
      ],
    },
    {
      code: 'import * as namespace from "thing";',
      errors: [
        {
          messageId: 'unusedImport',
          line: 1,
          column: 1,
          endColumn: 36,
        },
      ],
    },
    {
      code: 'import defaultImp, { named } from "thing";',
      errors: [
        {
          messageId: 'unusedImport',
          line: 1,
          column: 1,
          endColumn: 43,
        },
      ],
    },
    {
      code: 'import defaultImp, * as namespace from "thing";',
      errors: [
        {
          messageId: 'unusedImport',
          line: 1,
          column: 1,
          endColumn: 48,
        },
      ],
    },
    {
      code: `
import defaultImp, { named } from "thing";
console.log(named);
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'defaultImp',
            type: 'Import',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 2,
          column: 8,
          endColumn: 18,
        },
      ],
    },
    {
      code: `
import defaultImp, * as named from "thing";
console.log(named);
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'defaultImp',
            type: 'Import',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 2,
          column: 8,
          endColumn: 18,
        },
      ],
    },
    {
      code: `
import defaultImp, * as named from "thing";
console.log(defaultImp);
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'named',
            type: 'Import',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 2,
          column: 25,
          endColumn: 30,
        },
      ],
    },
    {
      code: `
import defaultImp, { named } from "thing";
console.log(defaultImp);
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'named',
            type: 'Import',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 2,
          column: 22,
          endColumn: 27,
        },
      ],
    },
    {
      code: `
import { named1, named2 } from "thing";
console.log(named1);
      `,
      errors: [
        {
          messageId: 'unusedWithIgnorePattern',
          data: {
            name: 'named2',
            type: 'Import',
            pattern: DEFAULT_IGNORED_REGEX,
          },
          line: 2,
          column: 18,
          endColumn: 24,
        },
      ],
    },
    // #endregion import //
    ///////////////////////

    //////////////////////
    // #region generics //
    //////////////////////
    {
      code: 'export function foo<T>() {}',
      errors: [
        {
          messageId: 'unusedTypeParameters',
          line: 1,
          column: 20,
          endColumn: 23,
        },
      ],
    },
    {
      code: 'export function foo<T, T2>() {}',
      errors: [
        {
          messageId: 'unusedTypeParameters',
          line: 1,
          column: 20,
          endColumn: 27,
        },
      ],
    },
    {
      code: 'export function foo<T, T2>(): T2 {}',
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'T',
            type: 'Type Parameter',
          },
          line: 1,
          column: 21,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'export function foo<T, _T2>() {}',
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'T',
            type: 'Type Parameter',
          },
          line: 1,
          column: 21,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'export class foo<T> {}',
      errors: [
        {
          messageId: 'unusedTypeParameters',
          line: 1,
          column: 17,
          endColumn: 20,
        },
      ],
    },
    {
      code: 'export class foo<T, T2> {}',
      errors: [
        {
          messageId: 'unusedTypeParameters',
          line: 1,
          column: 17,
          endColumn: 24,
        },
      ],
    },
    {
      code: `
export class foo<T, T2> {
  prop: T2
}
      `,
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'T',
            type: 'Type Parameter',
          },
          line: 2,
          column: 18,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'export class foo<T, _T2> {}',
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'T',
            type: 'Type Parameter',
          },
          line: 1,
          column: 18,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'export interface foo<T> {}',
      errors: [
        {
          messageId: 'unusedTypeParameters',
          line: 1,
          column: 21,
          endColumn: 24,
        },
      ],
    },
    {
      code: 'export interface foo<T, T2> {}',
      errors: [
        {
          messageId: 'unusedTypeParameters',
          line: 1,
          column: 21,
          endColumn: 28,
        },
      ],
    },
    {
      code: `
export interface foo<T, T2> {
  prop: T2
}
      `,
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'T',
            type: 'Type Parameter',
          },
          line: 2,
          column: 22,
          endColumn: 23,
        },
      ],
    },
    {
      code: 'export interface foo<T, _T2> {}',
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'T',
            type: 'Type Parameter',
          },
          line: 1,
          column: 22,
          endColumn: 23,
        },
      ],
    },
    {
      code: 'export type foo<T> = {}',
      errors: [
        {
          messageId: 'unusedTypeParameters',
          line: 1,
          column: 16,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'export type foo<T, T2> = {}',
      errors: [
        {
          messageId: 'unusedTypeParameters',
          line: 1,
          column: 16,
          endColumn: 23,
        },
      ],
    },
    {
      code: `
export type foo<T, T2> = {
  prop: T2
}
      `,
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'T',
            type: 'Type Parameter',
          },
          line: 2,
          column: 17,
          endColumn: 18,
        },
      ],
    },
    {
      code: 'export type foo<T, _T2> = {}',
      errors: [
        {
          messageId: 'unused',
          data: {
            name: 'T',
            type: 'Type Parameter',
          },
          line: 1,
          column: 17,
          endColumn: 18,
        },
      ],
    },
    // #endregion generics //
    /////////////////////////
  ]),
});
