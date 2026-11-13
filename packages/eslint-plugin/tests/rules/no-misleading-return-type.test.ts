import * as path from 'node:path';

import rule from '../../src/rules/no-misleading-return-type';
import { createRuleTesterWithTypes, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-misleading-return-type', rule, {
  valid: [
    `
function getValue() {
  return 'value';
}
    `,
    `
function getValue(): string {
  return 'value';
}
    `,
    `
function getValue(flag: boolean): string | null {
  if (flag) {
    return null;
  }
  return 'value';
}
    `,
    `
function getValue<T extends string | null>(value: T): string | null {
  return value;
}
    `,
    `
function getValue<T>(
  flag: boolean,
): (T extends unknown ? undefined : never) | string {
  if (flag) {
    return 'value';
  }
  return;
}
    `,
    `
function getValue(flag: boolean): \`value-\${string}\` | 'fallback' {
  return flag ? 'value-ready' : 'fallback';
}
    `,
    `
function getValue<T extends { key?: string }>(value: T): T | Required<T> {
  return value;
}
    `,
    `
function createValue(): { left: string } | { right: number } {
  return { left: 'value', right: 1 };
}
    `,
    `
declare const value: string;
function getValue(): string | 'value' {
  return value;
}
    `,
    `
function getValue(flag: boolean): 'ready' | 'idle' | string | null {
  return flag ? 'ready' : null;
}
    `,
    `
function getValue(flag: boolean): true | boolean | null {
  return flag ? false : null;
}
    `,
    `
type BooleanResult = boolean | 'fallback';
function getValue(flag: boolean): true | BooleanResult | null {
  return flag ? false : null;
}
    `,
    `
declare const result: string | null;
function getValue(): string | null {
  return result;
}
    `,
    {
      code: `
declare const values: string[];
function getValue(): string | null {
  const value = values[0];
  return value ?? null;
}
      `,
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootDir, 'noUncheckedIndexedAccess'),
        },
      },
    },
    `
type Result = string | null;
function getValue(): Result {
  return 'value';
}
    `,
    `
declare const values: Array<string | null>;
function getValues(): Array<string | null> {
  return values;
}
    `,
    `
class Values extends Array<string | null> {
  [index: number]: string;
  override pop() {
    return null;
  }
}
function getValues(): (string | null)[] {
  return new Values();
}
    `,
    `
declare const result: Pick<Promise<string>, 'then'> &
  Omit<Promise<string | null>, 'then'>;
function getValue(): Promise<string | null> {
  return result;
}
    `,
    `
interface Result
  extends PromiseLike<string>, Omit<Promise<string | null>, 'then'> {
  then: Promise<string>['then'];
}
declare const result: Result;
function getValue(): Promise<string | null> {
  return result;
}
    `,
    `
class Values<T> extends Array<T | null> {
  [index: number]: T;
  override pop() {
    return null;
  }
}
function getValues(): Array<string | null> {
  return new Values<string>();
}
    `,
    `
declare const values: ArrayLike<string | null>;
function getValues(): ArrayLike<string | null> {
  return values;
}
    `,
    `
interface Values<T> {
  readonly [index: number]: T;
  current: T;
}
declare const values: { [index: number]: string; current: null };
function getValues(): Values<string | null> {
  return values;
}
    `,
    `
interface Result<T> extends PromiseLike<T> {
  current: T;
}
declare const result: Promise<string> & { current: null };
function getValue(): Result<string | null> {
  return result;
}
    `,
    `
function getValue(): string;
function getValue(): string | null {
  return 'value';
}
    `,
    `
const getValue: () => string | null = (): string | null => 'value';
    `,
    `
class Provider {
  getValue: () => string | null = (): string | null => 'value';
}
    `,
    {
      code: `
interface Provider {
  getValue(): string | null;
}
class ProviderImpl implements Provider {
  accessor getValue = (): string | null => 'value';
}
      `,
      // `accessor` keyword requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
    },
    `
interface Provider {
  getValue(): string | null;
}
const provider = {
  getValue(): string | null {
    return 'value';
  },
} as Provider;
    `,
    {
      code: `
interface Provider {
  getValue(): string | null;
}
const provider = {
  getValue(): string | null {
    return 'value';
  },
} satisfies Provider;
      `,
      // `satisfies` requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
    },
    `
interface Provider {
  getValue(): string | null;
}
class ProviderImpl implements Provider {
  getValue(): string | null {
    return 'value';
  }
}
    `,
    `
interface NumericProvider {
  [key: number]: () => string | null;
}
interface NamedProvider {
  [key: string]: () => string | null;
}
class ProviderImpl implements NumericProvider, NamedProvider {
  [key: string]: () => string | null;
  getValue(): string | null {
    return 'value';
  }
}
    `,
    `
interface Provider {
  [key: string]: () => string | null;
}
class ProviderImpl implements Provider {
  [key: string]: () => string | null;
  getValue(): string | null {
    return 'value';
  }
}
    `,
    `
interface Provider {
  [key: number]: () => string | null;
}
class ProviderImpl implements Provider {
  [key: number]: () => string | null;
  '0'(): string | null {
    return 'value';
  }
}
    `,
    `
interface Provider {
  [key: string]: () => string | null;
}
class ProviderImpl implements Provider {
  [key: string]: () => string | null;
  0(): string | null {
    return 'value';
  }
}
    `,
    `
interface Provider {
  [key: \`get\${string}\`]: () => string | null;
}
class ProviderImpl implements Provider {
  [key: \`get\${string}\`]: () => string | null;
  getValue(): string | null {
    return 'value';
  }
}
    `,
    `
interface Provider {
  [key: \`get\${string}\`]: () => string | null;
}
class ProviderImpl implements Provider {
  [key: \`get\${string}\`]: () => string | null;
  other(): string | null {
    return 'value';
  }
}
    `,
    `
interface Provider {
  [key: symbol]: () => string | null;
}
declare const method: unique symbol;
class ProviderImpl implements Provider {
  [key: symbol]: () => string | null;
  [method](): string | null {
    return 'value';
  }
}
    `,
    `
interface Provider {
  getValue: () => string | null;
}
class ProviderImpl implements Provider {
  getValue = (): string | null => 'value';
}
    `,
    `
class Base {
  getValue = (): string | null => (Math.random() > 0.5 ? 'value' : null);
}
class Derived extends Base {
  override getValue = (): string | null => 'value';
}
    `,
    `
function getValue(): string | null {
  throw new Error('unreachable');
}
    `,
    `
function getValue(): string | null {
  return JSON.parse('"value"');
}
    `,
    `
function getValue(flag: boolean): string | undefined {
  if (flag) {
    return 'value';
  }
}
    `,
    `
class Values {
  getValue(): string;
  getValue(): string | null {
    return 'value';
  }
}
    `,
    `
class Base {
  static getValue(): string | null {
    return Math.random() > 0.5 ? 'value' : null;
  }
}
class Derived extends Base {
  static getValue(): string | null {
    return 'value';
  }
}
    `,
    `
declare const method: unique symbol;
class Base {
  [method](): string | null {
    return Math.random() > 0.5 ? 'value' : null;
  }
}
class Derived extends Base {
  [method](): string | null {
    return 'value';
  }
}
    `,
    `
function preserveClass<T extends Function>(value: T): T {
  return value;
}

@preserveClass
class Values {
  getValue(): string | null {
    return 'value';
  }
}
    `,
    `
function replaceMethod(
  _target: object,
  _propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<() => string | null>,
): void {
  descriptor.value = () => null;
}

class Values {
  @replaceMethod
  getValue(): string | null {
    return 'value';
  }
}
    `,
    `
async function getValue(flag: boolean): Promise<string | null> {
  if (flag) {
    return 'value';
  }
  return null;
}
    `,
    `
type DefinedArray<T> = Array<Exclude<T, null>>;
function getValues(): DefinedArray<string | null> {
  return ['value'];
}
    `,
    `
function createProvider() {
  type Promise<T> = { value: T };
  function getValue(): Promise<string | null> {
    return { value: 'value' };
  }
  return getValue;
}
    `,
    `
function createValues() {
  type Array<T> = { value: T };
  function getValues(): Array<string | null> {
    return { value: 'value' };
  }
  return getValues;
}
    `,
    // Type-invalid code must not be reported.
    `
function getValues(): Array<string | null> {
  return 1;
}
    `,
    `
interface InvalidThenable {
  then(onfulfilled: string): unknown;
}
declare const thenable: InvalidThenable;
function getValue(): Promise<string | null> {
  return thenable;
}
    `,
    `
function createProvider() {
  type Promise<T> = { value: T };
  async function getValue(): Promise<string | null> {
    return 'value';
  }
  return getValue;
}
    `,
    `
async function getValue(): Promise<string> | null {
  return 'value';
}
    `,
    `
interface InvalidThenable {
  then(onfulfilled: string): unknown;
}
declare const thenable: InvalidThenable;
async function getValue(): Promise<string | null> {
  return thenable;
}
    `,
    `
function createValue(): { name: string | null } {
  return 1;
}
    `,
    `
function getValue(): Missing<string | null> {
  return 'value';
}
    `,
    `
function* getValues():
  Generator<string, void, unknown> | Generator<'value', void, unknown> {
  yield 'value';
}
    `,
    `
declare const value: unknown;
function getValue(): unknown | string {
  return value;
}
    `,
    `
function getValue(): string | never {
  return 'value';
}
    `,
    `
function getValue(): string | any {
  return 1;
}
    `,
    `
async function getValue(): Promise<string | unknown> {
  return 1;
}
    `,
    `
declare function fail(): never;
function getValue(): string | null {
  return fail();
}
    `,
    `
function getValue(flag: boolean): string | void {
  if (flag) {
    return 'value';
  }
  return;
}
    `,
    `
function getValue(flag: boolean): string | undefined {
  if (flag) {
    return;
  }
  return 'value';
}
    `,
    `
type TextValue = string;
function getValue(): string | TextValue {
  return 'value';
}
    `,
    `
function isTextValue(value: unknown): value is string | number {
  return typeof value === 'string';
}
    `,
    `
function getValues(): (string | null)[] {
  return [];
}
    `,
    `
function getResult(flag: boolean): [string | null, Error | null] {
  return flag ? ['value', null] : [null, new Error('message')];
}
    `,
    `
function getValues(): [first: string, second?: string | undefined] {
  return ['first', 'second'];
}
    `,
    `
function getValues(): [string, (string | null)?] {
  return ['first', 'second'];
}
    `,
    `
function getValues(): [string | null, ...number[]] {
  return ['value', 1, 2];
}
    `,
    `
function createValue(flag: boolean): { name: string | null } {
  return flag ? { name: 'value' } : { name: null };
}
    `,
    `
declare const key: unique symbol;
function createValue(): {
  [key]: string | null;
  getName(): string | null;
  name?: string | null;
  untyped;
} {
  return { [key]: 'value', getName: () => 'value', name: 'value', untyped: 1 };
}
    `,
    `
function getGetter(): () => string | null {
  return () => 'value';
}
    `,
    `
function getValues(): Set<string | null> {
  return new Set();
}
    `,
    `
interface Sink<T> {
  write(value: T): void;
}
declare const sink: Sink<string>;
function getSink(): Sink<string | null> {
  return sink;
}
    `,
    `
interface Box<T> {
  value: T;
}
function createBox(): Box<string | null> {
  return { value: 'value' };
}
    `,
    `
type Maybe<T> = T | null;
function getValue(): Maybe<string | undefined> {
  return 'value';
}
    `,
    `
interface Thenable {
  then: PromiseLike<string>['then'];
}
declare const thenable: Thenable;
function getValue(): PromiseLike<string | null> {
  return thenable;
}
    `,
    `
type Async<T> = Promise<T>;
async function getValue(): Async<string | null> {
  return 'value';
}
    `,
    // Without strictNullChecks, every type already includes null and undefined.
    {
      code: `
function getValue(): string | null | undefined {
  return 'value';
}
      `,
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootDir, 'unstrict'),
        },
      },
    },
  ],
  invalid: [
    {
      code: `
class Provider {
  accessor getValue = (): string | null => 'value';
}
      `,
      // `accessor` keyword requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
      errors: [
        {
          column: 36,
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
class Provider {
  getValue = (): string | null => 'value';
}
      `,
      errors: [
        {
          column: 27,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): string | null {
  return 'value';
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): string | (number | null) {
  return 1;
}
      `,
      errors: [
        {
          column: 22,
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
        {
          column: 41,
          endColumn: 45,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
class Values {
  static getValue(): string | null {
    return 'value';
  }
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
class Values {
  getValue(): string | null {
    return 'value';
  }
}
      `,
      errors: [
        {
          column: 24,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
class Base {
  #getValue(): string | null {
    return Math.random() > 0.5 ? 'value' : null;
  }
}
class Derived extends Base {
  #getValue(): string | null {
    return 'value';
  }
}
      `,
      errors: [
        {
          column: 25,
          endColumn: 29,
          endLine: 8,
          line: 8,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
interface Provider {
  getValue(): string | null;
}
class ProviderImpl implements Provider {
  static getValue(): string | null {
    return 'value';
  }

  getValue(): string | null {
    return Math.random() > 0.5 ? 'value' : null;
  }
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 6,
          line: 6,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
class Base {
  static [key: string]: () => number;
}
class Derived extends Base {
  static getValue(): string | null {
    return 'value';
  }
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 6,
          line: 6,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
interface Provider {
  [key: number]: () => string | null;
}
class ProviderImpl implements Provider {
  [key: number]: () => string | null;
  getValue(): string | null {
    return 'value';
  }
}
      `,
      errors: [
        {
          column: 24,
          endColumn: 28,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
interface Provider {
  [key: symbol]: () => string | null;
}
class ProviderImpl implements Provider {
  [key: symbol]: () => string | null;
  getValue(): string | null {
    return 'value';
  }
}
      `,
      errors: [
        {
          column: 24,
          endColumn: 28,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
interface Provider {
  [key: string]: () => string | null;
}
declare const method: unique symbol;
class ProviderImpl implements Provider {
  [key: string]: () => string | null;
  [method](): string | null {
    return 'value';
  }
}
      `,
      errors: [
        {
          column: 24,
          endColumn: 28,
          endLine: 8,
          line: 8,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
interface Provider {
  [key: string]: () => string | null;
}
class ProviderImpl implements Provider {
  [key: string]: () => string | null;
  #getValue(): string | null {
    return 'value';
  }
}
      `,
      errors: [
        {
          column: 25,
          endColumn: 29,
          endLine: 7,
          line: 7,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: "const getValue = (): string | null => 'value';",
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
const getValue = function (): string | null {
  return 'value';
};
      `,
      errors: [
        {
          column: 40,
          endColumn: 44,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
async function getValue(): Promise<string | null> {
  return 'value';
}
      `,
      errors: [
        {
          column: 45,
          endColumn: 49,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
async function getValue(): globalThis.Promise<string | null> {
  return 'value';
}
      `,
      errors: [
        {
          column: 56,
          endColumn: 60,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const result: Pick<Promise<string>, 'then'> &
  Omit<Promise<string | null>, 'then'>;
async function getValue(): Promise<string | null> {
  return result;
}
      `,
      errors: [
        {
          column: 45,
          endColumn: 49,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
async function getValue<T>(value: T): Promise<T | null> {
  return value;
}
      `,
      errors: [
        {
          column: 51,
          endColumn: 55,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(value: T): Promise<T | null> {
  return Promise.resolve(value);
}
      `,
      errors: [
        {
          column: 45,
          endColumn: 49,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): PromiseLike<string | null> {
  return Promise.resolve('value');
}
      `,
      errors: [
        {
          column: 43,
          endColumn: 47,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
async function getValue(): Promise<Promise<string> | null> {
  return 'value';
}
      `,
      errors: [
        {
          column: 54,
          endColumn: 58,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValues(): Array<string | null> {
  return ['value'];
}
      `,
      errors: [
        {
          column: 38,
          endColumn: 42,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValues(): (string | null)[] {
  return ['value'];
}
      `,
      errors: [
        {
          column: 33,
          endColumn: 37,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValues(): readonly (string | null)[] {
  return ['value'];
}
      `,
      errors: [
        {
          column: 42,
          endColumn: 46,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValues<T extends string[]>(values: T): Array<string | null> {
  return values;
}
      `,
      errors: [
        {
          column: 67,
          endColumn: 71,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const values: string[] | number[];
function getValues(): Array<string | number | null> {
  return values;
}
      `,
      errors: [
        {
          column: 47,
          endColumn: 51,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const values: { name: string } & string[];
function getValues(): Array<string | null> {
  return values;
}
      `,
      errors: [
        {
          column: 38,
          endColumn: 42,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const values: readonly [string, number];
function getValues(): readonly (string | number | null)[] {
  return values;
}
      `,
      errors: [
        {
          column: 51,
          endColumn: 55,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
interface Values extends ReadonlyArray<string> {}
declare const values: Values;
function getValues(): ReadonlyArray<string | null> {
  return values;
}
      `,
      errors: [
        {
          column: 46,
          endColumn: 50,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const values: ArrayLike<string>;
function getValues(): ArrayLike<string | null> {
  return values;
}
      `,
      errors: [
        {
          column: 42,
          endColumn: 46,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): Promise<string | null> {
  return Promise.resolve('value');
}
      `,
      errors: [
        {
          column: 39,
          endColumn: 43,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): 'ready' | 'idle' {
  return 'ready';
}
      `,
      errors: [
        {
          column: 32,
          endColumn: 38,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): 'ready' | string | null {
  return null;
}
      `,
      errors: [
        {
          column: 32,
          endColumn: 38,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): true | boolean | null {
  return null;
}
      `,
      errors: [
        {
          column: 29,
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function createValue(): { kind: 'ready' } | { kind: 'idle' } {
  return { kind: 'ready' };
}
      `,
      errors: [
        {
          column: 45,
          endColumn: 61,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function createValue(): { left: string } | { right: number } | null {
  return { left: 'value', right: 1 };
}
      `,
      errors: [
        {
          column: 64,
          endColumn: 68,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const missing: unique symbol;
function getValue(): object | typeof missing {
  return {};
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 45,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
type TextValue = string;
type MissingValue = null;
function getValue(): TextValue | MissingValue {
  return 'value';
}
      `,
      errors: [
        {
          column: 34,
          endColumn: 46,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(value: T): T | null {
  return value;
}
      `,
      errors: [
        {
          column: 37,
          endColumn: 41,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(values: Map<string, T>, key: string): T | null {
  return values.get(key)!;
}
      `,
      errors: [
        {
          column: 64,
          endColumn: 68,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends string | null>(value: T): string | null | number {
  return value;
}
      `,
      errors: [
        {
          column: 71,
          endColumn: 77,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends string>(value: null): \`\${T}\` | null {
  return value;
}
      `,
      errors: [
        {
          column: 51,
          endColumn: 57,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): \`value-\${string}\` | 'fallback' {
  return 'fallback';
}
      `,
      errors: [
        {
          column: 22,
          endColumn: 39,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(value: null): (T extends string ? string : number) | null {
  return value;
}
      `,
      errors: [
        {
          column: 37,
          endColumn: 71,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(value: {
  key: string;
}): (T extends string ? string : number) | { key: string } {
  return value;
}
      `,
      errors: [
        {
          column: 6,
          endColumn: 40,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends object, U>(
  value: T,
): T | (U extends string ? string : number) {
  return value;
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 43,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends string>(value: null): Uppercase<T> | null {
  return value;
}
      `,
      errors: [
        {
          column: 51,
          endColumn: 63,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): boolean | null {
  return true;
}
      `,
      errors: [
        {
          column: 32,
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
const values = {
  getValue(): string | null {
    return 'value';
  },
};
      `,
      errors: [
        {
          column: 24,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
const values = {
  get current(): string | null {
    return 'value';
  },
};
      `,
      errors: [
        {
          column: 27,
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): string | null {
  function getFallback(): null {
    return null;
  }
  getFallback;
  return 'value';
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const result: string | number;
function getValue(): string | number | null {
  return result;
}
      `,
      errors: [
        {
          column: 40,
          endColumn: 44,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
const values = ['value'] as const;
function getValue(): string | null {
  return values[0];
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const values: string[];
function getValue(): string | null {
  return values[0];
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): string | null {
  const [value] = ['value'] as const;
  return value;
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const values: string[];
function getValue(): string | null {
  return values[0] ?? null;
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const values: string[];
function getValue(): string | null {
  return values[0] ?? 'fallback';
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
      languageOptions: {
        parserOptions: {
          tsconfigRootDir: path.join(rootDir, 'noUncheckedIndexedAccess'),
        },
      },
    },
    {
      code: `
function getValue<T extends string | number>(
  value: T,
): T | (T extends string ? string : number) {
  return value;
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 43,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends string>(value: T): T | \`\${T}\` {
  return value;
}
      `,
      errors: [
        {
          column: 52,
          endColumn: 58,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(value: T & string): \`\${T & string}\` | (T & string) {
  return value;
}
      `,
      errors: [
        {
          column: 42,
          endColumn: 57,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends 'A' | 'B'>(value: T): T | Uppercase<T> {
  return value;
}
      `,
      errors: [
        {
          column: 55,
          endColumn: 67,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T>(value: {
  right: true;
}): (T extends string ? { left: true } : { other: true }) | { right: true } {
  return value;
}
      `,
      errors: [
        {
          column: 6,
          endColumn: 57,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends { right: true }, U>(
  value: T,
): T | (U extends string ? { left: true } : { other: true }) {
  return value;
}
      `,
      errors: [
        {
          column: 9,
          endColumn: 60,
          endLine: 4,
          line: 4,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T, U>(value: T): T | (U extends string ? string : number) {
  return value;
}
      `,
      errors: [
        {
          column: 41,
          endColumn: 75,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
enum AllowedType {
  Number,
  String,
  Unknown,
}
enum TypeFlags {
  Unknown = 2,
}
declare function getAllowedType(): AllowedType;
function getValue(): AllowedType | TypeFlags.Unknown | undefined {
  return getAllowedType();
}
      `,
      errors: [
        {
          column: 36,
          endColumn: 53,
          endLine: 11,
          line: 11,
          messageId: 'unnecessaryType',
        },
        {
          column: 56,
          endColumn: 65,
          endLine: 11,
          line: 11,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
enum FirstText {
  Value = 'value',
}
enum SecondText {
  Value = 'value',
}
function getText(): FirstText.Value | SecondText.Value {
  return FirstText.Value;
}
      `,
      errors: [
        {
          column: 39,
          endColumn: 55,
          endLine: 8,
          line: 8,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValues(): Set<string | null> {
  return new Set(['value']);
}
      `,
      errors: [
        {
          column: 36,
          endColumn: 40,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const values: string[];
function getValues(): Array<string | undefined> {
  return values;
}
      `,
      errors: [
        {
          column: 38,
          endColumn: 47,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue<T extends undefined>(): string | T {
  return 'value';
}
      `,
      errors: [
        {
          column: 52,
          endColumn: 53,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
interface InvalidThenable {
  then(onfulfilled: string): unknown;
}
function getValue(): Promise<string | InvalidThenable> {
  return Promise.resolve('value');
}
      `,
      errors: [
        {
          column: 39,
          endColumn: 54,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): string | undefined {
  return 'value';
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 40,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(flag: boolean): string | undefined {
  if (flag) {
    return 'value';
  }
  throw new Error('message');
}
      `,
      errors: [
        {
          column: 44,
          endColumn: 53,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValue(): string | void {
  return 'value';
}
      `,
      errors: [
        {
          column: 31,
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
async function getValue(): Promise<string | undefined> {
  return 'value';
}
      `,
      errors: [
        {
          column: 45,
          endColumn: 54,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
type TextValue = string;
function getValue(): string | TextValue | null {
  return null;
}
      `,
      errors: [
        {
          column: 22,
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
        {
          column: 31,
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
interface Config {
  name: string;
}
function getKey(): keyof Config | null {
  return 'name';
}
      `,
      errors: [
        {
          column: 35,
          endColumn: 39,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
interface InvalidThenable {
  then(onfulfilled: string): unknown;
}
async function getValue(): Promise<string | InvalidThenable> {
  return 'value';
}
      `,
      errors: [
        {
          column: 45,
          endColumn: 60,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValues(): Promise<Array<string | null>> {
  return Promise.resolve(['value']);
}
      `,
      errors: [
        {
          column: 46,
          endColumn: 50,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
async function getValues(): Promise<Array<string | null>> {
  return ['value'];
}
      `,
      errors: [
        {
          column: 52,
          endColumn: 56,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValues(): ArrayLike<string | null> {
  return ['value'];
}
      `,
      errors: [
        {
          column: 42,
          endColumn: 46,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const values: string[];
function getValues(): ReadonlyArray<string | null> {
  return values;
}
      `,
      errors: [
        {
          column: 46,
          endColumn: 50,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValues(): [string | null, number] {
  return ['value', 1];
}
      `,
      errors: [
        {
          column: 33,
          endColumn: 37,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getResult(): [value: string | null, error: Error | null] {
  return ['value', null];
}
      `,
      errors: [
        {
          column: 40,
          endColumn: 44,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
        {
          column: 53,
          endColumn: 58,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
declare const values: [string, number] & { extra: boolean };
function getValues(): readonly [string | null, number] {
  return values;
}
      `,
      errors: [
        {
          column: 42,
          endColumn: 46,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function createValue(): { a: string | number } {
  return { a: 'no numbers here' };
}
      `,
      errors: [
        {
          column: 39,
          endColumn: 45,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function createValue(): { 'quoted-name': { name: string | null } } {
  return { 'quoted-name': { name: 'value' } };
}
      `,
      errors: [
        {
          column: 59,
          endColumn: 63,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function createValue():
  { kind: 'ready'; value: string | null } | { kind: 'idle' } {
  return { kind: 'ready', value: 'value' };
}
      `,
      errors: [
        {
          column: 36,
          endColumn: 40,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
        {
          column: 45,
          endColumn: 61,
          endLine: 3,
          line: 3,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function getValues(): Map<string | number, string | null> {
  return new Map([['key', 'value']]);
}
      `,
      errors: [
        {
          column: 36,
          endColumn: 42,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
        {
          column: 53,
          endColumn: 57,
          endLine: 2,
          line: 2,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
class Box<T> {
  constructor(readonly value: T) {}
}
function createBox(): Box<string | null> {
  return new Box('value');
}
      `,
      errors: [
        {
          column: 36,
          endColumn: 40,
          endLine: 5,
          line: 5,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
namespace Shapes {
  export class Box<T> {
    constructor(readonly value: T) {}
  }
}
import Box = Shapes.Box;
function createBox(): Box<string | null> {
  return new Box('value');
}
      `,
      errors: [
        {
          column: 36,
          endColumn: 40,
          endLine: 8,
          line: 8,
          messageId: 'unnecessaryType',
        },
      ],
    },
    {
      code: `
function createFactory<T>(first: T) {
  class Pair<U> {
    constructor(
      readonly first: T,
      readonly second: U,
    ) {}
  }
  function createPair(): Pair<string | null> {
    return new Pair(first, 'value');
  }
  return createPair;
}
      `,
      errors: [
        {
          column: 40,
          endColumn: 44,
          endLine: 9,
          line: 9,
          messageId: 'unnecessaryType',
        },
      ],
    },
  ],
});
