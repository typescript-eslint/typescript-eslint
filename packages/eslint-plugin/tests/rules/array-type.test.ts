import { TSESLint } from '@typescript-eslint/experimental-utils';
import * as parser from '@typescript-eslint/parser';
import rule, { OptionString } from '../../src/rules/array-type';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

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
  ],
  invalid: [
    // Base cases from https://github.com/typescript-eslint/typescript-eslint/issues/2323#issuecomment-663977655
    {
      code: 'let a: Array<number> = [];',
      output: 'let a: number[] = [];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Array<string | number> = [];',
      output: 'let a: (string | number)[] = [];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      output: 'let a: readonly number[] = [];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      output: 'let a: readonly (string | number)[] = [];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Array<number> = [];',
      output: 'let a: number[] = [];',
      options: [{ default: 'array', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Array<string | number> = [];',
      output: 'let a: (string | number)[] = [];',
      options: [{ default: 'array', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      output: 'let a: readonly number[] = [];',
      options: [{ default: 'array', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      output: 'let a: readonly (string | number)[] = [];',
      options: [{ default: 'array', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Array<number> = [];',
      output: 'let a: number[] = [];',
      options: [{ default: 'array', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Array<string | number> = [];',
      output: 'let a: (string | number)[] = [];',
      options: [{ default: 'array', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      output: 'let a: readonly number[] = [];',
      options: [{ default: 'array', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      output: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'array', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Array<number> = [];',
      output: 'let a: number[] = [];',
      options: [{ default: 'array', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Array<string | number> = [];',
      output: 'let a: (string | number)[] = [];',
      options: [{ default: 'array', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly number[] = [];',
      output: 'let a: ReadonlyArray<number> = [];',
      options: [{ default: 'array', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      output: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'array', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Array<number> = [];',
      output: 'let a: number[] = [];',
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: (string | number)[] = [];',
      output: 'let a: Array<string | number> = [];',
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      output: 'let a: readonly number[] = [];',
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      output: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Array<number> = [];',
      output: 'let a: number[] = [];',
      options: [{ default: 'array-simple', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: (string | number)[] = [];',
      output: 'let a: Array<string | number> = [];',
      options: [{ default: 'array-simple', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      output: 'let a: readonly number[] = [];',
      options: [{ default: 'array-simple', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      output: 'let a: readonly (string | number)[] = [];',
      options: [{ default: 'array-simple', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Array<number> = [];',
      output: 'let a: number[] = [];',
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: (string | number)[] = [];',
      output: 'let a: Array<string | number> = [];',
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      output: 'let a: readonly number[] = [];',
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      output: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'array-simple', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Array<number> = [];',
      output: 'let a: number[] = [];',
      options: [{ default: 'array-simple', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: (string | number)[] = [];',
      output: 'let a: Array<string | number> = [];',
      options: [{ default: 'array-simple', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly number[] = [];',
      output: 'let a: ReadonlyArray<number> = [];',
      options: [{ default: 'array-simple', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      output: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'array-simple', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: number[] = [];',
      output: 'let a: Array<number> = [];',
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: (string | number)[] = [];',
      output: 'let a: Array<string | number> = [];',
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly number[] = [];',
      output: 'let a: ReadonlyArray<number> = [];',
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      output: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: number[] = [];',
      output: 'let a: Array<number> = [];',
      options: [{ default: 'generic', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: (string | number)[] = [];',
      output: 'let a: Array<string | number> = [];',
      options: [{ default: 'generic', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      output: 'let a: readonly number[] = [];',
      options: [{ default: 'generic', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<string | number> = [];',
      output: 'let a: readonly (string | number)[] = [];',
      options: [{ default: 'generic', readonly: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: number[] = [];',
      output: 'let a: Array<number> = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: (string | number)[] = [];',
      output: 'let a: Array<string | number> = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: ReadonlyArray<number> = [];',
      output: 'let a: readonly number[] = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      output: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'generic', readonly: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: number[] = [];',
      output: 'let a: Array<number> = [];',
      options: [{ default: 'generic', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: (string | number)[] = [];',
      output: 'let a: Array<string | number> = [];',
      options: [{ default: 'generic', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly number[] = [];',
      output: 'let a: ReadonlyArray<number> = [];',
      options: [{ default: 'generic', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'number' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: readonly (string | number)[] = [];',
      output: 'let a: ReadonlyArray<string | number> = [];',
      options: [{ default: 'generic', readonly: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    // End of base cases

    {
      code: 'let a: { foo: Array<Bar> }[] = [];',
      output: 'let a: { foo: Bar[] }[] = [];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'Bar' },
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: 'let a: Array<{ foo: Bar[] }> = [];',
      output: 'let a: Array<{ foo: Array<Bar> }> = [];',
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'Bar' },
          line: 1,
          column: 21,
        },
      ],
    },
    {
      code: 'let a: Array<{ foo: Foo | Bar[] }> = [];',
      output: 'let a: Array<{ foo: Foo | Array<Bar> }> = [];',
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'Bar' },
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: 'function foo(a: Array<Bar>): Array<Bar> {}',
      output: 'function foo(a: Bar[]): Bar[] {}',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'Bar' },
          line: 1,
          column: 17,
        },
        {
          messageId: 'errorStringArray',
          data: { type: 'Bar' },
          line: 1,
          column: 30,
        },
      ],
    },
    {
      code: 'let x: Array<undefined> = [undefined] as undefined[];',
      output: 'let x: undefined[] = [undefined] as undefined[];',
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'undefined' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: "let y: string[] = <Array<string>>['2'];",
      output: "let y: string[] = <string[]>['2'];",
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'string' },
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: "let z: Array = [3, '4'];",
      output: "let z: any[] = [3, '4'];",
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'any' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: "let ya = [[1, '2']] as [number, string][];",
      output: "let ya = [[1, '2']] as Array<[number, string]>;",
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: 'type Arr<T> = Array<T>;',
      output: 'type Arr<T> = T[];',
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'T' },
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: `
// Ignore user defined aliases
let yyyy: Arr<Array<Arr<string>>[]> = [[[['2']]]];
      `,
      output: `
// Ignore user defined aliases
let yyyy: Arr<Array<Array<Arr<string>>>> = [[[['2']]]];
      `,
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 3,
          column: 15,
        },
      ],
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
      output: `
interface ArrayClass<T> {
  foo: T[];
  bar: T[];
  baz: Arr<T>;
  xyz: this[];
}
      `,
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'T' },
          line: 3,
          column: 8,
        },
      ],
    },
    {
      code: `
function barFunction(bar: ArrayClass<String>[]) {
  return bar.map(e => e.bar);
}
      `,
      output: `
function barFunction(bar: Array<ArrayClass<String>>) {
  return bar.map(e => e.bar);
}
      `,
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 2,
          column: 27,
        },
      ],
    },
    {
      code: 'let barVar: ((c: number) => number)[];',
      output: 'let barVar: Array<(c: number) => number>;',
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 13,
        },
      ],
    },
    {
      code: 'type barUnion = (string | number | boolean)[];',
      output: 'type barUnion = Array<string | number | boolean>;',
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: 'type barIntersection = (string & number)[];',
      output: 'type barIntersection = Array<string & number>;',
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: "let v: Array<fooName.BarType> = [{ bar: 'bar' }];",
      output: "let v: fooName.BarType[] = [{ bar: 'bar' }];",
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'fooName.BarType' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: "let w: fooName.BazType<string>[] = [['baz']];",
      output: "let w: Array<fooName.BazType<string>> = [['baz']];",
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringGenericSimple',
          data: { type: 'T' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let x: Array<undefined> = [undefined] as undefined[];',
      output: 'let x: undefined[] = [undefined] as undefined[];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'undefined' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: "let y: string[] = <Array<string>>['2'];",
      output: "let y: string[] = <string[]>['2'];",
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'string' },
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: "let z: Array = [3, '4'];",
      output: "let z: any[] = [3, '4'];",
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'any' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'type Arr<T> = Array<T>;',
      output: 'type Arr<T> = T[];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: `
// Ignore user defined aliases
let yyyy: Arr<Array<Arr<string>>[]> = [[[['2']]]];
      `,
      output: `
// Ignore user defined aliases
let yyyy: Arr<Arr<string>[][]> = [[[['2']]]];
      `,
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
interface ArrayClass<T> {
  foo: Array<T>;
  bar: T[];
  baz: Arr<T>;
}
      `,
      output: `
interface ArrayClass<T> {
  foo: T[];
  bar: T[];
  baz: Arr<T>;
}
      `,
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 3,
          column: 8,
        },
      ],
    },
    {
      code: `
function fooFunction(foo: Array<ArrayClass<string>>) {
  return foo.map(e => e.foo);
}
      `,
      output: `
function fooFunction(foo: ArrayClass<string>[]) {
  return foo.map(e => e.foo);
}
      `,
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 2,
          column: 27,
        },
      ],
    },
    {
      code: 'let fooVar: Array<(c: number) => number>;',
      output: 'let fooVar: ((c: number) => number)[];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 13,
        },
      ],
    },
    {
      code: 'type fooUnion = Array<string | number | boolean>;',
      output: 'type fooUnion = (string | number | boolean)[];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: 'type fooIntersection = Array<string & number>;',
      output: 'type fooIntersection = (string & number)[];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: 'let x: Array;',
      output: 'let x: any[];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'any' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let x: Array<>;',
      output: 'let x: any[];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'any' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let x: Array;',
      output: 'let x: any[];',
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          data: { type: 'any' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let x: Array<>;',
      output: 'let x: any[];',
      options: [{ default: 'array-simple' }],
      errors: [
        {
          messageId: 'errorStringArraySimple',
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let x: Array<number> = [1] as number[];',
      output: 'let x: Array<number> = [1] as Array<number>;',
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'number' },
          line: 1,
          column: 31,
        },
      ],
    },
    {
      code: "let y: string[] = <Array<string>>['2'];",
      output: "let y: Array<string> = <Array<string>>['2'];",
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'string' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: "let ya = [[1, '2']] as [number, string][];",
      output: "let ya = [[1, '2']] as Array<[number, string]>;",
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: `
// Ignore user defined aliases
let yyyy: Arr<Array<Arr<string>>[]> = [[[['2']]]];
      `,
      output: `
// Ignore user defined aliases
let yyyy: Arr<Array<Array<Arr<string>>>> = [[[['2']]]];
      `,
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
interface ArrayClass<T> {
  foo: Array<T>;
  bar: T[];
  baz: Arr<T>;
}
      `,
      output: `
interface ArrayClass<T> {
  foo: Array<T>;
  bar: Array<T>;
  baz: Arr<T>;
}
      `,
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 4,
          column: 8,
        },
      ],
    },
    {
      code: `
function barFunction(bar: ArrayClass<String>[]) {
  return bar.map(e => e.bar);
}
      `,
      output: `
function barFunction(bar: Array<ArrayClass<String>>) {
  return bar.map(e => e.bar);
}
      `,
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 2,
          column: 27,
        },
      ],
    },
    {
      code: 'let barVar: ((c: number) => number)[];',
      output: 'let barVar: Array<(c: number) => number>;',
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 13,
        },
      ],
    },
    {
      code: 'type barUnion = (string | number | boolean)[];',
      output: 'type barUnion = Array<string | number | boolean>;',
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: 'type barIntersection = (string & number)[];',
      output: 'type barIntersection = Array<string & number>;',
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: `
interface FooInterface {
  '.bar': { baz: string[] };
}
      `,
      output: `
interface FooInterface {
  '.bar': { baz: Array<string> };
}
      `,
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'string' },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/172
      code: 'type Unwrap<T> = T extends Array<infer E> ? E : T;',
      output: 'type Unwrap<T> = T extends (infer E)[] ? E : T;',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'T' },
          line: 1,
          column: 28,
        },
      ],
    },
    {
      // https://github.com/typescript-eslint/typescript-eslint/issues/172
      code: 'type Unwrap<T> = T extends (infer E)[] ? E : T;',
      output: 'type Unwrap<T> = T extends Array<infer E> ? E : T;',
      options: [{ default: 'generic' }],
      errors: [
        {
          messageId: 'errorStringGeneric',
          data: { type: 'T' },
          line: 1,
          column: 28,
        },
      ],
    },
    {
      code: 'type Foo = ReadonlyArray<object>[];',
      output: 'type Foo = (readonly object[])[];',
      options: [{ default: 'array' }],
      errors: [
        {
          messageId: 'errorStringArray',
          data: { type: 'object' },
          line: 1,
          column: 12,
        },
      ],
    },
  ],
});

// eslint rule tester is not working with multi-pass
// https://github.com/eslint/eslint/issues/11187
describe('array-type (nested)', () => {
  const linter = new TSESLint.Linter();
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
            rules: {
              'array-type': [
                2,
                { default: defaultOption, readonly: readonlyOption },
              ],
            },
            parser: '@typescript-eslint/parser',
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
    testOutput('array', 'let a: Array<>[] = [];', 'let a: any[][] = [];');
    testOutput('array', 'let a: Array<any[]> = [];', 'let a: any[][] = [];');
    testOutput(
      'array',
      'let a: Array<any[]>[] = [];',
      'let a: any[][][] = [];',
    );

    testOutput(
      'generic',
      'let a: Array<>[] = [];',
      'let a: Array<Array<>> = [];',
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
