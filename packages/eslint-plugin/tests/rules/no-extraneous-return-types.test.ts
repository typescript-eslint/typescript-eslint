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
    'function test() {}',
    'async function test() {}',
    'function test(): void {}',
    'function test(): undefined {}',
    'function test(): any {}',
    `
function test(): string {
  return 'one';
}
    `,
    `
const test = (): string => {
  return 'one';
};
    `,
    `
const test = (): string => 'one';
    `,
    `
class A {
  test(): string {
    return 'string';
  }
}
    `,
    `
function test(): string {
  return 'one' as string;
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
function test(): string | number {
  return 'one' as string | number;
}
    `,
    `
function test(a: boolean): string | number {
  if (a) {
    return 'one';
  }

  return 1;
}
    `,
    `
function test(a: boolean): string | number {
  if (a) {
    return 'one' as 'one' | 'two';
  }

  return 1;
}
    `,
    `
type R = string | number;

function test(a: boolean): R {
  return 1;
}
    `,
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
function test(a: boolean): (string | number)[] {
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

function test(a: boolean): [R] {
  return [1];
}
    `,
    `
type R = [string | number];

function test(a: boolean): R {
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
  ],

  invalid: [
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
    },
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
    },
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
    },
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
    },
    {
      code: `
function test(a: boolean): string | number | null {
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
    },
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
    },

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
    },

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
    },

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
    },

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
    },
  ],
});
