import type {
  InvalidTestCase,
  TestCaseError,
} from '@typescript-eslint/rule-tester';

import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

import type {
  MessageId,
  Options,
} from '../../src/rules/no-unnecessary-condition';

import rule from '../../src/rules/no-unnecessary-condition';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

const optionsWithExactOptionalPropertyTypes = {
  project: './tsconfig.exactOptionalPropertyTypes.json',
  tsconfigRootDir: rootPath,
};

const ruleError = (
  line: number,
  column: number,
  messageId: MessageId,
): TestCaseError<MessageId> => ({
  column,
  line,
  messageId,
});

const necessaryConditionTest = (condition: string): string => `
declare const b1: ${condition};
declare const b2: boolean;
const t1 = b1 && b2;
`;

const unnecessaryConditionTest = (
  condition: string,
  messageId: MessageId,
): InvalidTestCase<MessageId, Options> => ({
  code: necessaryConditionTest(condition),
  errors: [ruleError(4, 12, messageId)],
});

ruleTester.run('no-unnecessary-condition', rule, {
  valid: [
    `
declare const b1: boolean;
declare const b2: boolean;
const t1 = b1 && b2;
const t2 = b1 || b2;
if (b1 && b2) {
}
while (b1 && b2) {}
for (let i = 0; b1 && b2; i++) {
  break;
}
const t1 = b1 && b2 ? 'yes' : 'no';
if (b1 && b2) {
}
while (b1 && b2) {}
for (let i = 0; b1 && b2; i++) {
  break;
}
const t1 = b1 && b2 ? 'yes' : 'no';
for (;;) {}
    `,
    `
declare function foo(): number | void;
const result1 = foo() === undefined;
const result2 = foo() == null;
    `,
    necessaryConditionTest('false | 5'), // Truthy literal and falsy literal
    necessaryConditionTest('boolean | "foo"'), // boolean and truthy literal
    necessaryConditionTest('0 | boolean'), // boolean and falsy literal
    necessaryConditionTest('boolean | object'), // boolean and always-truthy type
    necessaryConditionTest('false | object'), // always truthy type and falsy literal
    // always falsy type and always truthy type
    necessaryConditionTest('null | object'),
    necessaryConditionTest('undefined | true'),
    necessaryConditionTest('void | true'),
    // "branded" type
    necessaryConditionTest('string & {}'),
    necessaryConditionTest('string & { __brand: string }'),
    necessaryConditionTest('number & { __brand: string }'),
    necessaryConditionTest('boolean & { __brand: string }'),
    necessaryConditionTest('bigint & { __brand: string }'),
    necessaryConditionTest('string & {} & { __brand: string }'),
    necessaryConditionTest(
      'string & { __brandA: string } & { __brandB: string }',
    ),
    necessaryConditionTest('string & { __brand: string } | number'),
    necessaryConditionTest('(string | number) & { __brand: string }'),
    necessaryConditionTest('string & ({ __brand: string } | number)'),
    necessaryConditionTest('("" | "foo") & { __brand: string }'),
    necessaryConditionTest(
      '(string & { __brandA: string }) | (number & { __brandB: string })',
    ),
    necessaryConditionTest(
      '((string & { __brandA: string }) | (number & { __brandB: string }) & ("" | "foo"))',
    ),
    necessaryConditionTest(
      '{ __brandA: string} & (({ __brandB: string } & string) | ({ __brandC: string } & number))',
    ),
    necessaryConditionTest(
      '(string | number) & ("foo" | 123 | { __brandA: string })',
    ),

    necessaryConditionTest('string & string'),

    necessaryConditionTest('any'), // any
    necessaryConditionTest('unknown'), // unknown

    // Generic type params
    `
function test<T extends string>(t: T) {
  return t ? 'yes' : 'no';
}
    `,
    `
// Naked type param
function test<T>(t: T) {
  return t ? 'yes' : 'no';
}
    `,
    `
// Naked type param in union
function test<T>(t: T | []) {
  return t ? 'yes' : 'no';
}
    `,

    // Boolean expressions
    `
function test(a: string) {
  const t1 = a === 'a';
  const t2 = 'a' === a;
}
    `,
    `
function test(a?: string) {
  const t1 = a === undefined;
  const t2 = undefined === a;
  const t1 = a !== undefined;
  const t2 = undefined !== a;
}
    `,
    `
function test(a: null | string) {
  const t1 = a === null;
  const t2 = null === a;
  const t1 = a !== null;
  const t2 = null !== a;
}
    `,
    `
function test(a?: null | string) {
  const t1 = a == null;
  const t2 = null == a;
  const t3 = a != null;
  const t4 = null != a;
  const t5 = a == undefined;
  const t6 = undefined == a;
  const t7 = a != undefined;
  const t8 = undefined != a;
}
    `,
    `
function test(a?: string) {
  const t1 = a == null;
  const t2 = null == a;
  const t3 = a != null;
  const t4 = null != a;
  const t5 = a == undefined;
  const t6 = undefined == a;
  const t7 = a != undefined;
  const t8 = undefined != a;
}
    `,
    `
function test(a: null | string) {
  const t1 = a == null;
  const t2 = null == a;
  const t3 = a != null;
  const t4 = null != a;
  const t5 = a == undefined;
  const t6 = undefined == a;
  const t7 = a != undefined;
  const t8 = undefined != a;
}
    `,
    `
function test(a: any) {
  const t1 = a == null;
  const t2 = null == a;
  const t3 = a != null;
  const t4 = null != a;
  const t5 = a == undefined;
  const t6 = undefined == a;
  const t7 = a != undefined;
  const t8 = undefined != a;
  const t9 = a === null;
  const t10 = null === a;
  const t11 = a !== null;
  const t12 = null !== a;
  const t13 = a === undefined;
  const t14 = undefined === a;
  const t15 = a !== undefined;
  const t16 = undefined !== a;
}
    `,
    `
function test(a: unknown) {
  const t1 = a == null;
  const t2 = null == a;
  const t3 = a != null;
  const t4 = null != a;
  const t5 = a == undefined;
  const t6 = undefined == a;
  const t7 = a != undefined;
  const t8 = undefined != a;
  const t9 = a === null;
  const t10 = null === a;
  const t11 = a !== null;
  const t12 = null !== a;
  const t13 = a === undefined;
  const t14 = undefined === a;
  const t15 = a !== undefined;
  const t16 = undefined !== a;
}
    `,
    `
function test<T>(a: T) {
  const t1 = a == null;
  const t2 = null == a;
  const t3 = a != null;
  const t4 = null != a;
  const t5 = a == undefined;
  const t6 = undefined == a;
  const t7 = a != undefined;
  const t8 = undefined != a;
  const t9 = a === null;
  const t10 = null === a;
  const t11 = a !== null;
  const t12 = null !== a;
  const t13 = a === undefined;
  const t14 = undefined === a;
  const t15 = a !== undefined;
  const t16 = undefined !== a;
}
    `,
    `
function foo<T extends object>(arg: T, key: keyof T): void {
  arg[key] == null;
}
    `,

    // Predicate functions
    `
// with literal arrow function
[0, 1, 2].filter(x => x);

// filter with named function
function length(x: string) {
  return x.length;
}
['a', 'b', ''].filter(length);

// with non-literal array
function nonEmptyStrings(x: string[]) {
  return x.filter(length);
}

// filter-like predicate
function count(
  list: string[],
  predicate: (value: string, index: number, array: string[]) => unknown,
) {
  return list.filter(predicate).length;
}
    `,
    // Ignores non-array methods of the same name
    `
const notArray = {
  filter: (func: () => boolean) => func(),
  find: (func: () => boolean) => func(),
};
notArray.filter(() => true);
notArray.find(() => true);
    `,

    // Nullish coalescing operator
    `
function test(a: string | null) {
  return a ?? 'default';
}
    `,
    `
function test(a: string | undefined) {
  return a ?? 'default';
}
    `,
    `
function test(a: string | null | undefined) {
  return a ?? 'default';
}
    `,
    `
function test(a: unknown) {
  return a ?? 'default';
}
    `,
    `
function test<T>(a: T) {
  return a ?? 'default';
}
    `,
    `
function test<T extends string | null>(a: T) {
  return a ?? 'default';
}
    `,
    `
function foo<T extends object>(arg: T, key: keyof T): void {
  arg[key] ?? 'default';
}
    `,
    // Indexing cases
    `
declare const arr: object[];
if (arr[42]) {
} // looks unnecessary from the types, but isn't

const tuple = [{}] as [object];
declare const n: number;
if (tuple[n]) {
}
    `,
    // Optional-chaining indexing
    `
declare const arr: Array<{ value: string } & (() => void)>;
if (arr[42]?.value) {
}
arr[41]?.();

// An array access can "infect" deeper into the chain
declare const arr2: Array<{ x: { y: { z: object } } }>;
arr2[42]?.x?.y?.z;

const tuple = ['foo'] as const;
declare const n: number;
tuple[n]?.toUpperCase();
    `,
    `
if (arr?.[42]) {
}
    `,
    `
type ItemA = { bar: string; baz: string };
type ItemB = { bar: string; qux: string };
declare const foo: ItemA[] | ItemB[];
foo[0]?.bar;
    `,
    `
type TupleA = [string, number];
type TupleB = [string, number];

declare const foo: TupleA | TupleB;
declare const index: number;
foo[index]?.toString();
    `,
    `
declare const returnsArr: undefined | (() => string[]);
if (returnsArr?.()[42]) {
}
returnsArr?.()[42]?.toUpperCase();
    `,
    // nullish + array index
    `
declare const arr: string[][];
arr[x] ?? [];
    `,
    // nullish + optional array index
    `
declare const arr: { foo: number }[];
const bar = arr[42]?.foo ?? 0;
    `,
    // Doesn't check the right-hand side of a logical expression
    //  in a non-conditional context
    {
      code: `
declare const b1: boolean;
declare const b2: true;
const x = b1 && b2;
      `,
    },
    {
      code: `
while (true) {}
for (; true; ) {}
do {} while (true);
      `,
      options: [{ allowConstantLoopConditions: true }],
    },
    `
let variable = 'abc' as string | void;
variable?.[0];
    `,
    `
let foo: undefined | { bar: true };
foo?.bar;
    `,
    `
let foo: null | { bar: true };
foo?.bar;
    `,
    `
let foo: undefined;
foo?.bar;
    `,
    `
let foo: undefined;
foo?.bar.baz;
    `,
    `
let foo: null;
foo?.bar;
    `,
    `
let anyValue: any;
anyValue?.foo;
    `,
    `
let unknownValue: unknown;
unknownValue?.foo;
    `,
    `
let foo: undefined | (() => {});
foo?.();
    `,
    `
let foo: null | (() => {});
foo?.();
    `,
    `
let foo: undefined;
foo?.();
    `,
    `
let foo: undefined;
foo?.().bar;
    `,
    `
let foo: null;
foo?.();
    `,
    `
let anyValue: any;
anyValue?.();
    `,
    `
let unknownValue: unknown;
unknownValue?.();
    `,
    'const foo = [1, 2, 3][0];',
    `
declare const foo: { bar?: { baz: { c: string } } } | null;
foo?.bar?.baz;
    `,
    `
foo?.bar?.baz?.qux;
    `,
    `
declare const foo: { bar: { baz: string } };
foo.bar.qux?.();
    `,
    `
type Foo = { baz: number } | null;
type Bar = { baz: null | string | { qux: string } };
declare const foo: { fooOrBar: Foo | Bar } | null;
foo?.fooOrBar?.baz?.qux;
    `,
    `
type Foo = { [key: string]: string } | null;
declare const foo: Foo;

const key = '1';
foo?.[key]?.trim();
    `,
    `
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
type Key = 'bar' | 'foo';
declare const foo: Foo;
declare const key: Key;

foo?.[key].trim();
    `,
    `
interface Outer {
  inner?: {
    [key: string]: string | undefined;
  };
}

function Foo(outer: Outer, key: string): number | undefined {
  return outer.inner?.[key]?.charCodeAt(0);
}
    `,
    `
interface Outer {
  inner?: {
    [key: string]: string | undefined;
    bar: 'bar';
  };
}
type Foo = 'foo';

function Foo(outer: Outer, key: Foo): number | undefined {
  return outer.inner?.[key]?.charCodeAt(0);
}
    `,
    `
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
type Key = 'bar' | 'foo' | 'baz';
declare const foo: Foo;
declare const key: Key;

foo?.[key]?.trim();
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/7700
    `
type BrandedKey = string & { __brand: string };
type Foo = { [key: BrandedKey]: string } | null;
declare const foo: Foo;
const key = '1' as BrandedKey;
foo?.[key]?.trim();
    `,
    `
type BrandedKey<S extends string> = S & { __brand: string };
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
type Key = BrandedKey<'bar'> | BrandedKey<'foo'>;
declare const foo: Foo;
declare const key: Key;
foo?.[key].trim();
    `,
    `
type BrandedKey = string & { __brand: string };
interface Outer {
  inner?: {
    [key: BrandedKey]: string | undefined;
  };
}
function Foo(outer: Outer, key: BrandedKey): number | undefined {
  return outer.inner?.[key]?.charCodeAt(0);
}
    `,
    `
interface Outer {
  inner?: {
    [key: string & { __brand: string }]: string | undefined;
    bar: 'bar';
  };
}
type Foo = 'foo' & { __brand: string };
function Foo(outer: Outer, key: Foo): number | undefined {
  return outer.inner?.[key]?.charCodeAt(0);
}
    `,
    `
type BrandedKey<S extends string> = S & { __brand: string };
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
type Key = BrandedKey<'bar'> | BrandedKey<'foo'> | BrandedKey<'baz'>;
declare const foo: Foo;
declare const key: Key;
foo?.[key]?.trim();
    `,
    {
      code: `
type BrandedKey = string & { __brand: string };
type Foo = { [key: BrandedKey]: string } | null;
declare const foo: Foo;
const key = '1' as BrandedKey;
foo?.[key]?.trim();
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
type BrandedKey<S extends string> = S & { __brand: string };
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
type Key = BrandedKey<'bar'> | BrandedKey<'foo'>;
declare const foo: Foo;
declare const key: Key;
foo?.[key].trim();
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
type BrandedKey = string & { __brand: string };
interface Outer {
  inner?: {
    [key: BrandedKey]: string | undefined;
  };
}
function Foo(outer: Outer, key: BrandedKey): number | undefined {
  return outer.inner?.[key]?.charCodeAt(0);
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
interface Outer {
  inner?: {
    [key: string & { __brand: string }]: string | undefined;
    bar: 'bar';
  };
}
type Foo = 'foo' & { __brand: string };
function Foo(outer: Outer, key: Foo): number | undefined {
  return outer.inner?.[key]?.charCodeAt(0);
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    {
      code: `
type BrandedKey<S extends string> = S & { __brand: string };
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
type Key = BrandedKey<'bar'> | BrandedKey<'foo'> | BrandedKey<'baz'>;
declare const foo: Foo;
declare const key: Key;
foo?.[key]?.trim();
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    `
let latencies: number[][] = [];

function recordData(): void {
  if (!latencies[0]) latencies[0] = [];
  latencies[0].push(4);
}

recordData();
    `,
    `
let latencies: number[][] = [];

function recordData(): void {
  if (latencies[0]) latencies[0] = [];
  latencies[0].push(4);
}

recordData();
    `,
    `
function test(testVal?: boolean) {
  if (testVal ?? true) {
    console.log('test');
  }
}
    `,
    `
declare const x: string[];
if (!x[0]) {
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2421
    `
const isEven = (val: number) => val % 2 === 0;
if (!isEven(1)) {
}
    `,
    `
declare const booleanTyped: boolean;
declare const unknownTyped: unknown;

if (!(booleanTyped || unknownTyped)) {
}
    `,
    {
      code: `
declare const x: string[] | null;
// eslint-disable-next-line
if (x) {
}
      `,
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootPath, 'unstrict'),
        },
      },
      options: [
        {
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: true,
        },
      ],
    },
    `
interface Foo {
  [key: string]: [string] | undefined;
}

type OptionalFoo = Foo | undefined;
declare const foo: OptionalFoo;
foo?.test?.length;
    `,
    `
interface Foo {
  [key: number]: [string] | undefined;
}

type OptionalFoo = Foo | undefined;
declare const foo: OptionalFoo;
foo?.[1]?.length;
    `,
    `
declare let foo: number | null;
foo ??= 1;
    `,
    `
declare let foo: number;
foo ||= 1;
    `,
    `
declare const foo: { bar: { baz?: number; qux: number } };
type Key = 'baz' | 'qux';
declare const key: Key;
foo.bar[key] ??= 1;
    `,
    `
enum Keys {
  A = 'A',
  B = 'B',
}
type Foo = {
  [Keys.A]: number | null;
  [Keys.B]: number;
};
declare const foo: Foo;
declare const key: Keys;
foo[key] ??= 1;
    `,
    {
      code: `
declare const foo: { bar?: number };
foo.bar ??= 1;
      `,
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
    },
    {
      code: `
declare const foo: { bar: { baz?: number } };
foo['bar'].baz ??= 1;
      `,
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
    },
    {
      code: `
declare const foo: { bar: { baz?: number; qux: number } };
type Key = 'baz' | 'qux';
declare const key: Key;
foo.bar[key] ??= 1;
      `,
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
    },
    `
declare let foo: number;
foo &&= 1;
    `,
    `
function foo<T extends object>(arg: T, key: keyof T): void {
  arg[key] ??= 'default';
}
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/6264
    `
function get<Obj, Key extends keyof Obj>(obj: Obj, key: Key) {
  const value = obj[key];
  if (value) {
    return value;
  }
  throw new Error('BOOM!');
}

get({ foo: null }, 'foo');
    `,
    {
      code: `
function getElem(dict: Record<string, { foo: string }>, key: string) {
  if (dict[key]) {
    return dict[key].foo;
  } else {
    return '';
  }
}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
    `
type Foo = { bar: () => number | undefined } | null;
declare const foo: Foo;
foo?.bar()?.toExponential();
    `,
    `
type Foo = (() => number | undefined) | null;
declare const foo: Foo;
foo?.()?.toExponential();
    `,
    `
type FooUndef = () => undefined;
type FooNum = () => number;
type Foo = FooUndef | FooNum | null;
declare const foo: Foo;
foo?.()?.toExponential();
    `,
    `
type Foo = { [key: string]: () => number | undefined } | null;
declare const foo: Foo;
foo?.['bar']()?.toExponential();
    `,
    {
      code: `
class ConsistentRand {
  #rand?: number;

  getCachedRand() {
    this.#rand ??= Math.random();
    return this.#rand;
  }
}
      `,
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
    },
  ],
  invalid: [
    // Ensure that it's checking in all the right places
    {
      code: `
const b1 = true;
declare const b2: boolean;
const t1 = b1 && b2;
const t2 = b1 || b2;
if (b1 && b2) {
}
if (b2 && b1) {
}
while (b1 && b2) {}
while (b2 && b1) {}
for (let i = 0; b1 && b2; i++) {
  break;
}
const t1 = b1 && b2 ? 'yes' : 'no';
const t1 = b2 && b1 ? 'yes' : 'no';
      `,
      errors: [
        ruleError(4, 12, 'alwaysTruthy'),
        ruleError(5, 12, 'alwaysTruthy'),
        ruleError(6, 5, 'alwaysTruthy'),
        ruleError(8, 11, 'alwaysTruthy'),
        ruleError(10, 8, 'alwaysTruthy'),
        ruleError(11, 14, 'alwaysTruthy'),
        ruleError(12, 17, 'alwaysTruthy'),
        ruleError(15, 12, 'alwaysTruthy'),
        ruleError(16, 18, 'alwaysTruthy'),
      ],
      output: null,
    },
    // Ensure that it's complaining about the right things
    unnecessaryConditionTest('object', 'alwaysTruthy'),
    unnecessaryConditionTest('object | true', 'alwaysTruthy'),
    unnecessaryConditionTest('"" | false', 'alwaysFalsy'), // Two falsy literals
    unnecessaryConditionTest('"always truthy"', 'alwaysTruthy'),
    unnecessaryConditionTest(`undefined`, 'alwaysFalsy'),
    unnecessaryConditionTest('null', 'alwaysFalsy'),
    unnecessaryConditionTest('void', 'alwaysFalsy'),
    unnecessaryConditionTest('never', 'never'),
    unnecessaryConditionTest('string & number', 'never'),

    // More complex logical expressions
    {
      code: `
declare const b1: boolean;
declare const b2: boolean;
if (true && b1 && b2) {
}
if (b1 && false && b2) {
}
if (b1 || b2 || true) {
}
      `,
      errors: [
        ruleError(4, 5, 'alwaysTruthy'),
        ruleError(6, 11, 'alwaysFalsy'),
        ruleError(8, 17, 'alwaysTruthy'),
      ],
      output: null,
    },

    // Generic type params
    {
      code: `
function test<T extends object>(t: T) {
  return t ? 'yes' : 'no';
}
      `,
      errors: [ruleError(3, 10, 'alwaysTruthy')],
      output: null,
    },
    {
      code: `
function test<T extends false>(t: T) {
  return t ? 'yes' : 'no';
}
      `,
      errors: [ruleError(3, 10, 'alwaysFalsy')],
      output: null,
    },
    {
      code: `
function test<T extends 'a' | 'b'>(t: T) {
  return t ? 'yes' : 'no';
}
      `,
      errors: [ruleError(3, 10, 'alwaysTruthy')],
      output: null,
    },

    // Boolean expressions
    {
      code: `
function test(a: 'a') {
  return a === 'a';
}
      `,
      errors: [ruleError(3, 10, 'literalBooleanExpression')],
      output: null,
    },
    {
      code: `
const y = 1;
if (y === 0) {
}
      `,
      errors: [ruleError(3, 5, 'literalBooleanExpression')],
      output: null,
    },
    {
      code: `
enum Foo {
  a = 1,
  b = 2,
}

const x = Foo.a;
if (x === Foo.a) {
}
      `,
      errors: [ruleError(8, 5, 'literalBooleanExpression')],
      output: null,
    },
    // Workaround https://github.com/microsoft/TypeScript/issues/37160
    {
      code: `
function test(a: string) {
  const t1 = a === undefined;
  const t2 = undefined === a;
  const t3 = a !== undefined;
  const t4 = undefined !== a;
  const t5 = a === null;
  const t6 = null === a;
  const t7 = a !== null;
  const t8 = null !== a;
}
      `,
      errors: [
        ruleError(3, 14, 'noOverlapBooleanExpression'),
        ruleError(4, 14, 'noOverlapBooleanExpression'),
        ruleError(5, 14, 'noOverlapBooleanExpression'),
        ruleError(6, 14, 'noOverlapBooleanExpression'),
        ruleError(7, 14, 'noOverlapBooleanExpression'),
        ruleError(8, 14, 'noOverlapBooleanExpression'),
        ruleError(9, 14, 'noOverlapBooleanExpression'),
        ruleError(10, 14, 'noOverlapBooleanExpression'),
      ],
      output: null,
    },
    {
      code: `
function test(a?: string) {
  const t1 = a === undefined;
  const t2 = undefined === a;
  const t3 = a !== undefined;
  const t4 = undefined !== a;
  const t5 = a === null;
  const t6 = null === a;
  const t7 = a !== null;
  const t8 = null !== a;
}
      `,
      errors: [
        ruleError(7, 14, 'noOverlapBooleanExpression'),
        ruleError(8, 14, 'noOverlapBooleanExpression'),
        ruleError(9, 14, 'noOverlapBooleanExpression'),
        ruleError(10, 14, 'noOverlapBooleanExpression'),
      ],
      output: null,
    },
    {
      code: `
function test(a: null | string) {
  const t1 = a === undefined;
  const t2 = undefined === a;
  const t3 = a !== undefined;
  const t4 = undefined !== a;
  const t5 = a === null;
  const t6 = null === a;
  const t7 = a !== null;
  const t8 = null !== a;
}
      `,
      errors: [
        ruleError(3, 14, 'noOverlapBooleanExpression'),
        ruleError(4, 14, 'noOverlapBooleanExpression'),
        ruleError(5, 14, 'noOverlapBooleanExpression'),
        ruleError(6, 14, 'noOverlapBooleanExpression'),
      ],
      output: null,
    },
    {
      code: `
function test<T extends object>(a: T) {
  const t1 = a == null;
  const t2 = null == a;
  const t3 = a != null;
  const t4 = null != a;
  const t5 = a == undefined;
  const t6 = undefined == a;
  const t7 = a != undefined;
  const t8 = undefined != a;
  const t9 = a === null;
  const t10 = null === a;
  const t11 = a !== null;
  const t12 = null !== a;
  const t13 = a === undefined;
  const t14 = undefined === a;
  const t15 = a !== undefined;
  const t16 = undefined !== a;
}
      `,
      errors: [
        ruleError(3, 14, 'noOverlapBooleanExpression'),
        ruleError(4, 14, 'noOverlapBooleanExpression'),
        ruleError(5, 14, 'noOverlapBooleanExpression'),
        ruleError(6, 14, 'noOverlapBooleanExpression'),
        ruleError(7, 14, 'noOverlapBooleanExpression'),
        ruleError(8, 14, 'noOverlapBooleanExpression'),
        ruleError(9, 14, 'noOverlapBooleanExpression'),
        ruleError(10, 14, 'noOverlapBooleanExpression'),
        ruleError(11, 14, 'noOverlapBooleanExpression'),
        ruleError(12, 15, 'noOverlapBooleanExpression'),
        ruleError(13, 15, 'noOverlapBooleanExpression'),
        ruleError(14, 15, 'noOverlapBooleanExpression'),
        ruleError(15, 15, 'noOverlapBooleanExpression'),
        ruleError(16, 15, 'noOverlapBooleanExpression'),
        ruleError(17, 15, 'noOverlapBooleanExpression'),
        ruleError(18, 15, 'noOverlapBooleanExpression'),
      ],
      output: null,
    },
    // Nullish coalescing operator
    {
      code: `
function test(a: string) {
  return a ?? 'default';
}
      `,
      errors: [ruleError(3, 10, 'neverNullish')],
      output: null,
    },
    {
      code: `
function test(a: string | false) {
  return a ?? 'default';
}
      `,
      errors: [ruleError(3, 10, 'neverNullish')],
      output: null,
    },
    {
      code: `
function test<T extends string>(a: T) {
  return a ?? 'default';
}
      `,
      errors: [ruleError(3, 10, 'neverNullish')],
      output: null,
    },
    // nullish + array index without optional chaining
    {
      code: `
function test(a: { foo: string }[]) {
  return a[0].foo ?? 'default';
}
      `,
      errors: [ruleError(3, 10, 'neverNullish')],
      output: null,
    },
    {
      code: `
function test(a: null) {
  return a ?? 'default';
}
      `,
      errors: [ruleError(3, 10, 'alwaysNullish')],
      output: null,
    },
    {
      code: `
function test(a: null[]) {
  return a[0] ?? 'default';
}
      `,
      errors: [ruleError(3, 10, 'alwaysNullish')],
      output: null,
    },
    {
      code: `
function test<T extends null>(a: T) {
  return a ?? 'default';
}
      `,
      errors: [ruleError(3, 10, 'alwaysNullish')],
      output: null,
    },
    {
      code: `
function test(a: never) {
  return a ?? 'default';
}
      `,
      errors: [ruleError(3, 10, 'never')],
      output: null,
    },
    {
      code: `
function test<T extends { foo: number }, K extends 'foo'>(num: T[K]) {
  num ?? 'default';
}
      `,
      errors: [ruleError(3, 3, 'neverNullish')],
      output: null,
    },
    // Predicate functions
    {
      code: `
[1, 3, 5].filter(() => true);
[1, 2, 3].find(() => {
  return false;
});

// with non-literal array
function nothing(x: string[]) {
  return x.filter(() => false);
}
// with readonly array
function nothing2(x: readonly string[]) {
  return x.filter(() => false);
}
// with tuple
function nothing3(x: [string, string]) {
  return x.filter(() => false);
}
      `,
      errors: [
        ruleError(2, 24, 'alwaysTruthy'),
        ruleError(4, 10, 'alwaysFalsy'),
        ruleError(9, 25, 'alwaysFalsy'),
        ruleError(13, 25, 'alwaysFalsy'),
        ruleError(17, 25, 'alwaysFalsy'),
      ],
      output: null,
    },
    // Indexing cases
    {
      // This is an error because 'dict' doesn't represent
      //  the potential for undefined in its types
      code: `
declare const dict: Record<string, object>;
if (dict['mightNotExist']) {
}
      `,
      errors: [ruleError(3, 5, 'alwaysTruthy')],
      output: null,
    },
    {
      // Should still check tuples when accessed with literal numbers, since they don't have
      //   unsound index signatures
      code: `
const x = [{}] as [{ foo: string }];
if (x[0]) {
}
if (x[0]?.foo) {
}
      `,
      errors: [
        ruleError(3, 5, 'alwaysTruthy'),
        ruleError(5, 9, 'neverOptionalChain'),
      ],
      output: `
const x = [{}] as [{ foo: string }];
if (x[0]) {
}
if (x[0].foo) {
}
      `,
    },
    {
      // Shouldn't mistake this for an array indexing case
      code: `
declare const arr: object[];
if (arr.filter) {
}
      `,
      errors: [ruleError(3, 5, 'alwaysTruthy')],
      output: null,
    },
    {
      code: `
function truthy() {
  return [];
}
function falsy() {}
[1, 3, 5].filter(truthy);
[1, 2, 3].find(falsy);
      `,
      errors: [
        ruleError(6, 18, 'alwaysTruthyFunc'),
        ruleError(7, 16, 'alwaysFalsyFunc'),
      ],
      output: null,
    },
    // Supports generics
    // TODO: fix this
    //     {
    //       code: `
    // const isTruthy = <T>(t: T) => T;
    // // Valid: numbers can be truthy or falsy (0).
    // [0,1,2,3].filter(isTruthy);
    // // Invalid: arrays are always falsy.
    // [[1,2], [3,4]].filter(isTruthy);
    // `,
    //       errors: [ruleError(6, 23, 'alwaysTruthyFunc')],
    //     },
    {
      code: `
while (true) {}
for (; true; ) {}
do {} while (true);
      `,
      errors: [
        ruleError(2, 8, 'alwaysTruthy'),
        ruleError(3, 8, 'alwaysTruthy'),
        ruleError(4, 14, 'alwaysTruthy'),
      ],
      options: [{ allowConstantLoopConditions: false }],
      output: null,
    },
    {
      code: noFormat`
let foo = { bar: true };
foo?.bar;
foo ?. bar;
foo ?.
  bar;
foo
  ?. bar;
      `,
      errors: [
        {
          column: 4,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 5,
          line: 5,
          messageId: 'neverOptionalChain',
        },
        {
          column: 3,
          endColumn: 5,
          endLine: 8,
          line: 8,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
let foo = { bar: true };
foo.bar;
foo . bar;
foo .
  bar;
foo
  . bar;
      `,
    },
    {
      code: noFormat`
let foo = () => {};
foo?.();
foo ?. ();
foo ?.
  ();
foo
  ?. ();
      `,
      errors: [
        {
          column: 4,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 5,
          line: 5,
          messageId: 'neverOptionalChain',
        },
        {
          column: 3,
          endColumn: 5,
          endLine: 8,
          line: 8,
          messageId: 'neverOptionalChain',
        },
      ],
      output: noFormat`
let foo = () => {};
foo();
foo  ();
foo${' '}
  ();
foo
   ();
      `,
    },
    {
      code: noFormat`
let foo = () => {};
foo?.(bar);
foo ?. (bar);
foo ?.
  (bar);
foo
  ?. (bar);
      `,
      errors: [
        {
          column: 4,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 5,
          line: 5,
          messageId: 'neverOptionalChain',
        },
        {
          column: 3,
          endColumn: 5,
          endLine: 8,
          line: 8,
          messageId: 'neverOptionalChain',
        },
      ],
      output: noFormat`
let foo = () => {};
foo(bar);
foo  (bar);
foo${' '}
  (bar);
foo
   (bar);
      `,
    },
    {
      code: 'const foo = [1, 2, 3]?.[0];',
      errors: [
        {
          column: 22,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'neverOptionalChain',
        },
      ],
      output: 'const foo = [1, 2, 3][0];',
    },
    {
      code: `
declare const x: { a?: { b: string } };
x?.a?.b;
      `,
      errors: [
        {
          column: 2,
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
declare const x: { a?: { b: string } };
x.a?.b;
      `,
    },
    {
      code: `
declare const x: { a: { b?: { c: string } } };
x.a?.b?.c;
      `,
      errors: [
        {
          column: 4,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
declare const x: { a: { b?: { c: string } } };
x.a.b?.c;
      `,
    },
    {
      code: `
let x: { a?: string };
x?.a;
      `,
      errors: [
        {
          column: 2,
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
let x: { a?: string };
x.a;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { c: string } } } | null;
foo?.bar?.baz;
      `,
      errors: [
        {
          column: 9,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
declare const foo: { bar: { baz: { c: string } } } | null;
foo?.bar.baz;
      `,
    },
    {
      code: `
declare const foo: { bar?: { baz: { qux: string } } } | null;
foo?.bar?.baz?.qux;
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
declare const foo: { bar?: { baz: { qux: string } } } | null;
foo?.bar?.baz.qux;
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { qux?: () => {} } } } | null;
foo?.bar?.baz?.qux?.();
      `,
      errors: [
        {
          column: 9,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
        {
          column: 14,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
declare const foo: { bar: { baz: { qux?: () => {} } } } | null;
foo?.bar.baz.qux?.();
      `,
    },
    {
      code: `
declare const foo: { bar: { baz: { qux: () => {} } } } | null;
foo?.bar?.baz?.qux?.();
      `,
      errors: [
        {
          column: 9,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
        {
          column: 14,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
        {
          column: 19,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
declare const foo: { bar: { baz: { qux: () => {} } } } | null;
foo?.bar.baz.qux();
      `,
    },
    {
      code: `
type baz = () => { qux: () => {} };
declare const foo: { bar: { baz: baz } } | null;
foo?.bar?.baz?.().qux?.();
      `,
      errors: [
        {
          column: 9,
          endColumn: 11,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
        {
          column: 14,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
        {
          column: 22,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
type baz = () => { qux: () => {} };
declare const foo: { bar: { baz: baz } } | null;
foo?.bar.baz().qux();
      `,
    },
    {
      code: `
type baz = null | (() => { qux: () => {} });
declare const foo: { bar: { baz: baz } } | null;
foo?.bar?.baz?.().qux?.();
      `,
      errors: [
        {
          column: 9,
          endColumn: 11,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
        {
          column: 22,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
type baz = null | (() => { qux: () => {} });
declare const foo: { bar: { baz: baz } } | null;
foo?.bar.baz?.().qux();
      `,
    },
    {
      code: `
type baz = null | (() => { qux: () => {} } | null);
declare const foo: { bar: { baz: baz } } | null;
foo?.bar?.baz?.()?.qux?.();
      `,
      errors: [
        {
          column: 9,
          endColumn: 11,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
        {
          column: 23,
          endColumn: 25,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
type baz = null | (() => { qux: () => {} } | null);
declare const foo: { bar: { baz: baz } } | null;
foo?.bar.baz?.()?.qux();
      `,
    },
    {
      code: `
type Foo = { baz: number };
type Bar = { baz: null | string | { qux: string } };
declare const foo: { fooOrBar: Foo | Bar } | null;
foo?.fooOrBar?.baz?.qux;
      `,
      errors: [
        {
          column: 14,
          endColumn: 16,
          endLine: 5,
          line: 5,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
type Foo = { baz: number };
type Bar = { baz: null | string | { qux: string } };
declare const foo: { fooOrBar: Foo | Bar } | null;
foo?.fooOrBar.baz?.qux;
      `,
    },
    {
      code: `
declare const x: { a: { b: number } }[];
x[0].a?.b;
      `,
      errors: [ruleError(3, 7, 'neverOptionalChain')],
      output: `
declare const x: { a: { b: number } }[];
x[0].a.b;
      `,
    },
    {
      code: `
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
type Key = 'bar' | 'foo';
declare const foo: Foo;
declare const key: Key;

foo?.[key]?.trim();
      `,
      errors: [
        {
          column: 11,
          endColumn: 13,
          endLine: 7,
          line: 7,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
type Key = 'bar' | 'foo';
declare const foo: Foo;
declare const key: Key;

foo?.[key].trim();
      `,
    },
    {
      code: `
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
declare const foo: Foo;
const key = 'bar';
foo?.[key]?.trim();
      `,
      errors: [
        {
          column: 11,
          endColumn: 13,
          endLine: 5,
          line: 5,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
declare const foo: Foo;
const key = 'bar';
foo?.[key].trim();
      `,
    },
    {
      code: `
interface Outer {
  inner?: {
    [key: string]: string | undefined;
    bar: 'bar';
  };
}

export function test(outer: Outer): number | undefined {
  const key = 'bar';
  return outer.inner?.[key]?.charCodeAt(0);
}
      `,
      errors: [
        {
          column: 28,
          endColumn: 30,
          endLine: 11,
          line: 11,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
interface Outer {
  inner?: {
    [key: string]: string | undefined;
    bar: 'bar';
  };
}

export function test(outer: Outer): number | undefined {
  const key = 'bar';
  return outer.inner?.[key].charCodeAt(0);
}
      `,
    },
    {
      code: `
interface Outer {
  inner?: {
    [key: string]: string | undefined;
    bar: 'bar';
  };
}
type Bar = 'bar';

function Foo(outer: Outer, key: Bar): number | undefined {
  return outer.inner?.[key]?.charCodeAt(0);
}
      `,
      errors: [
        {
          column: 28,
          endColumn: 30,
          endLine: 11,
          line: 11,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
interface Outer {
  inner?: {
    [key: string]: string | undefined;
    bar: 'bar';
  };
}
type Bar = 'bar';

function Foo(outer: Outer, key: Bar): number | undefined {
  return outer.inner?.[key].charCodeAt(0);
}
      `,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2384
    {
      code: `
function test(testVal?: true) {
  if (testVal ?? true) {
    console.log('test');
  }
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'alwaysTruthy',
        },
      ],
      output: null,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2255
    {
      code: `
const a = null;
if (!a) {
}
      `,
      errors: [ruleError(3, 6, 'alwaysTruthy')],
      output: null,
    },
    {
      code: `
const a = true;
if (!a) {
}
      `,
      errors: [ruleError(3, 6, 'alwaysFalsy')],
      output: null,
    },
    {
      code: `
function sayHi(): void {
  console.log('Hi!');
}

let speech: never = sayHi();
if (!speech) {
}
      `,
      errors: [ruleError(7, 6, 'never')],
      output: null,
    },
    {
      code: `
declare const x: string[] | null;
if (x) {
}
      `,
      errors: [
        {
          column: 1,
          line: 0,
          messageId: 'noStrictNullCheck',
        },
        {
          column: 5,
          line: 3,
          messageId: 'alwaysTruthy',
        },
      ],
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootPath, 'unstrict'),
        },
      },
      output: null,
    },
    {
      code: `
interface Foo {
  test: string;
  [key: string]: [string] | undefined;
}

type OptionalFoo = Foo | undefined;
declare const foo: OptionalFoo;
foo?.test?.length;
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 9,
          line: 9,
          messageId: 'neverOptionalChain',
        },
      ],
      output: `
interface Foo {
  test: string;
  [key: string]: [string] | undefined;
}

type OptionalFoo = Foo | undefined;
declare const foo: OptionalFoo;
foo?.test.length;
      `,
    },
    {
      code: `
function pick<Obj extends Record<string, 1 | 2 | 3>, Key extends keyof Obj>(
  obj: Obj,
  key: Key,
): Obj[Key] {
  const k = obj[key];
  if (obj[key]) {
    return obj[key];
  }
  throw new Error('Boom!');
}

pick({ foo: 1, bar: 2 }, 'bar');
      `,
      errors: [
        {
          column: 7,
          endColumn: 15,
          endLine: 7,
          line: 7,
          messageId: 'alwaysTruthy',
        },
      ],
      output: null,
    },
    {
      code: `
function getElem(dict: Record<string, { foo: string }>, key: string) {
  if (dict[key]) {
    return dict[key].foo;
  } else {
    return '';
  }
}
      `,
      errors: [
        {
          column: 7,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'alwaysTruthy',
        },
      ],
      output: null,
    },
    {
      code: `
declare let foo: {};
foo ??= 1;
      `,
      errors: [
        {
          column: 1,
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'neverNullish',
        },
      ],
      output: null,
    },
    {
      code: `
declare let foo: number;
foo ??= 1;
      `,
      errors: [
        {
          column: 1,
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'neverNullish',
        },
      ],
      output: null,
    },
    {
      code: `
declare let foo: null;
foo ??= null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'alwaysNullish',
        },
      ],
      output: null,
    },
    {
      code: `
declare let foo: {};
foo ||= 1;
      `,
      errors: [
        {
          column: 1,
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'alwaysTruthy',
        },
      ],
      output: null,
    },
    {
      code: `
declare let foo: null;
foo ||= null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'alwaysFalsy',
        },
      ],
      output: null,
    },
    {
      code: `
declare let foo: {};
foo &&= 1;
      `,
      errors: [
        {
          column: 1,
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'alwaysTruthy',
        },
      ],
      output: null,
    },
    {
      code: `
declare let foo: null;
foo &&= null;
      `,
      errors: [
        {
          column: 1,
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'alwaysFalsy',
        },
      ],
      output: null,
    },
    {
      code: `
declare const foo: { bar: number };
foo.bar ??= 1;
      `,
      errors: [
        {
          column: 1,
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'neverNullish',
        },
      ],
      languageOptions: { parserOptions: optionsWithExactOptionalPropertyTypes },
      output: null,
    },
    {
      code: noFormat`
type Foo = { bar: () => number } | null;
declare const foo: Foo;
foo?.bar()?.toExponential();
      `,
      errors: [
        {
          column: 11,
          endColumn: 13,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
      ],
      output: noFormat`
type Foo = { bar: () => number } | null;
declare const foo: Foo;
foo?.bar().toExponential();
      `,
    },
    {
      code: noFormat`
type Foo = { bar: null | { baz: () => { qux: number } } } | null;
declare const foo: Foo;
foo?.bar?.baz()?.qux?.toExponential();
      `,
      errors: [
        {
          column: 16,
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
        {
          column: 21,
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
      ],
      output: noFormat`
type Foo = { bar: null | { baz: () => { qux: number } } } | null;
declare const foo: Foo;
foo?.bar?.baz().qux.toExponential();
      `,
    },
    {
      code: noFormat`
type Foo = (() => number) | null;
declare const foo: Foo;
foo?.()?.toExponential();
      `,
      errors: [
        {
          column: 8,
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
      ],
      output: noFormat`
type Foo = (() => number) | null;
declare const foo: Foo;
foo?.().toExponential();
      `,
    },
    {
      code: noFormat`
type Foo = { [key: string]: () => number } | null;
declare const foo: Foo;
foo?.['bar']()?.toExponential();
      `,
      errors: [
        {
          column: 15,
          endColumn: 17,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
      ],
      output: noFormat`
type Foo = { [key: string]: () => number } | null;
declare const foo: Foo;
foo?.['bar']().toExponential();
      `,
    },
    {
      code: noFormat`
type Foo = { [key: string]: () => number } | null;
declare const foo: Foo;
foo?.['bar']?.()?.toExponential();
      `,
      errors: [
        {
          column: 17,
          endColumn: 19,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
        },
      ],
      output: noFormat`
type Foo = { [key: string]: () => number } | null;
declare const foo: Foo;
foo?.['bar']?.().toExponential();
      `,
    },

    // "branded" types
    unnecessaryConditionTest('"" & {}', 'alwaysFalsy'),
    unnecessaryConditionTest('"" & { __brand: string }', 'alwaysFalsy'),
    unnecessaryConditionTest(
      '("" | false) & { __brand: string }',
      'alwaysFalsy',
    ),
    unnecessaryConditionTest(
      '((string & { __brandA: string }) | (number & { __brandB: string })) & ""',
      'alwaysFalsy',
    ),
    unnecessaryConditionTest(
      '("foo" | "bar") & { __brand: string }',
      'alwaysTruthy',
    ),
    unnecessaryConditionTest(
      '(123 | true) & { __brand: string }',
      'alwaysTruthy',
    ),
    unnecessaryConditionTest(
      '(string | number) & ("foo" | 123) & { __brand: string }',
      'alwaysTruthy',
    ),
    unnecessaryConditionTest(
      '((string & { __brandA: string }) | (number & { __brandB: string })) & "foo"',
      'alwaysTruthy',
    ),
    unnecessaryConditionTest(
      '((string & { __brandA: string }) | (number & { __brandB: string })) & ("foo" | 123)',
      'alwaysTruthy',
    ),
  ],
});
