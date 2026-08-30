import rule from '../../src/rules/no-misleading-return-type';
import { createRuleTesterWithTypes } from '../RuleTester';

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
function getValue<T extends string | number>(
  value: T,
): T | (T extends string ? string : number) {
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
function getValue<T extends string>(value: T): T | \`\${T}\` {
  return value;
}
    `,
    `
function getValue<T>(value: T & string): \`\${T & string}\` | (T & string) {
  return value;
}
    `,
    `
function getValue(flag: boolean): \`value-\${string}\` | 'fallback' {
  return flag ? 'value-ready' : 'fallback';
}
    `,
    `
function getValue<T extends 'A' | 'B'>(value: T): T | Uppercase<T> {
  return value;
}
    `,
    `
function getValue<T extends { key?: string }>(value: T): T | Required<T> {
  return value;
}
    `,
    `
function getValue<T>(value: {
  right: true;
}): (T extends string ? { left: true } : { other: true }) | { right: true } {
  return value;
}
    `,
    `
function getValue<T extends { right: true }, U>(
  value: T,
): T | (U extends string ? { left: true } : { other: true }) {
  return value;
}
    `,
    `
function getValue<T, U>(value: T): T | (U extends string ? string : number) {
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
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
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
declare const values: string[];
function getValues(): Array<string | undefined> {
  return values;
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
interface Provider {
  getValue(): string | null;
}
const provider = {
  getValue(): string | null {
    return 'value';
  },
} as Provider;
    `,
    `
interface Provider {
  getValue(): string | null;
}
const provider = {
  getValue(): string | null {
    return 'value';
  },
} satisfies Provider;
    `,
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
function getValue<T extends undefined>(): string | T {
  return 'value';
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
type DefinedPromise<T> = Promise<Exclude<T, null>>;
function getValue(): DefinedPromise<string | null> {
  return Promise.resolve('value');
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
    // Type-invalid implementations must not make array projection throw.
    `
function getValues(): Array<string | null> {
  return 1;
}
    `,
    `
interface MisalignedThenable<T> {
  marker: T;
  then(onfulfilled: (value: number) => unknown): unknown;
}
declare const thenable: MisalignedThenable<string | null>;
function getValue(): MisalignedThenable<string | null> {
  return thenable;
}
    `,
    // Invalid thenables can make the checker return no awaited type.
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
interface InvalidThenable {
  then(onfulfilled: string): unknown;
}
function getValue(): Promise<string | InvalidThenable> {
  return Promise.resolve('value');
}
    `,
    // Recursive thenables have no safely computable awaited type.
    `
interface CircularThenable<T> {
  then(onfulfilled: (value: CircularThenable<T>) => unknown): unknown;
}
declare const thenable: CircularThenable<string>;
function getValue(): CircularThenable<string | null> {
  return thenable;
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
  ],
  invalid: [
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
  [key: \`get\${string}\`]: () => string | null;
}
class ProviderImpl implements Provider {
  [key: \`get\${string}\`]: () => string | null;
  other(): string | null {
    return 'value';
  }
}
      `,
      errors: [
        {
          column: 21,
          endColumn: 25,
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
interface CustomPromise<T> extends PromiseLike<T> {}
declare const result: CustomPromise<string>;
function getValue(): CustomPromise<string | null> {
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
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
        },
      },
    },
  ],
});
