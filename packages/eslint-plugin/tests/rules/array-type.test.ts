import * as parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { TSESLint } from '@typescript-eslint/utils';

import type { OptionString } from '../../src/rules/array-type';

import rule from '../../src/rules/array-type';
import { areOptionsValid } from '../areOptionsValid';

const ruleTester = new RuleTester();

ruleTester.run('array-type', rule, {
  valid: [
    // Base cases from https://github.com/typescript-eslint/typescript-eslint/issues/2323#issuecomment-663977655
    {
      code: 'let a: number[] = [];',
      options: [{ default: 'array' }],
    },
    {
      code: 'let a: (string | number)[] = [];',
      options: [{ default: 'array' }],
    },
    {
      code: 'let a: readonly number[] = [];',
      options: [{ default: 'array' }],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      options: [{ default: 'array' }],
    },
    {
      code: 'let a: number[] = [];',
      options: [{ default: 'array', readonly: 'array' }],
    },
    {
      code: 'let a: (string | number)[] = [];',
      options: [{ default: 'array', readonly: 'array' }],
    },
    {
      code: 'let a: readonly number[] = [];',
      options: [{ default: 'array', readonly: 'array' }],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      options: [{ default: 'array', readonly: 'array' }],
    },
    {
      code: 'let a: number[] = [];',
      options: [{ default: 'array', readonly: 'array-simple' }],
    },
    {
      code: 'let a: (string | number)[] = [];',
      options: [{ default: 'array', readonly: 'array-simple' }],
    },
    {
      code: 'let a: readonly number[] = [];',
      options: [{ default: 'array', readonly: 'array-simple' }],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'array', readonly: 'array-simple' }],
    },
    {
      code: 'let a: number[] = [];',
      options: [{ default: 'array', readonly: 'generic' }],
    },
    {
      code: 'let a: (string | number)[] = [];',
      options: [{ default: 'array', readonly: 'generic' }],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      options: [{ default: 'array', readonly: 'generic' }],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'array', readonly: 'generic' }],
    },
    {
      code: 'let a: number[] = [];',
      options: [{ default: 'array-simple' }],
    },
    {
      code: 'let a: Array<string | number> = [];',
      options: [{ default: 'array-simple' }],
    },
    {
      code: 'let a: readonly number[] = [];',
      options: [{ default: 'array-simple' }],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'array-simple' }],
    },
    {
      code: 'let a: number[] = [];',
      options: [{ default: 'array-simple', readonly: 'array' }],
    },
    {
      code: 'let a: Array<string | number> = [];',
      options: [{ default: 'array-simple', readonly: 'array' }],
    },
    {
      code: 'let a: readonly number[] = [];',
      options: [{ default: 'array-simple', readonly: 'array' }],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      options: [{ default: 'array-simple', readonly: 'array' }],
    },
    {
      code: 'let a: number[] = [];',
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
    },
    {
      code: 'let a: Array<string | number> = [];',
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
    },
    {
      code: 'let a: readonly number[] = [];',
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
    },
    {
      code: 'let a: number[] = [];',
      options: [{ default: 'array-simple', readonly: 'generic' }],
    },
    {
      code: 'let a: Array<string | number> = [];',
      options: [{ default: 'array-simple', readonly: 'generic' }],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      options: [{ default: 'array-simple', readonly: 'generic' }],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'array-simple', readonly: 'generic' }],
    },
    {
      code: 'let a: Array<number> = [];',
      options: [{ default: 'generic' }],
    },
    {
      code: 'let a: Array<string | number> = [];',
      options: [{ default: 'generic' }],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      options: [{ default: 'generic' }],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'generic' }],
    },
    {
      code: 'let a: Array<number> = [];',
      options: [{ default: 'generic', readonly: 'generic' }],
    },
    {
      code: 'let a: Array<string | number> = [];',
      options: [{ default: 'generic', readonly: 'generic' }],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      options: [{ default: 'generic', readonly: 'generic' }],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'generic', readonly: 'generic' }],
    },
    {
      code: 'let a: Array<number> = [];',
      options: [{ default: 'generic', readonly: 'array' }],
    },
    {
      code: 'let a: Array<string | number> = [];',
      options: [{ default: 'generic', readonly: 'array' }],
    },
    {
      code: 'let a: readonly number[] = [];',
      options: [{ default: 'generic', readonly: 'array' }],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      options: [{ default: 'generic', readonly: 'array' }],
    },
    {
      code: 'let a: Array<number> = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
    },
    {
      code: 'let a: Array<string | number> = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
    },
    {
      code: 'let a: readonly number[] = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
    },
    {
      code: 'let a: Array<bigint> = [];',
      options: [{ default: 'generic', readonly: 'array' }],
    },
    {
      code: 'let a: readonly bigint[] = [];',
      options: [{ default: 'generic', readonly: 'array' }],
    },
    {
      code: 'let a: readonly (string | bigint)[] = [];',
      options: [{ default: 'generic', readonly: 'array' }],
    },
    {
      code: 'let a: Array<bigint> = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
    },
    {
      code: 'let a: Array<string | bigint> = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
    },
    {
      code: 'let a: readonly bigint[] = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
    },
    {
      code: 'let a: ReadonlyArray<string | bigint> = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
    },

    // End of base cases

    {
      code: 'let a = new Array();',
      options: [{ default: 'array' }],
    },
    {
      code: 'let a: { foo: Bar[] }[] = [];',
      options: [{ default: 'array' }],
    },
    {
      code: 'function foo(a: Array<Bar>): Array<Bar> {}',
      options: [{ default: 'generic' }],
    },
    {
      code: 'let yy: number[][] = [[4, 5], [6]];',
      options: [{ default: 'array-simple' }],
    },
    {
      code: `
function fooFunction(foo: Array<ArrayClass<string>>) {
  return foo.map(e => e.foo);
}
      `,
      options: [{ default: 'array-simple' }],
    },
    {
      code: `
function bazFunction(baz: Arr<ArrayClass<String>>) {
  return baz.map(e => e.baz);
}
      `,
      options: [{ default: 'array-simple' }],
    },
    {
      code: 'let fooVar: Array<(c: number) => number>;',
      options: [{ default: 'array-simple' }],
    },
    {
      code: 'type fooUnion = Array<string | number | boolean>;',
      options: [{ default: 'array-simple' }],
    },
    {
      code: 'type fooIntersection = Array<string & number>;',
      options: [{ default: 'array-simple' }],
    },
    {
      code: `
namespace fooName {
  type BarType = { bar: string };
  type BazType<T> = Arr<T>;
}
      `,
      options: [{ default: 'array-simple' }],
    },
    {
      code: `
interface FooInterface {
  '.bar': { baz: string[] };
}
      `,
      options: [{ default: 'array-simple' }],
    },
    {
      code: 'let yy: number[][] = [[4, 5], [6]];',
      options: [{ default: 'array' }],
    },
    {
      code: "let ya = [[1, '2']] as [number, string][];",
      options: [{ default: 'array' }],
    },
    {
      code: `
function barFunction(bar: ArrayClass<String>[]) {
  return bar.map(e => e.bar);
}
      `,
      options: [{ default: 'array' }],
    },
    {
      code: `
function bazFunction(baz: Arr<ArrayClass<String>>) {
  return baz.map(e => e.baz);
}
      `,
      options: [{ default: 'array' }],
    },
    {
      code: 'let barVar: ((c: number) => number)[];',
      options: [{ default: 'array' }],
    },
    {
      code: 'type barUnion = (string | number | boolean)[];',
      options: [{ default: 'array' }],
    },
    {
      code: 'type barIntersection = (string & number)[];',
      options: [{ default: 'array' }],
    },
    {
      code: `
interface FooInterface {
  '.bar': { baz: string[] };
}
      `,
      options: [{ default: 'array' }],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/172
      code: 'type Unwrap<T> = T extends (infer E)[] ? E : T;',
      options: [{ default: 'array' }],
    },
    {
      code: 'let xx: Array<Array<number>> = [[1, 2], [3]];',
      options: [{ default: 'generic' }],
    },
    {
      code: 'type Arr<T> = Array<T>;',
      options: [{ default: 'generic' }],
    },
    {
      code: `
function fooFunction(foo: Array<ArrayClass<string>>) {
  return foo.map(e => e.foo);
}
      `,
      options: [{ default: 'generic' }],
    },
    {
      code: `
function bazFunction(baz: Arr<ArrayClass<String>>) {
  return baz.map(e => e.baz);
}
      `,
      options: [{ default: 'generic' }],
    },
    {
      code: 'let fooVar: Array<(c: number) => number>;',
      options: [{ default: 'generic' }],
    },
    {
      code: 'type fooUnion = Array<string | number | boolean>;',
      options: [{ default: 'generic' }],
    },
    {
      code: 'type fooIntersection = Array<string & number>;',
      options: [{ default: 'generic' }],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/172
      code: 'type Unwrap<T> = T extends Array<infer E> ? E : T;',
      options: [{ default: 'generic' }],
    },

    // nested readonly
    {
      code: 'let a: ReadonlyArray<number[]> = [[]];',
      options: [{ default: 'array', readonly: 'generic' }],
    },
    {
      code: 'let a: readonly Array<number>[] = [[]];',
      options: [{ default: 'generic', readonly: 'array' }],
    },
    {
      code: 'let a: Readonly = [];',
      options: [{ default: 'generic', readonly: 'array' }],
    },
    {
      code: "const x: Readonly<string> = 'a';",
      options: [{ default: 'array' }],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/11911
    {
      code: 'type Generic<Array extends unknown[]> = { array: Array };',
      options: [{ default: 'array' }],
    },
    {
      code: "declare module '2' { type Array<Y> = Y; const y: Array<2>; }",
      options: [{ default: 'generic' }],
    },
    {
      code: "let z: Array = [3, '4'];",
      options: [{ default: 'array-simple' }],
    },
    {
      code: 'let x: Array;',
      options: [{ default: 'generic' }],
    },
    {
      code: 'type MyType<ReadonlyArray> = { data: ReadonlyArray };',
      options: [{ default: 'array' }],
    },
  ],
  invalid: [
    // Base cases from https://github.com/typescript-eslint/typescript-eslint/issues/2323#issuecomment-663977655
    {
      code: 'let a: Array<number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'let a: number[] = [];',
    },
    {
      code: 'let a: Array<string | number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'let a: (string | number)[] = [];',
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'let a: readonly number[] = [];',
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'let a: readonly (string | number)[] = [];',
    },
    {
      code: 'let a: Array<number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array', readonly: 'array' }],
      output: 'let a: number[] = [];',
    },
    {
      code: 'let a: Array<string | number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array', readonly: 'array' }],
      output: 'let a: (string | number)[] = [];',
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array', readonly: 'array' }],
      output: 'let a: readonly number[] = [];',
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array', readonly: 'array' }],
      output: 'let a: readonly (string | number)[] = [];',
    },
    {
      code: 'let a: Array<number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array', readonly: 'array-simple' }],
      output: 'let a: number[] = [];',
    },
    {
      code: 'let a: Array<string | number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array', readonly: 'array-simple' }],
      output: 'let a: (string | number)[] = [];',
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array', readonly: 'array-simple' }],
      output: 'let a: readonly number[] = [];',
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array', readonly: 'array-simple' }],
      output: 'let a: ReadonlyArray<string | number> = [];',
    },
    {
      code: 'let a: Array<number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array', readonly: 'generic' }],
      output: 'let a: number[] = [];',
    },
    {
      code: 'let a: Array<string | number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array', readonly: 'generic' }],
      output: 'let a: (string | number)[] = [];',
    },
    {
      code: 'let a: readonly number[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'array', readonly: 'generic' }],
      output: 'let a: ReadonlyArray<number> = [];',
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'array', readonly: 'generic' }],
      output: 'let a: ReadonlyArray<string | number> = [];',
    },
    {
      code: 'let a: Array<number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: 'let a: number[] = [];',
    },
    {
      code: 'let a: (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: 'let a: Array<string | number> = [];',
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: 'let a: readonly number[] = [];',
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: 'let a: ReadonlyArray<string | number> = [];',
    },
    {
      code: 'let a: Array<number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'array' }],
      output: 'let a: number[] = [];',
    },
    {
      code: 'let a: (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'array' }],
      output: 'let a: Array<string | number> = [];',
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'array' }],
      output: 'let a: readonly number[] = [];',
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'array' }],
      output: 'let a: readonly (string | number)[] = [];',
    },
    {
      code: 'let a: Array<number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
      output: 'let a: number[] = [];',
    },
    {
      code: 'let a: (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
      output: 'let a: Array<string | number> = [];',
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
      output: 'let a: readonly number[] = [];',
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
      output: 'let a: ReadonlyArray<string | number> = [];',
    },
    {
      code: 'let a: Array<number> = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'generic' }],
      output: 'let a: number[] = [];',
    },
    {
      code: 'let a: (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'generic' }],
      output: 'let a: Array<string | number> = [];',
    },
    {
      code: 'let a: readonly number[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'generic' }],
      output: 'let a: ReadonlyArray<number> = [];',
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'array-simple', readonly: 'generic' }],
      output: 'let a: ReadonlyArray<string | number> = [];',
    },
    {
      code: 'let a: number[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: 'let a: Array<number> = [];',
    },
    {
      code: 'let a: (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: 'let a: Array<string | number> = [];',
    },
    {
      code: 'let a: readonly number[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: 'let a: ReadonlyArray<number> = [];',
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: 'let a: ReadonlyArray<string | number> = [];',
    },
    {
      code: 'let a: number[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'array' }],
      output: 'let a: Array<number> = [];',
    },
    {
      code: 'let a: (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'array' }],
      output: 'let a: Array<string | number> = [];',
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'generic', readonly: 'array' }],
      output: 'let a: readonly number[] = [];',
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'generic', readonly: 'array' }],
      output: 'let a: readonly (string | number)[] = [];',
    },
    {
      code: 'let a: number[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'array-simple' }],
      output: 'let a: Array<number> = [];',
    },
    {
      code: 'let a: (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'array-simple' }],
      output: 'let a: Array<string | number> = [];',
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'generic', readonly: 'array-simple' }],
      output: 'let a: readonly number[] = [];',
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'generic', readonly: 'array-simple' }],
      output: 'let a: ReadonlyArray<string | number> = [];',
    },
    {
      code: 'let a: number[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'generic' }],
      output: 'let a: Array<number> = [];',
    },
    {
      code: 'let a: (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'generic' }],
      output: 'let a: Array<string | number> = [];',
    },
    {
      code: 'let a: readonly number[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'number',
          },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'generic' }],
      output: 'let a: ReadonlyArray<number> = [];',
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'generic' }],
      output: 'let a: ReadonlyArray<string | number> = [];',
    },
    {
      code: 'let a: bigint[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'bigint' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'array-simple' }],
      output: 'let a: Array<bigint> = [];',
    },
    {
      code: 'let a: (string | bigint)[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'array-simple' }],
      output: 'let a: Array<string | bigint> = [];',
    },
    {
      code: 'let a: ReadonlyArray<bigint> = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'bigint',
          },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'generic', readonly: 'array-simple' }],
      output: 'let a: readonly bigint[] = [];',
    },
    {
      code: 'let a: (string | bigint)[] = [];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'generic' }],
      output: 'let a: Array<string | bigint> = [];',
    },
    {
      code: 'let a: readonly bigint[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'bigint',
          },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'generic' }],
      output: 'let a: ReadonlyArray<bigint> = [];',
    },
    {
      code: 'let a: readonly (string | bigint)[] = [];',
      errors: [
        {
          column: 8,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic', readonly: 'generic' }],
      output: 'let a: ReadonlyArray<string | bigint> = [];',
    },

    // End of base cases

    {
      code: 'let a: { foo: Array<Bar> }[] = [];',
      errors: [
        {
          column: 15,
          data: { className: 'Array', readonlyPrefix: '', type: 'Bar' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'let a: { foo: Bar[] }[] = [];',
    },
    {
      code: 'let a: Array<{ foo: Bar[] }> = [];',
      errors: [
        {
          column: 21,
          data: { className: 'Array', readonlyPrefix: '', type: 'Bar' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: 'let a: Array<{ foo: Array<Bar> }> = [];',
    },
    {
      code: 'let a: Array<{ foo: Foo | Bar[] }> = [];',
      errors: [
        {
          column: 27,
          data: { className: 'Array', readonlyPrefix: '', type: 'Bar' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: 'let a: Array<{ foo: Foo | Array<Bar> }> = [];',
    },
    {
      code: 'function foo(a: Array<Bar>): Array<Bar> {}',
      errors: [
        {
          column: 17,
          data: { className: 'Array', readonlyPrefix: '', type: 'Bar' },
          line: 1,
          messageId: 'errorStringArray',
        },
        {
          column: 30,
          data: { className: 'Array', readonlyPrefix: '', type: 'Bar' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'function foo(a: Bar[]): Bar[] {}',
    },
    {
      code: 'let x: Array<undefined> = [undefined] as undefined[];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'undefined' },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: 'let x: undefined[] = [undefined] as undefined[];',
    },
    {
      code: "let y: string[] = <Array<string>>['2'];",
      errors: [
        {
          column: 20,
          data: { className: 'Array', readonlyPrefix: '', type: 'string' },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: "let y: string[] = <string[]>['2'];",
    },
    // {
    //   code: "let z: Array = [3, '4'];",
    //   errors: [
    //     {
    //       column: 8,
    //       data: { className: 'Array', readonlyPrefix: '', type: 'any' },
    //       line: 1,
    //       messageId: 'errorStringArraySimple',
    //     },
    //   ],
    //   options: [{ default: 'array-simple' }],
    //   output: "let z: any[] = [3, '4'];",
    // },
    {
      code: "let ya = [[1, '2']] as [number, string][];",
      errors: [
        {
          column: 24,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: "let ya = [[1, '2']] as Array<[number, string]>;",
    },
    {
      code: 'type Arr<T> = Array<T>;',
      errors: [
        {
          column: 15,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: 'type Arr<T> = T[];',
    },
    {
      code: `
// Ignore user defined aliases
let yyyy: Arr<Array<Arr<string>>[]> = [[[['2']]]];
      `,
      errors: [
        {
          column: 15,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 3,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: `
// Ignore user defined aliases
let yyyy: Arr<Array<Array<Arr<string>>>> = [[[['2']]]];
      `,
    },
    {
      code: `
interface ArrayClass<T> {
  foo: Array<T>;
  bar: T[];
  baz: Arr<T>;
  xyz: this[];
}
      `,
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 3,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: `
interface ArrayClass<T> {
  foo: T[];
  bar: T[];
  baz: Arr<T>;
  xyz: this[];
}
      `,
    },
    {
      code: `
function barFunction(bar: ArrayClass<String>[]) {
  return bar.map(e => e.bar);
}
      `,
      errors: [
        {
          column: 27,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 2,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: `
function barFunction(bar: Array<ArrayClass<String>>) {
  return bar.map(e => e.bar);
}
      `,
    },
    {
      code: 'let barVar: ((c: number) => number)[];',
      errors: [
        {
          column: 13,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: 'let barVar: Array<(c: number) => number>;',
    },
    {
      code: 'type barUnion = (string | number | boolean)[];',
      errors: [
        {
          column: 17,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: 'type barUnion = Array<string | number | boolean>;',
    },
    {
      code: 'type barIntersection = (string & number)[];',
      errors: [
        {
          column: 24,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: 'type barIntersection = Array<string & number>;',
    },
    {
      code: "let v: Array<fooName.BarType> = [{ bar: 'bar' }];",
      errors: [
        {
          column: 8,
          data: {
            className: 'Array',
            readonlyPrefix: '',
            type: 'fooName.BarType',
          },
          line: 1,
          messageId: 'errorStringArraySimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: "let v: fooName.BarType[] = [{ bar: 'bar' }];",
    },
    {
      code: "let w: fooName.BazType<string>[] = [['baz']];",
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: "let w: Array<fooName.BazType<string>> = [['baz']];",
    },
    {
      code: 'let x: Array<undefined> = [undefined] as undefined[];',
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'undefined' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'let x: undefined[] = [undefined] as undefined[];',
    },
    {
      code: "let y: string[] = <Array<string>>['2'];",
      errors: [
        {
          column: 20,
          data: { className: 'Array', readonlyPrefix: '', type: 'string' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: "let y: string[] = <string[]>['2'];",
    },
    {
      code: 'type Arr<T> = Array<T>;',
      errors: [
        {
          column: 15,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'type Arr<T> = T[];',
    },
    {
      code: `
// Ignore user defined aliases
let yyyy: Arr<Array<Arr<string>>[]> = [[[['2']]]];
      `,
      errors: [
        {
          column: 15,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 3,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: `
// Ignore user defined aliases
let yyyy: Arr<Arr<string>[][]> = [[[['2']]]];
      `,
    },
    {
      code: `
interface ArrayClass<T> {
  foo: Array<T>;
  bar: T[];
  baz: Arr<T>;
}
      `,
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 3,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: `
interface ArrayClass<T> {
  foo: T[];
  bar: T[];
  baz: Arr<T>;
}
      `,
    },
    {
      code: `
function fooFunction(foo: Array<ArrayClass<string>>) {
  return foo.map(e => e.foo);
}
      `,
      errors: [
        {
          column: 27,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 2,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: `
function fooFunction(foo: ArrayClass<string>[]) {
  return foo.map(e => e.foo);
}
      `,
    },
    {
      code: 'let fooVar: Array<(c: number) => number>;',
      errors: [
        {
          column: 13,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'let fooVar: ((c: number) => number)[];',
    },
    {
      code: 'type fooUnion = Array<string | number | boolean>;',
      errors: [
        {
          column: 17,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'type fooUnion = (string | number | boolean)[];',
    },
    {
      code: 'type fooIntersection = Array<string & number>;',
      errors: [
        {
          column: 24,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'type fooIntersection = (string & number)[];',
    },
    {
      code: 'let x: Array<number> = [1] as number[];',
      errors: [
        {
          column: 31,
          data: { className: 'Array', readonlyPrefix: '', type: 'number' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: 'let x: Array<number> = [1] as Array<number>;',
    },
    {
      code: "let y: string[] = <Array<string>>['2'];",
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'string' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: "let y: Array<string> = <Array<string>>['2'];",
    },
    {
      code: "let ya = [[1, '2']] as [number, string][];",
      errors: [
        {
          column: 24,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: "let ya = [[1, '2']] as Array<[number, string]>;",
    },
    {
      code: `
// Ignore user defined aliases
let yyyy: Arr<Array<Arr<string>>[]> = [[[['2']]]];
      `,
      errors: [
        {
          column: 15,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 3,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: `
// Ignore user defined aliases
let yyyy: Arr<Array<Array<Arr<string>>>> = [[[['2']]]];
      `,
    },
    {
      code: `
interface ArrayClass<T> {
  foo: Array<T>;
  bar: T[];
  baz: Arr<T>;
}
      `,
      errors: [
        {
          column: 8,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 4,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: `
interface ArrayClass<T> {
  foo: Array<T>;
  bar: Array<T>;
  baz: Arr<T>;
}
      `,
    },
    {
      code: `
function barFunction(bar: ArrayClass<String>[]) {
  return bar.map(e => e.bar);
}
      `,
      errors: [
        {
          column: 27,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 2,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: `
function barFunction(bar: Array<ArrayClass<String>>) {
  return bar.map(e => e.bar);
}
      `,
    },
    {
      code: 'let barVar: ((c: number) => number)[];',
      errors: [
        {
          column: 13,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: 'let barVar: Array<(c: number) => number>;',
    },
    {
      code: 'type barUnion = (string | number | boolean)[];',
      errors: [
        {
          column: 17,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: 'type barUnion = Array<string | number | boolean>;',
    },
    {
      code: 'type barIntersection = (string & number)[];',
      errors: [
        {
          column: 24,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: 'type barIntersection = Array<string & number>;',
    },
    {
      code: `
interface FooInterface {
  '.bar': { baz: string[] };
}
      `,
      errors: [
        {
          column: 18,
          data: { className: 'Array', readonlyPrefix: '', type: 'string' },
          line: 3,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: `
interface FooInterface {
  '.bar': { baz: Array<string> };
}
      `,
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/172
      code: 'type Unwrap<T> = T extends Array<infer E> ? E : T;',
      errors: [
        {
          column: 28,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'type Unwrap<T> = T extends (infer E)[] ? E : T;',
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/172
      code: 'type Unwrap<T> = T extends (infer E)[] ? E : T;',
      errors: [
        {
          column: 28,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output: 'type Unwrap<T> = T extends Array<infer E> ? E : T;',
    },
    {
      code: 'type Foo = ReadonlyArray<object>[];',
      errors: [
        {
          column: 12,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'object',
          },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'type Foo = (readonly object[])[];',
    },
    {
      code: 'const foo: Array<new (...args: any[]) => void> = [];',
      errors: [
        {
          column: 12,
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'const foo: (new (...args: any[]) => void)[] = [];',
    },
    {
      code: 'const foo: ReadonlyArray<new (...args: any[]) => void> = [];',
      errors: [
        {
          column: 12,
          data: {
            className: 'ReadonlyArray',
            readonlyPrefix: 'readonly ',
            type: 'T',
          },
          line: 1,
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'const foo: readonly (new (...args: any[]) => void)[] = [];',
    },
    {
      code: "const x: Readonly<string[]> = ['a', 'b'];",
      errors: [
        {
          data: {
            className: 'Readonly',
            readonlyPrefix: 'readonly ',
            type: 'string[]',
          },
          messageId: 'errorStringArrayReadonly',
        },
      ],
      options: [{ default: 'array' }],
      output: "const x: readonly string[] = ['a', 'b'];",
    },
    {
      code: 'declare function foo<E extends Readonly<string[]>>(extra: E): E;',
      errors: [
        {
          data: {
            className: 'Readonly',
            readonlyPrefix: 'readonly ',
            type: 'string[]',
          },
          messageId: 'errorStringArraySimpleReadonly',
        },
      ],
      options: [{ default: 'array-simple' }],
      output: 'declare function foo<E extends readonly string[]>(extra: E): E;',
    },
    {
      code: 'type Conditional<T> = Array<T extends string ? string : number>;',
      errors: [
        {
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          messageId: 'errorStringArray',
        },
      ],
      options: [{ default: 'array' }],
      output: 'type Conditional<T> = (T extends string ? string : number)[];',
    },
    {
      code: 'type Conditional<T> = (T extends string ? string : number)[];',
      errors: [
        {
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          messageId: 'errorStringGenericSimple',
        },
      ],
      options: [{ default: 'array-simple' }],
      output:
        'type Conditional<T> = Array<T extends string ? string : number>;',
    },
    {
      code: 'type Conditional<T> = (T extends string ? string : number)[];',
      errors: [
        {
          data: { className: 'Array', readonlyPrefix: '', type: 'T' },
          messageId: 'errorStringGeneric',
        },
      ],
      options: [{ default: 'generic' }],
      output:
        'type Conditional<T> = Array<T extends string ? string : number>;',
    },
  ],
});

// -- eslint rule tester is not working with multi-pass
// https://github.com/eslint/eslint/issues/11187
describe('array-type (nested)', () => {
  const linter = new TSESLint.Linter({ configType: 'eslintrc' });
  linter.defineRule('array-type', rule);
  linter.defineParser('@typescript-eslint/parser', parser);

  describe('should deeply fix correctly', () => {
    function testOutput(
      defaultOption: OptionString,
      code: string,
      output: string,
      readonlyOption?: OptionString,
    ): void {
      it(code, () => {
        const result = linter.verifyAndFix(
          code,
          {
            parser: '@typescript-eslint/parser',
            rules: {
              'array-type': [
                2,
                { default: defaultOption, readonly: readonlyOption },
              ],
            },
          },
          {
            fix: true,
          },
        );

        expect(result.messages).toHaveLength(0);
        expect(result.output).toBe(output);
      });
    }

    testOutput(
      'array',
      'let a: ({ foo: Array<Array<Bar> | Array<any>> })[] = []',
      'let a: ({ foo: (Bar[] | any[])[] })[] = []',
    );
    testOutput(
      'array',
      `
class Foo<T = Array<Array<Bar>>> extends Bar<T, Array<T>> implements Baz<Array<T>> {
    private s: Array<T>

    constructor (p: Array<T>) {
        return new Array()
    }
}
      `,
      `
class Foo<T = Bar[][]> extends Bar<T, T[]> implements Baz<T[]> {
    private s: T[]

    constructor (p: T[]) {
        return new Array()
    }
}
      `,
    );
    testOutput(
      'array',
      `
interface WorkingArray {
  outerProperty: Array<
    { innerPropertyOne: string } & { innerPropertyTwo: string }
  >;
}

interface BrokenArray {
  outerProperty: Array<
    ({ innerPropertyOne: string } & { innerPropertyTwo: string })
  >;
}
      `,
      `
interface WorkingArray {
  outerProperty: ({ innerPropertyOne: string } & { innerPropertyTwo: string })[];
}

interface BrokenArray {
  outerProperty: ({ innerPropertyOne: string } & { innerPropertyTwo: string })[];
}
      `,
    );
    testOutput(
      'array',
      `
type WorkingArray = {
  outerProperty: Array<
    { innerPropertyOne: string } & { innerPropertyTwo: string }
  >;
}

type BrokenArray = {
  outerProperty: Array<
    ({ innerPropertyOne: string } & { innerPropertyTwo: string })
  >;
}
      `,
      `
type WorkingArray = {
  outerProperty: ({ innerPropertyOne: string } & { innerPropertyTwo: string })[];
}

type BrokenArray = {
  outerProperty: ({ innerPropertyOne: string } & { innerPropertyTwo: string })[];
}
      `,
    );
    testOutput(
      'array',
      'const a: Array<(string|number)>;',
      'const a: (string|number)[];',
    );
    testOutput(
      'array-simple',
      'let xx: Array<Array<number>> = [[1, 2], [3]];',
      'let xx: number[][] = [[1, 2], [3]];',
    );
    testOutput(
      'array',
      'let xx: Array<Array<number>> = [[1, 2], [3]];',
      'let xx: number[][] = [[1, 2], [3]];',
    );
    testOutput(
      'generic',
      'let yy: number[][] = [[4, 5], [6]];',
      'let yy: Array<Array<number>> = [[4, 5], [6]];',
    );
    testOutput('array', 'let a: Array<any[]> = [];', 'let a: any[][] = [];');
    testOutput(
      'array',
      'let a: Array<any[]>[] = [];',
      'let a: any[][][] = [];',
    );

    testOutput(
      'generic',
      'let a: Array<any[]> = [];',
      'let a: Array<Array<any>> = [];',
    );
    testOutput(
      'generic',
      'let a: Array<any[]>[] = [];',
      'let a: Array<Array<Array<any>>> = [];',
    );
    testOutput(
      'generic',
      'let a: Array<Array>[] = [];',
      'let a: Array<Array<Array>> = [];',
    );
    testOutput(
      'generic',
      'let a: Array<Array[]>[] = [];',
      'let a: Array<Array<Array<Array>>> = [];',
    );

    // readonly
    testOutput(
      'generic',
      'let x: readonly number[][]',
      'let x: ReadonlyArray<Array<number>>',
    );
    testOutput(
      'generic',
      'let x: readonly (readonly number[])[]',
      'let x: ReadonlyArray<ReadonlyArray<number>>',
    );
    testOutput(
      'array',
      'let x: ReadonlyArray<Array<number>>',
      'let x: readonly number[][]',
    );
    testOutput(
      'array',
      'let x: ReadonlyArray<ReadonlyArray<number>>',
      'let x: readonly (readonly number[])[]',
    );
    testOutput(
      'array',
      'let x: ReadonlyArray<readonly number[]>',
      'let x: readonly (readonly number[])[]',
    );
    testOutput(
      'array',
      'let a: readonly number[][] = []',
      'let a: ReadonlyArray<number[]> = []',
      'generic',
    );
    testOutput(
      'generic',
      'let a: readonly number[][] = []',
      'let a: readonly Array<number>[] = []',
      'array',
    );
    testOutput(
      'generic',
      'type T = readonly(string)[]',
      'type T = ReadonlyArray<string>',
      'generic',
    );
    testOutput(
      'generic',
      'let a: readonly(readonly string[])[] = []',
      'let a: ReadonlyArray<ReadonlyArray<string>> = []',
      'generic',
    );
    testOutput(
      'generic',
      'type T = readonly(readonly string[])[]',
      'type T = ReadonlyArray<ReadonlyArray<string>>',
      'generic',
    );
    testOutput(
      'generic',
      'type T = readonly (readonly string[])[]',
      'type T = ReadonlyArray<ReadonlyArray<string>>',
      'generic',
    );
    testOutput(
      'generic',
      'type T = readonly    (readonly string[])[]',
      'type T = ReadonlyArray<ReadonlyArray<string>>',
      'generic',
    );
  });
});

describe('schema validation', () => {
  // https://github.com/typescript-eslint/typescript-eslint/issues/6852
  test("array-type does not accept 'simple-array' option", () => {
    expect(areOptionsValid(rule, [{ default: 'simple-array' }])).toBe(false);
  });

  // https://github.com/typescript-eslint/typescript-eslint/issues/6892
  test('array-type does not accept non object option', () => {
    expect(areOptionsValid(rule, ['array'])).toBe(false);
  });
});
