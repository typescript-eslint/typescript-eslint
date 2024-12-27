import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-extraneous-return-types';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('no-extraneous-return-types', rule, {
  valid: [
    // no return type annotation
    'function test() {}',
    'async function test() {}',
    'function* test() {}',

    // return types with no return statements
    'function test(): void {}',
    'function test(): undefined {}',
    'function test(): any {}',
    'function test(): unknown {}',

    // single return type
    'const test = (): unknown => 10;',
    'const test = (): any => 10;',
    'const test = (): number => 10;',
    "const test = (): string => 'one';",
    'const test = (): 10 => 10;',
    "const test = (): 'one' => 'one';",

    // referenced return types
    `
type N = number | string;
const test = (): N => 10;
    `,
    `
type N = number | string;
const test = (): N => 'one';
    `,
    `
type N = 10 | 20;
const test = (): N => 10;
    `,
    `
type N = 'one' | 'two';
const test = (): N => 'one';
    `,

    // multiple return types
    `
function test(a: boolean): number | string {
  if (a) {
    return 'one';
  }

  return 10;
}
    `,
    `
declare const a: number | string;

function test(): number | string {
  return a;
}
    `,
    `
declare const b: number | string;

function test(a: boolean): number | string | boolean {
  if (a) {
    return true;
  }

  return b;
}
    `,

    // potentially returning void or undefined
    `
function test(a: boolean): string | undefined {
  if (a) {
    return 'one';
  }
}
    `,
    `
function test(a: boolean): string | void {
  if (a) {
    return 'one';
  }
}
    `,
    `
function test(a: boolean): string | undefined {
  if (a) {
    return;
  }

  return 'one';
}
    `,
    `
function test(a: boolean): undefined {
  if (a) {
    return;
  }
}
    `,
    `
function test(a: boolean): string | undefined {
  if (a) {
    return undefined;
  }

  return 'one';
}
    `,

    // recursive function
    `
function test(a: boolean): number | string {
  if (a) {
    return test(false);
  }

  return 10;
}
    `,

    // type assertions
    `
function test(): string {
  return 'one' as string;
}
    `,
    `
function test(): string | number {
  return 'one' as string | number;
}
    `,
    `
function test(): string | boolean {
  return 'one' as 'hello' | true;
}
    `,

    // type constraints
    `
function test<T>(): T | number {
  return 10;
}
    `,
    `
function test<T extends string | number | boolean>(): T | number {
  return 10;
}
    `,
    `
function test<T>(): T | number {}
    `,

    // arrays
    `
function test(): string[] {
  return ['one'];
}
    `,
    `
function test(): string[] {
  return ['one' as string];
}
    `,
    `
function test(): (string | number)[] {
  return [];
}
    `,
    `
function test(): (string | number)[] {
  return ['one' as string | number];
}
    `,
    `
function test(a: boolean): (string | number)[] {
  if (a) {
    return ['one'];
  }

  return [1];
}
    `,
    `
function test(): (string | number)[] {
  return ['one', 1];
}
    `,
    `
function test(a: boolean): (string | number)[] {
  if (a) {
    return ['one'] as ('one' | 'two')[];
  }

  return [1];
}
    `,
    `
type R = string | number;

function test(a: boolean): R[] {
  return [1];
}
    `,
    `
function test(): Array<string> {
  return ['one'];
}
    `,
    `
function test(): Array {
  return ['one'];
}
    `,
    `
function test(): string[] {
  return 1 as any;
}
    `,
    `
function test(): string[] {
  return [1 as any];
}
    `,

    // tuples
    `
function test(): [string] {
  return ['one'];
}
    `,
    `
function test(): [string] {
  return ['one' as string];
}
    `,
    `
function test(): [string | number] {
  return ['one' as string | number];
}
    `,
    `
function test(a: boolean): [string | number] {
  if (a) {
    return ['one'];
  }

  return [1];
}
    `,
    `
function test(a: boolean): [string | number] {
  if (a) {
    return ['one' as 'one' | 'two'];
  }

  return [1];
}
    `,
    `
type R = string | number;

function test(): [R] {
  return [1];
}
    `,
    `
type R = [string | number];

function test(): R {
  return [1];
}
    `,
    `
function test(): [string, number] {
  return ['one', 1];
}
    `,
    `
function test(): [string, number] {
  return ['one' as string, 1 as number];
}
    `,
    `
function test(): [string | number, number] {
  return ['one' as string | number, 1];
}
    `,
    `
function test(a: boolean): [string | number, number] {
  if (a) {
    return ['one', 2];
  }

  return [1, 3];
}
    `,
    `
function test(a: boolean): [string | number, number] {
  if (a) {
    return ['one' as 'one' | 'two', 2];
  }

  return [1, 2];
}
    `,
    `
type R = string | number;

function test(a: boolean): [R, number] {
  return [1, 2];
}
    `,
    `
type R = [string | number, number];

function test(a: boolean): R {
  return [1, 2];
}
    `,
    `
function test(): [string, number] {
  return ['one', 1 as any];
}
    `,
    `
function test(): [string, number] {
  return 10 as any;
}
    `,

    // promises
    `
function test(): Promise<string> {
  return Promise.resolve('one');
}
    `,
    `
function test(): Promise<string> {
  return Promise.resolve('one') as Promise<string>;
}
    `,
    `
function test(): Promise<string | number> {
  return Promise.resolve('one') as Promise<string | number>;
}
    `,
    `
function test(a: boolean): Promise<string | number> {
  if (a) {
    return Promise.resolve('one');
  }

  return Promise.resolve(1);
}
    `,
    `
function test(a: boolean): Promise<string | number> {
  if (a) {
    return Promise.resolve('one') as Promise<'one' | 'two'>;
  }

  return Promise.resolve(1);
}
    `,
    `
type R = string | number;

function test(a: boolean): Promise<R> {
  return Promise.resolve(1);
}
    `,
    `
type R = Promise<string | number>;

function test(a: boolean): R {
  return Promise.resolve(1);
}
    `,

    `
async function test(): Promise<string> {
  return Promise.resolve('one');
}
    `,
    `
async function test(): Promise<string> {
  return 'one';
}
    `,
    `
async function test(a: boolean): Promise<string | undefined> {
  if (a) {
    return 'one';
  }
}
    `,
    `
async function test(a: boolean): Promise<string | void> {
  if (a) {
    return 'one';
  }
}
    `,
    `
async function test(): Promise<string> {
  return Promise.resolve('one') as Promise<string>;
}
    `,
    `
async function test(): Promise<string> {
  return 'one' as string;
}
    `,
    `
async function test(): Promise<string | number> {
  return Promise.resolve('one') as Promise<string | number>;
}
    `,
    `
async function test(): Promise<string | number> {
  return 'one' as string | number;
}
    `,
    `
async function test(a: boolean): Promise<string | number> {
  if (a) {
    return Promise.resolve('one');
  }

  return Promise.resolve(1);
}
    `,
    `
async function test(a: boolean): Promise<string | number> {
  if (a) {
    return 'one';
  }

  return Promise.resolve(1);
}
    `,
    `
async function test(a: boolean): Promise<string | number> {
  if (a) {
    return Promise.resolve('one') as Promise<'one' | 'two'>;
  }

  return Promise.resolve(1);
}
    `,
    `
async function test(a: boolean): Promise<string | number> {
  if (a) {
    return 'one' as 'one' | 'two';
  }

  return 1;
}
    `,
    `
type R = string | number;

async function test(a: boolean): Promise<R> {
  return Promise.resolve(1);
}
    `,
    `
type R = string | number;

async function test(a: boolean): Promise<R> {
  return 1;
}
    `,
    `
type R = Promise<string | number>;

async function test(a: boolean): R {
  return Promise.resolve(1);
}
    `,
    `
type R = Promise<string | number>;

async function test(a: boolean): R {
  return 1;
}
    `,
    'async function test(): Promise<void> {}',
    'async function test(): Promise<undefined> {}',
    'async function test(): Promise<any> {}',
    `
async function test(a: boolean): Promise<string | undefined> {
  if (a) {
    return;
  }

  return 'one';
}
    `,
    `
function test(): Promise {
  return 'one';
}
    `,
    `
function test(): Promise<string> {
  return 1 as any;
}
    `,
    `
function test(): Promise<string> {
  return Promise.resolve(1 as any);
}
    `,
    `
function test<T extends Promise<number | string>>(): T {
  return Promise.resolve(1);
}
    `,

    // maps
    `
function test(): Map<string, number> {
  return new Map<string, number>();
}
    `,
    `
function test(): Map<string | number, number | boolean> {
  return new Map();
}
    `,
    `
function test(a: boolean): Map<string | number, number | boolean> {
  if (a) {
    return new Map<number, boolean>();
  }

  return new Map<string, number>();
}
    `,
    `
function test(a: boolean): Map<string | number, number | boolean> {
  return new Map<any, any>();
}
    `,

    // sets
    `
function test(): Set<string> {
  return new Set<string>();
}
    `,
    `
function test(): Set<string | number> {
  return new Set();
}
    `,
    `
function test(a: boolean): Set<string | number> {
  if (a) {
    return new Set<number>();
  }

  return new Set<string>();
}
    `,
    `
function test(a: boolean): Set<string | number> {
  if (a) {
    return new Set([1]);
  }

  return new Set(['one']);
}
    `,
    `
function test(a: boolean): Set<string | number> {
  return new Set([1, 'one']);
}
    `,
    `
function test(a: boolean): Set<string | number> {
  return new Set<any>();
}
    `,

    // general boxes
    `
class Box<T> {
  constructor(public readonly value: T) {}
}

function test(): Box<string> {
  return new Box('abc');
}
    `,
    `
class Box<T> {
  constructor(public readonly value: T) {}
}

function test(): Box<string | number> {
  return new Box();
}
    `,
    `
class Box<T> {
  constructor(public readonly value: T) {}
}

function test(a: boolean): Box<string | number> {
  if (a) {
    return new Box(1);
  }

  return new Box('one');
}
    `,
    `
class Box<T> {
  constructor(public readonly value: T) {}
}

function test(a: boolean): Box<string | number> {
  return new Box(1 as any);
}
    `,
    `
class Box<T> {
  constructor(public readonly value: T) {}
}

function test<T extends Box<number | string>>(): T {
  return new Box(1);
}
    `,

    // generators
    `
function* test() {}
    `,
    `
function* test() {
  return 1;
}
    `,
    `
function* test() {
  yield 1;
}
    `,
    `
function* test(): Generator {}
    `,
    `
function* test(): Generator {
  yield 1;
}
    `,
    `
function* test(): Generator {
  return 1;
}
    `,
    `
function* test(): Generator<number> {
  yield 1;
}
    `,
    `
function* test(): Generator<number> {
  yield 1 as any;
}
    `,
    `
function* test(): Generator<unknown> {
  yield 1;
}
    `,
    `
function* test(): Generator<unknown> {
  yield 1;
  yield 'one';
}
    `,
    `
function* test(): Generator<number | string> {
  yield 1;
  yield 'one';
}
    `,
    `
function* test(): Generator<number | string> {
  yield 1;
  yield 'one';

  return 10;
}
    `,
    `
function* test(): Generator<unknown, number> {
  return 10;
}
    `,
    `
function* test(): Generator<unknown, unknown> {
  return 10;
}
    `,
    `
function* test(): Generator<unknown, any> {
  return 10;
}
    `,
    `
function* test(): Generator<unknown, string | number> {
  return 10 as string | number;
}
    `,
    `
function* test(a: boolean): Generator<unknown, string | number> {
  if (a) {
    return 1;
  }

  return 'one';
}
    `,
    `
function* test(a: boolean): Generator<boolean, string | number> {
  yield true;

  if (a) {
    return 1;
  }

  return 'one';
}
    `,
    `
function* test(a: boolean): Generator<boolean | number, string | number> {
  yield true;

  if (a) {
    yield 5;
    return 1;
  }

  return 'one';
}
    `,
    `
declare const b: boolean | string;

function* test(
  a: boolean,
): Generator<boolean | number | string, string | number> {
  yield 1;

  if (a) {
    yield b;
    return 1;
  }

  return 'one';
}
    `,

    // async generators
    `
async function* test() {}
    `,
    `
async function* test() {
  return 1;
}
    `,
    `
async function* test() {
  yield 1;
}
    `,
    `
async function* test(): AsyncGenerator {}
    `,
    `
async function* test(): AsyncGenerator {
  yield 1;
}
    `,
    `
async function* test(): AsyncGenerator {
  return 1;
}
    `,
    `
async function* test(): AsyncGenerator<number> {
  yield 1;
}
    `,
    `
async function* test(): AsyncGenerator<number> {
  yield 1 as any;
}
    `,
    `
async function* test(): AsyncGenerator<unknown> {
  yield 1;
}
    `,
    `
async function* test(): AsyncGenerator<unknown> {
  yield 1;
  yield 'one';
}
    `,
    `
async function* test(): AsyncGenerator<number | string> {
  yield 1;
  yield 'one';
}
    `,
    `
async function* test(): AsyncGenerator<number | string> {
  yield 1;
  yield 'one';

  return 10;
}
    `,
    `
async function* test(): AsyncGenerator<unknown, number> {
  return 10;
}
    `,
    `
async function* test(): AsyncGenerator<unknown, unknown> {
  return 10;
}
    `,
    `
async function* test(): AsyncGenerator<unknown, any> {
  return 10;
}
    `,
    `
async function* test(): AsyncGenerator<unknown, string | number> {
  return 10 as string | number;
}
    `,
    `
async function* test(a: boolean): AsyncGenerator<unknown, string | number> {
  if (a) {
    return 1;
  }

  return 'one';
}
    `,
    `
async function* test(a: boolean): AsyncGenerator<boolean, string | number> {
  yield true;

  if (a) {
    return 1;
  }

  return 'one';
}
    `,
    `
async function* test(
  a: boolean,
): AsyncGenerator<boolean | number, string | number> {
  yield true;

  if (a) {
    yield 5;
    return 1;
  }

  return 'one';
}
    `,
    `
declare const b: boolean | string;

async function* test(
  a: boolean,
): AsyncGenerator<boolean | number | string, string | number> {
  yield 1;

  if (a) {
    yield b;
    return 1;
  }

  return 'one';
}
    `,
    `
declare const b: boolean | string;

async function* test(
  a: boolean,
): AsyncGenerator<boolean | number | string, string | number> {
  yield 1;

  if (a) {
    yield b;
    return Promise.resolve(1);
  }

  return 'one';
}
    `,
    `
declare const b: boolean | string;

async function* test(
  a: boolean,
): AsyncGenerator<boolean | number | string, string | number> {
  yield 1;

  if (a) {
    yield Promise.resolve(b);
    return 1;
  }

  return 'one';
}
    `,
    // nested boxes
    `
function test(): Array<Promise<number | string>> {
  return [Promise.resolve(1), Promise.resolve('one')];
}
    `,
    `
function test(a: boolean): Map<string | number, boolean | string> {
  if (a) {
    return new Map<string, boolean>();
  }

  return new Map<number, string>();
}
    `,
    `
function test(): [[string | number], [number | boolean]] {
  return 1 as any;
}
    `,
    `
function test(): [[string | number], [number | boolean]] {
  return [1 as any, 2 as any];
}
    `,
    // hard to tell boxed values
    `
class BoxClass<T> {
  constructor(public readonly value: T) {}
}

function test(): BoxClass<number | string> {
  return { value: 'abc' };
}
    `,
    `
interface BoxType<T> {
  value: T;
}

function test(): BoxType<number | string> {
  return { value: 'abc' };
}
    `,
    `
type NestedBox<T> = Array<Array<T>>;

function test(): NestedBox<number | string> {
  return [[10]];
}
    `,
    `
function test(): ReturnType<(() => number) | (() => string)> {
  return 10;
}
    `,
  ],
  invalid: [
    // simple unused return type annotations
    {
      code: `
function test(): string | number {
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): string  {
  return 'one';
}
      `,
    },
    {
      code: `
function test(): string | number | boolean {
  return 1 as string | number;
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): string | number  {
  return 1 as string | number;
}
      `,
    },
    {
      code: `
function test(b: boolean): string | number | boolean | null {
  if (b) {
    return null;
  }

  return 1 as string | number;
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(b: boolean): string | number  | null {
  if (b) {
    return null;
  }

  return 1 as string | number;
}
      `,
    },

    // various different ways to define a function
    {
      code: `
const test = (): string | number => {
  return 'one';
};
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
const test = (): string  => {
  return 'one';
};
      `,
    },
    {
      code: `
const test = (): string | number => 'one';
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
const test = (): string  => 'one';
      `,
    },
    {
      code: `
class A {
  test(): string | number {
    return 1;
  }
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 3,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
class A {
  test():  number {
    return 1;
  }
}
      `,
    },

    // unused type constraints
    {
      code: `
function test<T extends string>(): T | number {
  return '';
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test<T extends string>(): T  {
  return '';
}
      `,
    },
    {
      code: `
function test<T extends string | number | boolean>(): T | number {
  return '';
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test<T extends string | number | boolean>(): T  {
  return '';
}
      `,
    },
    {
      code: `
function test(): string | number | boolean {
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): string   {
  return 'one';
}
      `,
    },

    // potentially returning void or undefined
    {
      code: `
function test(): string | number | undefined {
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): string  | undefined {
  return 'one';
}
      `,
    },
    {
      code: `
function test(): string | number | void {
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): string  | void {
  return 'one';
}
      `,
    },

    // any in return type annotation
    {
      code: `
function test(): string | number | any {
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): string  | any {
  return 'one';
}
      `,
    },

    // referenced return types
    {
      code: `
type R = number | string;

function test(): R | boolean {
  return 1;
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 4,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
type R = number | string;

function test(): R  {
  return 1;
}
      `,
    },
    {
      code: `
type R = number | string;

function test(): R | string {
  return 1;
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 4,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
type R = number | string;

function test(): R  {
  return 1;
}
      `,
    },

    // arrays
    {
      code: `
function test(): (string | number)[] {
  return ['one'];
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): (string )[] {
  return ['one'];
}
      `,
    },
    {
      code: `
function test(): string[] | number {
  return ['one'];
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): string[]  {
  return ['one'];
}
      `,
    },
    {
      code: `
function test(): string[] | number {
  return 1;
}
      `,
      errors: [
        {
          data: {
            type: 'string[]',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test():  number {
  return 1;
}
      `,
    },
    {
      code: `
function test(): (string | number | boolean)[] | string {
  return [];
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): (string | number | boolean)[]  {
  return [];
}
      `,
    },
    {
      code: `
function test(): (string | number | boolean)[] {
  return ['one'];
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): (string  )[] {
  return ['one'];
}
      `,
    },
    {
      code: `
function test(a: boolean): (string | number | null)[] {
  if (a) {
    return [1];
  }

  return ['one'];
}
      `,
      errors: [
        {
          data: {
            type: 'null',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(a: boolean): (string | number )[] {
  if (a) {
    return [1];
  }

  return ['one'];
}
      `,
    },
    {
      code: `
function test(): (string | number | boolean)[] {
  return [1 as string | number];
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): (string | number )[] {
  return [1 as string | number];
}
      `,
    },
    {
      code: `
function test(b: boolean): (string | number | boolean | null)[] {
  if (b) {
    return [null];
  }

  return [1 as string | number];
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(b: boolean): (string | number  | null)[] {
  if (b) {
    return [null];
  }

  return [1 as string | number];
}
      `,
    },
    {
      code: `
type R = number | string;

function test(): (R | boolean)[] {
  return [1];
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 4,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
type R = number | string;

function test(): (R )[] {
  return [1];
}
      `,
    },
    {
      code: `
type R = (number | string)[];

function test(): R | boolean {
  return [1];
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 4,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
type R = (number | string)[];

function test(): R  {
  return [1];
}
      `,
    },
    {
      code: `
function test(): (string | undefined)[] {
  return ['one'];
}
      `,
      errors: [
        {
          data: {
            type: 'undefined',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): (string )[] {
  return ['one'];
}
      `,
    },

    // tuples
    {
      code: `
function test(): [string | number] {
  return ['one'];
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): [string ] {
  return ['one'];
}
      `,
    },
    {
      code: `
function test(): [string | number | boolean] {
  return ['one'];
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): [string  ] {
  return ['one'];
}
      `,
    },
    {
      code: `
function test(a: boolean): [string | number | null] {
  if (a) {
    return [1];
  }

  return ['one'];
}
      `,
      errors: [
        {
          data: {
            type: 'null',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(a: boolean): [string | number ] {
  if (a) {
    return [1];
  }

  return ['one'];
}
      `,
    },
    {
      code: `
function test(): [string | number | boolean] {
  return [1 as string | number];
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): [string | number ] {
  return [1 as string | number];
}
      `,
    },
    {
      code: `
function test(b: boolean): [string | number | boolean | null] {
  if (b) {
    return [null];
  }

  return [1 as string | number];
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(b: boolean): [string | number  | null] {
  if (b) {
    return [null];
  }

  return [1 as string | number];
}
      `,
    },
    {
      code: `
type R = [number | string];

function test(): R | boolean {
  return [1];
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 4,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
type R = [number | string];

function test(): R  {
  return [1];
}
      `,
    },
    {
      code: `
type R = number | string;

function test(): [R | string] {
  return [1];
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 4,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
type R = number | string;

function test(): [R ] {
  return [1];
}
      `,
    },
    {
      code: `
function test(): [string | number, boolean] {
  return ['one', true];
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): [string , boolean] {
  return ['one', true];
}
      `,
    },
    {
      code: `
function test(): [string | number | boolean, boolean] {
  return ['one', true];
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): [string  , boolean] {
  return ['one', true];
}
      `,
    },
    {
      code: `
function test(a: boolean): [string | number | null, boolean] {
  if (a) {
    return [1, false];
  }

  return ['one', true];
}
      `,
      errors: [
        {
          data: {
            type: 'null',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(a: boolean): [string | number , boolean] {
  if (a) {
    return [1, false];
  }

  return ['one', true];
}
      `,
    },
    {
      code: `
function test(): [string | number | boolean, boolean] {
  return [1 as string | number, false];
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): [string | number , boolean] {
  return [1 as string | number, false];
}
      `,
    },
    {
      code: `
function test(b: boolean): [string | number | boolean | null, boolean] {
  if (b) {
    return [null, true];
  }

  return [1 as string | number, false];
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(b: boolean): [string | number  | null, boolean] {
  if (b) {
    return [null, true];
  }

  return [1 as string | number, false];
}
      `,
    },
    {
      code: `
type R = [number | string, boolean];

function test(): R | boolean {
  return [1, true];
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 4,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
type R = [number | string, boolean];

function test(): R  {
  return [1, true];
}
      `,
    },
    {
      code: `
type R = number | string;

function test(): [R | string, boolean] {
  return [1, false];
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 4,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
type R = number | string;

function test(): [R , boolean] {
  return [1, false];
}
      `,
    },
    {
      code: `
function test(): [string | undefined] {
  return ['one'];
}
      `,
      errors: [
        {
          data: {
            type: 'undefined',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): [string ] {
  return ['one'];
}
      `,
    },

    // promises
    {
      code: `
function test(): Promise<string | number> {
  return Promise.resolve('one');
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): Promise<string > {
  return Promise.resolve('one');
}
      `,
    },
    {
      code: `
function test(): Promise<string | number | boolean> {
  return Promise.resolve('one');
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): Promise<string  > {
  return Promise.resolve('one');
}
      `,
    },
    {
      code: `
function test(a: boolean): Promise<string | number | null> {
  if (a) {
    return Promise.resolve(1);
  }

  return Promise.resolve('one');
}
      `,
      errors: [
        {
          data: {
            type: 'null',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(a: boolean): Promise<string | number > {
  if (a) {
    return Promise.resolve(1);
  }

  return Promise.resolve('one');
}
      `,
    },
    {
      code: `
function test(): Promise<string | number | boolean> {
  return Promise.resolve(1 as string | number);
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): Promise<string | number > {
  return Promise.resolve(1 as string | number);
}
      `,
    },
    {
      code: `
function test(b: boolean): Promise<string | number | boolean | null> {
  if (b) {
    return Promise.resolve(null);
  }

  return Promise.resolve(1 as string | number);
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(b: boolean): Promise<string | number  | null> {
  if (b) {
    return Promise.resolve(null);
  }

  return Promise.resolve(1 as string | number);
}
      `,
    },
    {
      code: `
type R = Promise<number | string>;

function test(): R | boolean {
  return Promise.resolve(1);
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 4,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
type R = Promise<number | string>;

function test(): R  {
  return Promise.resolve(1);
}
      `,
    },

    // async functions
    {
      code: `
async function test(): Promise<string | number> {
  return Promise.resolve('one');
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function test(): Promise<string > {
  return Promise.resolve('one');
}
      `,
    },
    {
      code: `
async function test(): Promise<string | number | boolean> {
  return Promise.resolve('one');
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function test(): Promise<string  > {
  return Promise.resolve('one');
}
      `,
    },
    {
      code: `
async function test(a: boolean): Promise<string | number | null> {
  if (a) {
    return Promise.resolve(1);
  }

  return Promise.resolve('one');
}
      `,
      errors: [
        {
          data: {
            type: 'null',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function test(a: boolean): Promise<string | number > {
  if (a) {
    return Promise.resolve(1);
  }

  return Promise.resolve('one');
}
      `,
    },
    {
      code: `
async function test(): Promise<string | number | boolean> {
  return Promise.resolve(1 as string | number);
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function test(): Promise<string | number > {
  return Promise.resolve(1 as string | number);
}
      `,
    },
    {
      code: `
async function test(b: boolean): Promise<string | number | boolean | null> {
  if (b) {
    return Promise.resolve(null);
  }

  return Promise.resolve(1 as string | number);
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function test(b: boolean): Promise<string | number  | null> {
  if (b) {
    return Promise.resolve(null);
  }

  return Promise.resolve(1 as string | number);
}
      `,
    },
    {
      code: `
async function test(): Promise<string | number> {
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function test(): Promise<string > {
  return 'one';
}
      `,
    },
    {
      code: `
async function test(): Promise<string | number | boolean> {
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function test(): Promise<string  > {
  return 'one';
}
      `,
    },
    {
      code: `
async function test(a: boolean): Promise<string | number | null> {
  if (a) {
    return 1;
  }

  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'null',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function test(a: boolean): Promise<string | number > {
  if (a) {
    return 1;
  }

  return 'one';
}
      `,
    },
    {
      code: `
async function test(): Promise<string | number | boolean> {
  return 1 as string | number;
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function test(): Promise<string | number > {
  return 1 as string | number;
}
      `,
    },
    {
      code: `
async function test(b: boolean): Promise<string | number | boolean | null> {
  if (b) {
    return null;
  }

  return 1 as string | number;
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function test(b: boolean): Promise<string | number  | null> {
  if (b) {
    return null;
  }

  return 1 as string | number;
}
      `,
    },
    {
      code: `
function test(): string | Promise<number> {
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'Promise<number>',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): string  {
  return 'one';
}
      `,
    },
    {
      code: `
function test(): string[] | Promise<number> {
  return [];
}
      `,
      errors: [
        {
          data: {
            type: 'Promise<number>',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): string[]  {
  return [];
}
      `,
    },
    {
      code: `
function test(): [Promise<boolean | number>][] {
  return [[Promise.resolve(1)]];
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): [Promise< number>][] {
  return [[Promise.resolve(1)]];
}
      `,
    },

    // generators
    {
      code: `
function* test(): Generator<number> {}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function* test(): Generator {}
      `,
    },
    {
      code: `
function* test(): Generator<string | number> {}
      `,
      errors: [
        {
          data: {
            type: 'string | number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function* test(): Generator {}
      `,
    },
    {
      code: `
function* test(): Generator<string | number> {
  yield 10;
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function* test(): Generator< number> {
  yield 10;
}
      `,
    },
    {
      code: `
function* test(): Generator<string | number | boolean> {
  yield 10;
  yield 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function* test(): Generator<string | number > {
  yield 10;
  yield 'one';
}
      `,
    },
    {
      code: `
function* test(): Generator<string | number, number> {
  yield 10;
  return 10;
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function* test(): Generator< number, number> {
  yield 10;
  return 10;
}
      `,
    },
    {
      code: `
function* test(): Generator<string | number, string | boolean> {
  yield 10;
  return 'one' as 'one' | true;
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function* test(): Generator< number, string | boolean> {
  yield 10;
  return 'one' as 'one' | true;
}
      `,
    },
    {
      code: `
function* test(): Generator<number, string | boolean> {
  return 'one' as 'one' | true;
}
      `,
      errors: [
        {
          line: 2,
          messageId: 'unusedGeneratorYieldTypes',
        },
      ],
    },
    {
      code: `
function* test(): Generator<unknown, string | boolean> {
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function* test(): Generator<unknown, string > {
  return 'one';
}
      `,
    },
    {
      code: `
function* test(): Generator<number | null, string | boolean> {
  yield 10;
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'null',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function* test(): Generator<number , string > {
  yield 10;
  return 'one';
}
      `,
    },

    // async generators
    {
      code: `
async function* test(): AsyncGenerator<number> {}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function* test(): AsyncGenerator {}
      `,
    },
    {
      code: `
async function* test(): AsyncGenerator<string | number> {}
      `,
      errors: [
        {
          data: {
            type: 'string | number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function* test(): AsyncGenerator {}
      `,
    },
    {
      code: `
async function* test(): AsyncGenerator<string | number> {
  yield 10;
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function* test(): AsyncGenerator< number> {
  yield 10;
}
      `,
    },
    {
      code: `
async function* test(): AsyncGenerator<string | number | boolean> {
  yield 10;
  yield 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function* test(): AsyncGenerator<string | number > {
  yield 10;
  yield 'one';
}
      `,
    },
    {
      code: `
async function* test(): AsyncGenerator<string | number, number> {
  yield 10;
  return 10;
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function* test(): AsyncGenerator< number, number> {
  yield 10;
  return 10;
}
      `,
    },
    {
      code: `
async function* test(): AsyncGenerator<string | number, string | boolean> {
  yield 10;
  return 'one' as 'one' | true;
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function* test(): AsyncGenerator< number, string | boolean> {
  yield 10;
  return 'one' as 'one' | true;
}
      `,
    },
    {
      code: `
async function* test(): AsyncGenerator<number, string | boolean> {
  return 'one' as 'one' | true;
}
      `,
      errors: [
        {
          line: 2,
          messageId: 'unusedGeneratorYieldTypes',
        },
      ],
    },
    {
      code: `
async function* test(): AsyncGenerator<unknown, string | boolean> {
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function* test(): AsyncGenerator<unknown, string > {
  return 'one';
}
      `,
    },
    {
      code: `
async function* test(): AsyncGenerator<number | null, string | boolean> {
  yield 10;
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'null',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function* test(): AsyncGenerator<number , string > {
  yield 10;
  return 'one';
}
      `,
    },
    {
      code: `
async function* test(): AsyncGenerator<number | null, string | boolean> {
  yield Promise.resolve(10);
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'null',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function* test(): AsyncGenerator<number , string > {
  yield Promise.resolve(10);
  return 'one';
}
      `,
    },
    {
      code: `
async function* test(): AsyncGenerator<number | null, string | boolean> {
  yield 10;
  return Promise.resolve('one');
}
      `,
      errors: [
        {
          data: {
            type: 'null',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'boolean',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function* test(): AsyncGenerator<number , string > {
  yield 10;
  return Promise.resolve('one');
}
      `,
    },
    // nested boxes
    {
      code: `
async function test(): Promise<Array<string | number>> {
  return Promise.resolve([1]);
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
async function test(): Promise<Array< number>> {
  return Promise.resolve([1]);
}
      `,
    },
    {
      code: `
function test(): [[string | number], [number | boolean]] {
  return [[1], [true]];
}
      `,
      errors: [
        {
          data: {
            type: 'string',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): [[ number], [ boolean]] {
  return [[1], [true]];
}
      `,
    },
    {
      code: `
function test(): [[string | number], [number | boolean]] {
  return [1 as any, [true]];
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
      output: `
function test(): [[string | number], [ boolean]] {
  return [1 as any, [true]];
}
      `,
    },

    // type errors
    {
      code: `
function test(): number {
  return 'one';
}
      `,
      errors: [
        {
          data: {
            type: 'number',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
    },
    {
      code: `
function test(): [number] {
  return 10;
}
      `,
      errors: [
        {
          data: {
            type: '[number]',
          },
          line: 2,
          messageId: 'unusedReturnTypes',
        },
      ],
    },
  ],
});
