import type { InvalidTestCase } from '@typescript-eslint/rule-tester';

import { noFormat } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

import type {
  MessageId,
  Options,
} from '../../src/rules/no-unnecessary-condition';

import rule from '../../src/rules/no-unnecessary-condition';
import { createRuleTesterWithTypes, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = createRuleTesterWithTypes();

const optionsWithExactOptionalPropertyTypes = {
  project: './tsconfig.exactOptionalPropertyTypes.json',
  projectService: false,
  tsconfigRootDir: rootDir,
};

const optionsWithNoUncheckedIndexedAccess = {
  project: './tsconfig.noUncheckedIndexedAccess.json',
  projectService: false,
  tsconfigRootDir: rootDir,
};

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
  errors: [{ column: 12, line: 4, messageId }],
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
switch (b1) {
  case true:
  default:
}
    `,
    `
declare function foo(): number | void;
const result1 = foo() === undefined;
const result2 = foo() == null;
    `,
    `
declare const bigInt: 0n | 1n;
if (bigInt) {
}
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
    `
function test<T>(arg: T, key: keyof T) {
  if (arg[key]?.toString()) {
  }
}
    `,
    `
function test<T>(arg: T, key: keyof T) {
  if (arg?.toString()) {
  }
}
    `,
    `
function test<T>(arg: T | { value: string }) {
  if (arg?.value) {
  }
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
    `
declare const test: <T>() => T;

[1, null].filter(test);
    `,
    `
declare const test: <T extends boolean>() => T;

[1, null].filter(test);
    `,
    `
[1, null].filter(1 as any);
    `,
    `
[1, null].filter(1 as never);
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
    {
      code: `
declare const arr: Array<{ value: string } & (() => void)>;
if (arr[42]?.value) {
}
arr[41]?.();
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
    {
      code: `
type TupleA = [string, number];
type TupleB = [string, number];

declare const foo: TupleA | TupleB;
declare const index: number;
foo[index]?.toString();
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
      `,
      options: [{ allowConstantLoopConditions: true }],
    },
    {
      code: `
for (; true; ) {}
      `,
      options: [{ allowConstantLoopConditions: true }],
    },
    {
      code: `
do {} while (true);
      `,
      options: [{ allowConstantLoopConditions: true }],
    },
    {
      code: `
while (true) {}
      `,
      options: [{ allowConstantLoopConditions: 'always' }],
    },
    {
      code: `
for (; true; ) {}
      `,
      options: [{ allowConstantLoopConditions: 'always' }],
    },
    {
      code: `
for (; true; ) {}
      `,
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
for (; 0; ) {}
      `,
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
do {} while (0);
      `,
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
do {} while (true);
      `,
      options: [{ allowConstantLoopConditions: 'always' }],
    },
    {
      code: `
while (true) {}
      `,
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
while (1) {}
      `,
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
while (false) {}
      `,
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
while (0) {}
      `,
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
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
        parserOptions: optionsWithNoUncheckedIndexedAccess,
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
        parserOptions: optionsWithNoUncheckedIndexedAccess,
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
        parserOptions: optionsWithNoUncheckedIndexedAccess,
      },
    },
    {
      code: `
type Foo = {
  key?: Record<string, { key: string }>;
};
declare const foo: Foo;
foo.key?.someKey?.key;
      `,
      languageOptions: {
        parserOptions: optionsWithNoUncheckedIndexedAccess,
      },
    },
    {
      code: `
type Foo = {
  key?: {
    [key: string]: () => void;
  };
};
declare const foo: Foo;
foo.key?.value?.();
      `,
      languageOptions: {
        parserOptions: optionsWithNoUncheckedIndexedAccess,
      },
    },
    {
      code: `
type A = {
  [name in Lowercase<string>]?: {
    [name in Lowercase<string>]: {
      a: 1;
    };
  };
};

declare const a: A;

a.a?.a?.a;
      `,
      languageOptions: {
        parserOptions: optionsWithNoUncheckedIndexedAccess,
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
          tsconfigRootDir: path.join(rootDir, 'unstrict'),
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
    `
declare function foo(): void | { key: string };
const bar = foo()?.key;
    `,
    `
type fn = () => void;
declare function foo(): void | fn;
const bar = foo()?.();
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
    {
      code: `
declare function assert(x: unknown): asserts x;

assert(Math.random() > 0.5);
      `,
      options: [{ checkTypePredicates: true }],
    },
    {
      code: `
declare function assert(x: unknown, y: unknown): asserts x;

assert(Math.random() > 0.5, true);
      `,
      options: [{ checkTypePredicates: true }],
    },
    {
      // should not report because option is disabled.
      code: `
declare function assert(x: unknown): asserts x;
assert(true);
      `,
      options: [{ checkTypePredicates: false }],
    },
    {
      // could be argued that this should report since `thisAsserter` is truthy.
      code: `
class ThisAsserter {
  assertThis(this: unknown, arg2: unknown): asserts this {}
}

const thisAsserter: ThisAsserter = new ThisAsserter();
thisAsserter.assertThis(true);
      `,
      options: [{ checkTypePredicates: true }],
    },
    {
      // could be argued that this should report since `thisAsserter` is truthy.
      code: `
class ThisAsserter {
  assertThis(this: unknown, arg2: unknown): asserts this {}
}

const thisAsserter: ThisAsserter = new ThisAsserter();
thisAsserter.assertThis(Math.random());
      `,
      options: [{ checkTypePredicates: true }],
    },
    {
      code: `
declare function assert(x: unknown): asserts x;
assert(...[]);
      `,
      options: [{ checkTypePredicates: true }],
    },
    {
      // ok to report if we start unpacking spread params one day.
      code: `
declare function assert(x: unknown): asserts x;
assert(...[], {});
      `,
      options: [{ checkTypePredicates: true }],
    },
    {
      code: `
declare function assertString(x: unknown): asserts x is string;
declare const a: string;
assertString(a);
      `,
      options: [{ checkTypePredicates: false }],
    },
    {
      code: `
declare function isString(x: unknown): x is string;
declare const a: string;
isString(a);
      `,
      options: [{ checkTypePredicates: false }],
    },
    {
      // Technically, this has type 'falafel' and not string.
      code: `
declare function assertString(x: unknown): asserts x is string;
assertString('falafel');
      `,
      options: [{ checkTypePredicates: true }],
    },
    {
      // Technically, this has type 'falafel' and not string.
      code: `
declare function isString(x: unknown): x is string;
isString('falafel');
      `,
      options: [{ checkTypePredicates: true }],
    },
    `
type A = { [name in Lowercase<string>]?: A };
declare const a: A;
a.a?.a?.a;
    `,
    `
interface T {
  [name: Lowercase<string>]: {
    [name: Lowercase<string>]: {
      [name: Lowercase<string>]: {
        value: 'value';
      };
    };
  };
  [name: Uppercase<string>]: null | {
    [name: Uppercase<string>]: null | {
      [name: Uppercase<string>]: null | {
        VALUE: 'VALUE';
      };
    };
  };
}

declare const t: T;

t.a.a.a.value;
t.A?.A?.A?.VALUE;
    `,
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
switch (b1) {
  case true:
  default:
}
      `,
      errors: [
        { column: 12, line: 4, messageId: 'alwaysTruthy' },
        { column: 12, line: 5, messageId: 'alwaysTruthy' },
        { column: 5, line: 6, messageId: 'alwaysTruthy' },
        { column: 11, line: 8, messageId: 'alwaysTruthy' },
        { column: 8, line: 10, messageId: 'alwaysTruthy' },
        { column: 14, line: 11, messageId: 'alwaysTruthy' },
        { column: 17, line: 12, messageId: 'alwaysTruthy' },
        { column: 12, line: 15, messageId: 'alwaysTruthy' },
        { column: 18, line: 16, messageId: 'alwaysTruthy' },
        {
          column: 8,
          data: {
            left: 'true',
            operator: '===',
            right: 'true',
            trueOrFalse: 'true',
          },
          line: 18,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
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
declare const falseyBigInt: 0n;
if (falseyBigInt) {
}
      `,
      errors: [{ column: 5, line: 3, messageId: 'alwaysFalsy' }],
    },
    {
      code: `
declare const posbigInt: 1n;
if (posbigInt) {
}
      `,
      errors: [{ column: 5, line: 3, messageId: 'alwaysTruthy' }],
    },
    {
      code: `
declare const negBigInt: -2n;
if (negBigInt) {
}
      `,
      errors: [{ column: 5, line: 3, messageId: 'alwaysTruthy' }],
    },
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
        { column: 5, line: 4, messageId: 'alwaysTruthy' },
        { column: 11, line: 6, messageId: 'alwaysFalsy' },
        { column: 17, line: 8, messageId: 'alwaysTruthy' },
      ],
    },

    // Generic type params
    {
      code: `
function test<T extends object>(t: T) {
  return t ? 'yes' : 'no';
}
      `,
      errors: [{ column: 10, line: 3, messageId: 'alwaysTruthy' }],
    },
    {
      code: `
function test<T extends false>(t: T) {
  return t ? 'yes' : 'no';
}
      `,
      errors: [{ column: 10, line: 3, messageId: 'alwaysFalsy' }],
    },
    {
      code: `
function test<T extends 'a' | 'b'>(t: T) {
  return t ? 'yes' : 'no';
}
      `,
      errors: [{ column: 10, line: 3, messageId: 'alwaysTruthy' }],
    },

    // Boolean expressions
    {
      code: `
function test(a: 'a') {
  return a === 'a';
}
      `,
      errors: [
        {
          column: 10,
          data: {
            left: '"a"',
            operator: '===',
            right: '"a"',
            trueOrFalse: 'true',
          },
          line: 3,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
declare const a: '34';
declare const b: '56';
a > b;
      `,
      errors: [
        {
          data: {
            left: '"34"',
            operator: '>',
            right: '"56"',
            trueOrFalse: 'false',
          },
          line: 4,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
const y = 1;
if (y === 0) {
}
      `,
      errors: [
        {
          data: {
            left: '1',
            operator: '===',
            right: '0',
            trueOrFalse: 'false',
          },
          line: 3,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
// @ts-expect-error
if (1 == '1') {
}
      `,
      errors: [
        {
          data: {
            left: '1',
            operator: '==',
            right: '"1"',
            trueOrFalse: 'true',
          },
          line: 3,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
2.3 > 2.3;
      `,
      errors: [
        {
          data: {
            left: '2.3',
            operator: '>',
            right: '2.3',
            trueOrFalse: 'false',
          },
          line: 2,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
2.3 >= 2.3;
      `,
      errors: [
        {
          data: {
            left: '2.3',
            operator: '>=',
            right: '2.3',
            trueOrFalse: 'true',
          },
          line: 2,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
2n < 2n;
      `,
      errors: [
        {
          data: {
            left: '2n',
            operator: '<',
            right: '2n',
            trueOrFalse: 'false',
          },
          line: 2,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
2n <= 2n;
      `,
      errors: [
        {
          data: {
            left: '2n',
            operator: '<=',
            right: '2n',
            trueOrFalse: 'true',
          },
          line: 2,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
-2n !== 2n;
      `,
      errors: [
        {
          data: {
            left: '-2n',
            operator: '!==',
            right: '2n',
            trueOrFalse: 'true',
          },
          line: 2,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
// @ts-expect-error
if (1 == '2') {
}
      `,
      errors: [
        {
          data: {
            left: '1',
            operator: '==',
            right: '"2"',
            trueOrFalse: 'false',
          },
          line: 3,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
// @ts-expect-error
if (1 != '2') {
}
      `,
      errors: [
        {
          data: {
            left: '1',
            operator: '!=',
            right: '"2"',
            trueOrFalse: 'true',
          },
          line: 3,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
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
      errors: [
        {
          column: 5,
          data: {
            left: 'Foo.a',
            operator: '===',
            right: 'Foo.a',
            trueOrFalse: 'true',
          },
          line: 8,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
enum Foo {
  a = 1,
  b = 2,
}

const x = Foo.a;
if (x === 1) {
}
      `,
      errors: [
        {
          column: 5,
          data: {
            left: 'Foo.a',
            operator: '===',
            right: 1,
            trueOrFalse: 'true',
          },
          line: 8,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      // narrowed to null. always-true because of loose nullish equality
      code: `
function takesMaybeValue(a: null | object) {
  if (a) {
  } else if (a == undefined) {
  }
}
      `,
      errors: [
        {
          column: 14,
          data: {
            left: 'null',
            operator: '==',
            right: 'undefined',
            trueOrFalse: 'true',
          },
          endColumn: 28,
          endLine: 4,
          line: 4,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      // narrowed to null. always-false because of strict undefined equality
      code: `
function takesMaybeValue(a: null | object) {
  if (a) {
  } else if (a === undefined) {
  }
}
      `,
      errors: [
        {
          column: 14,
          data: {
            left: 'null',
            operator: '===',
            right: 'undefined',
            trueOrFalse: 'false',
          },
          endColumn: 29,
          endLine: 4,
          line: 4,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      // narrowed to null. always-false because of loose nullish equality
      code: `
function takesMaybeValue(a: null | object) {
  if (a) {
  } else if (a != undefined) {
  }
}
      `,
      errors: [
        {
          column: 14,
          data: {
            left: 'null',
            operator: '!=',
            right: 'undefined',
            trueOrFalse: 'false',
          },
          endColumn: 28,
          endLine: 4,
          line: 4,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      // narrowed to null. always-true because of strict undefined equality
      code: `
function takesMaybeValue(a: null | object) {
  if (a) {
  } else if (a !== undefined) {
  }
}
      `,
      errors: [
        {
          column: 14,
          data: {
            left: 'null',
            operator: '!==',
            right: 'undefined',
            trueOrFalse: 'true',
          },
          endColumn: 29,
          endLine: 4,
          line: 4,
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
true === false;
      `,
      errors: [
        {
          data: {
            left: 'true',
            operator: '===',
            right: 'false',
            trueOrFalse: 'false',
          },
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
true === true;
      `,
      errors: [
        {
          data: {
            left: 'true',
            operator: '===',
            right: 'true',
            trueOrFalse: 'true',
          },
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
    },
    {
      code: `
true === undefined;
      `,
      errors: [
        {
          data: {
            left: 'true',
            operator: '===',
            right: 'undefined',
            trueOrFalse: 'false',
          },
          messageId: 'comparisonBetweenLiteralTypes',
        },
      ],
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
        { column: 14, line: 3, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 4, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 5, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 6, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 7, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 8, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 9, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 10, messageId: 'noOverlapBooleanExpression' },
      ],
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
        { column: 14, line: 7, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 8, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 9, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 10, messageId: 'noOverlapBooleanExpression' },
      ],
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
        { column: 14, line: 3, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 4, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 5, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 6, messageId: 'noOverlapBooleanExpression' },
      ],
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
        { column: 14, line: 3, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 4, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 5, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 6, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 7, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 8, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 9, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 10, messageId: 'noOverlapBooleanExpression' },
        { column: 14, line: 11, messageId: 'noOverlapBooleanExpression' },
        { column: 15, line: 12, messageId: 'noOverlapBooleanExpression' },
        { column: 15, line: 13, messageId: 'noOverlapBooleanExpression' },
        { column: 15, line: 14, messageId: 'noOverlapBooleanExpression' },
        { column: 15, line: 15, messageId: 'noOverlapBooleanExpression' },
        { column: 15, line: 16, messageId: 'noOverlapBooleanExpression' },
        { column: 15, line: 17, messageId: 'noOverlapBooleanExpression' },
        { column: 15, line: 18, messageId: 'noOverlapBooleanExpression' },
      ],
    },
    // Nullish coalescing operator
    {
      code: `
function test(a: string) {
  return a ?? 'default';
}
      `,
      errors: [{ column: 10, line: 3, messageId: 'neverNullish' }],
    },
    {
      code: `
function test(a: string | false) {
  return a ?? 'default';
}
      `,
      errors: [{ column: 10, line: 3, messageId: 'neverNullish' }],
    },
    {
      code: `
function test<T extends string>(a: T) {
  return a ?? 'default';
}
      `,
      errors: [{ column: 10, line: 3, messageId: 'neverNullish' }],
    },
    // nullish + array index without optional chaining
    {
      code: `
function test(a: { foo: string }[]) {
  return a[0].foo ?? 'default';
}
      `,
      errors: [{ column: 10, line: 3, messageId: 'neverNullish' }],
    },
    {
      code: `
function test(a: null) {
  return a ?? 'default';
}
      `,
      errors: [{ column: 10, line: 3, messageId: 'alwaysNullish' }],
    },
    {
      code: `
function test(a: null[]) {
  return a[0] ?? 'default';
}
      `,
      errors: [{ column: 10, line: 3, messageId: 'alwaysNullish' }],
    },
    {
      code: `
function test<T extends null>(a: T) {
  return a ?? 'default';
}
      `,
      errors: [{ column: 10, line: 3, messageId: 'alwaysNullish' }],
    },
    {
      code: `
function test(a: never) {
  return a ?? 'default';
}
      `,
      errors: [{ column: 10, line: 3, messageId: 'never' }],
    },
    {
      code: `
function test<T extends { foo: number }, K extends 'foo'>(num: T[K]) {
  num ?? 'default';
}
      `,
      errors: [{ column: 3, line: 3, messageId: 'neverNullish' }],
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
        { column: 24, line: 2, messageId: 'alwaysTruthy' },
        { column: 10, line: 4, messageId: 'alwaysFalsy' },
        { column: 25, line: 9, messageId: 'alwaysFalsy' },
        { column: 25, line: 13, messageId: 'alwaysFalsy' },
        { column: 25, line: 17, messageId: 'alwaysFalsy' },
      ],
    },
    {
      code: `
declare const test: <T extends true>() => T;

[1, null].filter(test);
      `,
      errors: [{ column: 18, line: 4, messageId: 'alwaysTruthyFunc' }],
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
      errors: [{ column: 5, line: 3, messageId: 'alwaysTruthy' }],
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
        {
          column: 5,
          line: 3,
          messageId: 'alwaysTruthy',
        },
        {
          column: 9,
          line: 5,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
const x = [{}] as [{ foo: string }];
if (x[0]) {
}
if (x[0].foo) {
}
      `,
            },
          ],
        },
      ],
    },
    {
      // Shouldn't mistake this for an array indexing case
      code: `
declare const arr: object[];
if (arr.filter) {
}
      `,
      errors: [{ column: 5, line: 3, messageId: 'alwaysTruthy' }],
    },
    {
      code: `
function truthy() {
  return [];
}
function falsy() {}
[1, 3, 5].filter(truthy);
[1, 2, 3].find(falsy);
[1, 2, 3].findLastIndex(falsy);
      `,
      errors: [
        { column: 18, line: 6, messageId: 'alwaysTruthyFunc' },
        { column: 16, line: 7, messageId: 'alwaysFalsyFunc' },
        { column: 25, line: 8, messageId: 'alwaysFalsyFunc' },
      ],
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
    //       errors: [({ line: 6, column: 23, messageId: 'alwaysTruthyFunc' })],
    //     },
    {
      code: `
declare const test: true;

while (test) {}
      `,
      errors: [{ column: 8, line: 4, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: false }],
    },
    {
      code: `
declare const test: true;

for (; test; ) {}
      `,
      errors: [{ column: 8, line: 4, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: false }],
    },
    {
      code: `
declare const test: true;

do {} while (test);
      `,
      errors: [{ column: 14, line: 4, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: false }],
    },
    {
      code: `
declare const test: true;

while (test) {}
      `,
      errors: [{ column: 8, line: 4, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: 'never' }],
    },
    {
      code: `
declare const test: true;

for (; test; ) {}
      `,
      errors: [{ column: 8, line: 4, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: 'never' }],
    },
    {
      code: `
declare const test: true;

do {} while (test);
      `,
      errors: [{ column: 14, line: 4, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: 'never' }],
    },
    {
      code: `
declare const test: true;

while (test) {}
      `,
      errors: [{ column: 8, line: 4, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
declare const test: 1;

while (test) {}
      `,
      errors: [{ column: 8, line: 4, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
declare const test: true;

for (; test; ) {}
      `,
      errors: [{ column: 8, line: 4, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
declare const test: true;

do {} while (test);
      `,
      errors: [{ column: 14, line: 4, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
let shouldRun = true;

while ((shouldRun = true)) {}
      `,
      errors: [{ column: 9, line: 4, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
while (2) {}
      `,
      errors: [{ column: 8, line: 2, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
    },
    {
      code: `
while ('truthy') {}
      `,
      errors: [{ column: 8, line: 2, messageId: 'alwaysTruthy' }],
      options: [{ allowConstantLoopConditions: 'only-allowed-literals' }],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = { bar: true };
foo.bar;
foo ?. bar;
foo ?.
  bar;
foo
  ?. bar;
      `,
            },
          ],
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = { bar: true };
foo?.bar;
foo . bar;
foo ?.
  bar;
foo
  ?. bar;
      `,
            },
          ],
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 5,
          line: 5,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = { bar: true };
foo?.bar;
foo ?. bar;
foo .
  bar;
foo
  ?. bar;
      `,
            },
          ],
        },
        {
          column: 3,
          endColumn: 5,
          endLine: 8,
          line: 8,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = { bar: true };
foo?.bar;
foo ?. bar;
foo ?.
  bar;
foo
  . bar;
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = () => {};
foo();
foo ?. ();
foo ?.
  ();
foo
  ?. ();
      `,
            },
          ],
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = () => {};
foo?.();
foo  ();
foo ?.
  ();
foo
  ?. ();
      `,
            },
          ],
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 5,
          line: 5,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = () => {};
foo?.();
foo ?. ();
foo${' '}
  ();
foo
  ?. ();
      `,
            },
          ],
        },
        {
          column: 3,
          endColumn: 5,
          endLine: 8,
          line: 8,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = () => {};
foo?.();
foo ?. ();
foo ?.
  ();
foo
   ();
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = () => {};
foo(bar);
foo ?. (bar);
foo ?.
  (bar);
foo
  ?. (bar);
      `,
            },
          ],
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = () => {};
foo?.(bar);
foo  (bar);
foo ?.
  (bar);
foo
  ?. (bar);
      `,
            },
          ],
        },
        {
          column: 5,
          endColumn: 7,
          endLine: 5,
          line: 5,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = () => {};
foo?.(bar);
foo ?. (bar);
foo${' '}
  (bar);
foo
  ?. (bar);
      `,
            },
          ],
        },
        {
          column: 3,
          endColumn: 5,
          endLine: 8,
          line: 8,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
let foo = () => {};
foo?.(bar);
foo ?. (bar);
foo ?.
  (bar);
foo
   (bar);
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: 'const foo = [1, 2, 3][0];',
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const x: { a?: { b: string } };
x.a?.b;
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const x: { a: { b?: { c: string } } };
x.a.b?.c;
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
let x: { a?: string };
x.a;
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const foo: { bar: { baz: { c: string } } } | null;
foo?.bar.baz;
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const foo: { bar?: { baz: { qux: string } } } | null;
foo?.bar?.baz.qux;
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const foo: { bar: { baz: { qux?: () => {} } } } | null;
foo?.bar.baz?.qux?.();
      `,
            },
          ],
        },
        {
          column: 14,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const foo: { bar: { baz: { qux?: () => {} } } } | null;
foo?.bar?.baz.qux?.();
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const foo: { bar: { baz: { qux: () => {} } } } | null;
foo?.bar.baz?.qux?.();
      `,
            },
          ],
        },
        {
          column: 14,
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const foo: { bar: { baz: { qux: () => {} } } } | null;
foo?.bar?.baz.qux?.();
      `,
            },
          ],
        },
        {
          column: 19,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const foo: { bar: { baz: { qux: () => {} } } } | null;
foo?.bar?.baz?.qux();
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
type baz = () => { qux: () => {} };
declare const foo: { bar: { baz: baz } } | null;
foo?.bar.baz?.().qux?.();
      `,
            },
          ],
        },
        {
          column: 14,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
type baz = () => { qux: () => {} };
declare const foo: { bar: { baz: baz } } | null;
foo?.bar?.baz().qux?.();
      `,
            },
          ],
        },
        {
          column: 22,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
type baz = () => { qux: () => {} };
declare const foo: { bar: { baz: baz } } | null;
foo?.bar?.baz?.().qux();
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
type baz = null | (() => { qux: () => {} });
declare const foo: { bar: { baz: baz } } | null;
foo?.bar.baz?.().qux?.();
      `,
            },
          ],
        },
        {
          column: 22,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
type baz = null | (() => { qux: () => {} });
declare const foo: { bar: { baz: baz } } | null;
foo?.bar?.baz?.().qux();
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
type baz = null | (() => { qux: () => {} } | null);
declare const foo: { bar: { baz: baz } } | null;
foo?.bar.baz?.()?.qux?.();
      `,
            },
          ],
        },
        {
          column: 23,
          endColumn: 25,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
type baz = null | (() => { qux: () => {} } | null);
declare const foo: { bar: { baz: baz } } | null;
foo?.bar?.baz?.()?.qux();
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
type Foo = { baz: number };
type Bar = { baz: null | string | { qux: string } };
declare const foo: { fooOrBar: Foo | Bar } | null;
foo?.fooOrBar.baz?.qux;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const x: { a: { b: number } }[];
x[0].a?.b;
      `,
      errors: [
        {
          column: 7,
          line: 3,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const x: { a: { b: number } }[];
x[0].a.b;
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
type Key = 'bar' | 'foo';
declare const foo: Foo;
declare const key: Key;

foo?.[key].trim();
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
type Foo = { [key: string]: string; foo: 'foo'; bar: 'bar' } | null;
declare const foo: Foo;
const key = 'bar';
foo?.[key].trim();
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
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
          ],
        },
      ],
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
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
          ],
        },
      ],
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
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/2255
    {
      code: `
const a = null;
if (!a) {
}
      `,
      errors: [{ column: 5, line: 3, messageId: 'alwaysTruthy' }],
    },
    {
      code: `
const a = true;
if (!a) {
}
      `,
      errors: [{ column: 5, line: 3, messageId: 'alwaysFalsy' }],
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
      errors: [{ column: 5, line: 7, messageId: 'never' }],
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
          tsconfigRootDir: path.join(rootDir, 'unstrict'),
        },
      },
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
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
          ],
        },
      ],
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
    },
    {
      code: `
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
type Foo = { bar: () => number } | null;
declare const foo: Foo;
foo?.bar().toExponential();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
type Foo = { bar: null | { baz: () => { qux: number } } } | null;
declare const foo: Foo;
foo?.bar?.baz().qux?.toExponential();
      `,
            },
          ],
        },
        {
          column: 21,
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
type Foo = { bar: null | { baz: () => { qux: number } } } | null;
declare const foo: Foo;
foo?.bar?.baz()?.qux.toExponential();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
type Foo = (() => number) | null;
declare const foo: Foo;
foo?.().toExponential();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
type Foo = { [key: string]: () => number } | null;
declare const foo: Foo;
foo?.['bar']().toExponential();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
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
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: noFormat`
type Foo = { [key: string]: () => number } | null;
declare const foo: Foo;
foo?.['bar']?.().toExponential();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        const a = true;
        if (!!a) {
        }
      `,
      errors: [{ column: 13, line: 3, messageId: 'alwaysTruthy' }],
    },
    {
      code: `
declare function assert(x: unknown): asserts x;
assert(true);
      `,
      errors: [
        {
          line: 3,
          messageId: 'alwaysTruthy',
        },
      ],
      options: [{ checkTypePredicates: true }],
    },
    {
      code: `
declare function assert(x: unknown): asserts x;
assert(false);
      `,
      errors: [
        {
          column: 8,
          line: 3,
          messageId: 'alwaysFalsy',
        },
      ],
      options: [{ checkTypePredicates: true }],
    },
    {
      code: `
declare function assert(x: unknown, y: unknown): asserts x;

assert(true, Math.random() > 0.5);
      `,
      errors: [
        {
          column: 8,
          line: 4,
          messageId: 'alwaysTruthy',
        },
      ],
      options: [{ checkTypePredicates: true }],
    },
    {
      code: `
declare function assert(x: unknown): asserts x;
assert({});
      `,
      errors: [
        {
          column: 8,
          line: 3,
          messageId: 'alwaysTruthy',
        },
      ],
      options: [{ checkTypePredicates: true }],
    },
    {
      code: `
declare function assertsString(x: unknown): asserts x is string;
declare const a: string;
assertsString(a);
      `,
      errors: [
        {
          line: 4,
          messageId: 'typeGuardAlreadyIsType',
        },
      ],
      options: [{ checkTypePredicates: true }],
    },
    {
      code: `
declare function isString(x: unknown): x is string;
declare const a: string;
isString(a);
      `,
      errors: [
        {
          line: 4,
          messageId: 'typeGuardAlreadyIsType',
        },
      ],
      options: [{ checkTypePredicates: true }],
    },
    {
      code: `
declare function isString(x: unknown): x is string;
declare const a: string;
isString('fa' + 'lafel');
      `,
      errors: [
        {
          line: 4,
          messageId: 'typeGuardAlreadyIsType',
        },
      ],
      options: [{ checkTypePredicates: true }],
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
    {
      code: `
type A = {
  [name in Lowercase<string>]?: {
    [name in Lowercase<string>]: {
      a: 1;
    };
  };
};

declare const a: A;

a.a?.a?.a;
      `,
      errors: [
        {
          column: 7,
          endColumn: 9,
          endLine: 12,
          line: 12,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
type A = {
  [name in Lowercase<string>]?: {
    [name in Lowercase<string>]: {
      a: 1;
    };
  };
};

declare const a: A;

a.a?.a.a;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
interface T {
  [name: Lowercase<string>]: {
    [name: Lowercase<string>]: {
      [name: Lowercase<string>]: {
        value: 'value';
      };
    };
  };
  [name: Uppercase<string>]: null | {
    [name: Uppercase<string>]: null | {
      [name: Uppercase<string>]: null | {
        VALUE: 'VALUE';
      };
    };
  };
}

declare const t: T;

t.a?.a?.a?.value;
      `,
      errors: [
        {
          column: 4,
          endColumn: 6,
          endLine: 21,
          line: 21,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
interface T {
  [name: Lowercase<string>]: {
    [name: Lowercase<string>]: {
      [name: Lowercase<string>]: {
        value: 'value';
      };
    };
  };
  [name: Uppercase<string>]: null | {
    [name: Uppercase<string>]: null | {
      [name: Uppercase<string>]: null | {
        VALUE: 'VALUE';
      };
    };
  };
}

declare const t: T;

t.a.a?.a?.value;
      `,
            },
          ],
        },
        {
          column: 7,
          endColumn: 9,
          endLine: 21,
          line: 21,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
interface T {
  [name: Lowercase<string>]: {
    [name: Lowercase<string>]: {
      [name: Lowercase<string>]: {
        value: 'value';
      };
    };
  };
  [name: Uppercase<string>]: null | {
    [name: Uppercase<string>]: null | {
      [name: Uppercase<string>]: null | {
        VALUE: 'VALUE';
      };
    };
  };
}

declare const t: T;

t.a?.a.a?.value;
      `,
            },
          ],
        },
        {
          column: 10,
          endColumn: 12,
          endLine: 21,
          line: 21,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
interface T {
  [name: Lowercase<string>]: {
    [name: Lowercase<string>]: {
      [name: Lowercase<string>]: {
        value: 'value';
      };
    };
  };
  [name: Uppercase<string>]: null | {
    [name: Uppercase<string>]: null | {
      [name: Uppercase<string>]: null | {
        VALUE: 'VALUE';
      };
    };
  };
}

declare const t: T;

t.a?.a?.a.value;
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const test: Array<{ a?: string }>;

if (test[0]?.a) {
  test[0]?.a;
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 12,
          endLine: 5,
          line: 5,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const test: Array<{ a?: string }>;

if (test[0]?.a) {
  test[0].a;
}
      `,
            },
          ],
        },
      ],
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
declare const arr2: Array<{ x: { y: { z: object } } }>;
arr2[42]?.x?.y?.z;
      `,
      errors: [
        {
          column: 12,
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const arr2: Array<{ x: { y: { z: object } } }>;
arr2[42]?.x.y?.z;
      `,
            },
          ],
        },
        {
          column: 15,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'neverOptionalChain',
          suggestions: [
            {
              messageId: 'suggestRemoveOptionalChain',
              output: `
declare const arr2: Array<{ x: { y: { z: object } } }>;
arr2[42]?.x?.y.z;
      `,
            },
          ],
        },
      ],
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
declare const arr: string[];

if (arr[0]) {
  arr[0] ?? 'foo';
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 9,
          endLine: 5,
          line: 5,
          messageId: 'neverNullish',
        },
      ],
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
declare const arr: object[];

if (arr[42] && arr[42]) {
}
      `,
      errors: [
        {
          column: 16,
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'alwaysTruthy',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: getFixturesRootDir(),
        },
      },
    },
  ],
});
