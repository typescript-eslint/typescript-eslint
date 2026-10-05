import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unused-destructure-type-properties';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-unused-destructure-type-properties', rule, {
  valid: [
    // not destructuring on a type
    'function test() {}',
    'function test(param) {}',
    'function test(param: any) {}',
    'function test(param: unknown) {}',
    'function test(param: string) {}',
    'function test(param: string[]) {}',
    'function test(param: Promise<string>) {}',
    'function test(param: { unused: boolean }) {}',
    'function test(param: { used1: { used2: string }; used3: number }) {}',
    'function test(param: [string]) {}',
    'function test(param: [string, number]) {}',
    // exhaustive destructuring
    'function test({ used }: { used: string }) {}',
    'function test({ used1, used2 }: { used1: string; used2: boolean }) {}',
    'function test({ used1, used2 }: { used1: boolean }) {}',
    "function test({ ['used']: renamed }: { used: boolean }) {}",
    'function test({ used1: { used2 }, used3 }: { used1: { used2 }; used3 }) {}',
    'function test([used1, used2]: [string, number]) {}',
    'function test([[nested1], used2]: [[string], number]) {}',
    'function test([[[nested1]], used2]: [[[string]], number]) {}',
    // complex keys to statically analyze
    "function test({ ['used']: used }: { used: string }) {}",
    'function test({ [Symbol.iterator]: used }: { [Symbol.iterator]: string }) {}',
    'function test({ [1]: used }: { 1: string }) {}',
    `
const token = Symbol();

function test({ [token]: used }: { [token]: string }) {}
    `,
    // destructuring over an array (as opposed to a tuple)
    'function test([]: string[]) {}',
    'function test([used]: string[]) {}',
    'function test([used]: [string]) {}',
    `
function test({
  used1: {
    used2: [used3, used4],
  },
  used5,
}: {
  used1: { used2: [number, string] };
  used5;
}) {}
    `,
    // non-inline types
    `
type O = {
  unused: boolean;
};

function test(param: O) {}
    `,
    `
type O = {
  used: number;
  unused: boolean;
};

function test({ used }: O) {}
    `,
    `
type O = [boolean];

function test(param: O) {}
    `,
    `
type O = [number, boolean];

function test([used]: O) {}
    `,
    // index signatures
    'function test({ used }: { [i: string]: number }) {}',
    'function test({ included: renamed }: { [i: string]: number }) {}',
    'function test({ 1: renamed }: { [i: number]: number }) {}',
    'function test({ included, used }: { used: boolean; [i: string]: boolean }) {}',
    `
function test({
  1: included1,
  a: included2,
}: {
  [i: string]: boolean;
  [i: number]: boolean;
}) {}
    `,
    `
function test({
  1: included1,
  a: included2,
  included3,
}: {
  [i: string]: boolean;
  [i: number]: boolean;
  included3: string;
}) {}
    `,
    `
function test({
  used: { hello },
}: {
  [i: string]: { hello: string; world: string };
}) {}
    `,
    'function test({ used }: { [i: string, j: number]: number }) {}',
    // template literals as keys of index signatures
    `
function test({ _used }: { [i: \`_\${string}\`]: string }) {}
    `,
    `
function test({ _used1, _used2 }: { [i: \`_\${string}\`]: string }) {}
    `,
    `
function test({ _used1_, _used2_ }: { [i: \`_\${string}_\`]: string }) {}
    `,
    `
declare const s: \`_\${string}\${string}_\`;

function test({ [s]: used }: { [i: \`_\${string}_\`]: string }) {}
    `,
    // destructure with dynamic keys
    `
declare const s: 'bar' | 'foo';

function test({ [s]: used }: { foo: string; bar: string }) {}
    `,
    `
declare const s: string;

function test({ [s]: used }: { foo: string; bar: string }) {}
    `,
    `
declare const s: string | number;

function test({ [s]: used }: { foo: string; bar: string; 1: string }) {}
    `,
    `
declare const s: number;

function test({ [s]: used }: { [i: number]: string }) {}
    `,
    `
declare const s: 1;

function test({ [s]: used }: { [i: number]: string }) {}
    `,
    `
declare const s: 1 | 2;

function test({ [s]: used }: { [i: number]: string }) {}
    `,
    `
declare const s: string;

function test({ [s]: used }: { [i: string | number]: string }) {}
    `,
    `
declare const s: string | number;

function test({ [s]: used }: { [i: string | number]: string }) {}
    `,
    `
declare const s: \`_\${string}_\`;

function test({ [s]: used }: { [i: string]: string }) {}
    `,
    `
declare const s: string | number;

function test({
  [s]: used,
}: {
  foo: string;
  bar: string;
  [i: number]: string;
}) {}
    `,
    `
declare const a: number | 'bar' | 'foo';

function test({ [a]: used }: { [i: number]: number; foo: string }) {}
    `,
    `
declare const s: number;

function test({ [s]: used }: { hello: string; 2: number; 3: boolean }) {}
    `,
    // different kinds of destructuring
    `
declare const obj: unknown;
const { used1, used2 }: { used1: string; used2: string } = obj;
    `,
    `
class Test {
  constructor({ used1, used2 }: { used1: string; used2: string }) {}
}
    `,
    `
class Test {
  test({ used1, used2 }: { used1: string; used2: string }) {}
}
    `,
    `
const test = ({ used1, used2 }: { used1: string; used2: string }) => {};
    `,
    `
const test = ({ used1, used2 }: { used1: string; used2: string }) => 1;
    `,
    `
function test({ used1, used2 }: { used1?: string; used2: string }) {}
    `,
    `
function test({ used1 = 'default', used2 }: { used1: string; used2: string }) {}
    `,
    // skipping a tuple item
    'function test([, used]: [boolean, number]) {}',
    'function test([, used, , , ,]: [boolean, number]) {}',
    'function test({ used: [, a] }: { used: [boolean, number] }) {}',
    'function test([used1, , used2]: [boolean, number, string]) {}',
    // rest element
    'function test([used1, used2, ...rest]: [boolean, number, string, string]) {}',
    `
function test({
  used1,
  used2,
  ...rest
}: {
  used1: string;
  used2: number;
  unused1: boolean;
  unused2: number;
}) {}
    `,
    // misc
    'function test({ used }: { [i: `_${string}`]: number | string }) {}',
    'function test({ used }: { [i: `_${string}`] }) {}',
    'function test({ hello: used }: { [b] }) {}',
    'function test({ hello: used }: { [i: string, j: number]: string }) {}',
    'function test({ foo }: { foo(): void }) {}',
    'function test({ foo }: { (): void }) {}',
    'function test({}: { (): void }) {}',
    // tuple type spread
    'function test([a]: [...string[], number]) {}',
    'function test([a, b]: [boolean, ...string[], number]) {}',
    'function test([a, b, c]: [...number[]]) {}',
    'function test([...a]: [...number[]]) {}',
    // generic type constraints
    `
function test<R extends string>({ a }: { [i: R]: string }) {}
    `,
    `
function test<R extends 'used1' | 'used2'>(
  a: R,
  {
    [a]: used,
  }: {
    used1: string;
    used2: string;
  },
) {}
    `,
    'function test<R>({ a }: { [i: `${string}`]: R }) {}',
    'function test<R extends boolean>({ a }: { [i: `${string}`]: R }) {}',
    'function test<R extends boolean>({ a }: { [i: `${string}`]: number | R }) {}',
    // numeric-like keys
    "function test({ '1': used }: { 1: string }) {}",
    "function test({ 1: used }: { '1': string }) {}",
    "function test({ '1': used }: { [i: number]: string }) {}",
    // template literal index signatures matched by key
    `
function test({
  a,
  b,
}: {
  [i: \`b\${string}\`]: string;
  [i: \`a\${string}\`]: string;
}) {}
    `,
    // default values
    `
function test({
  used: { nested } = { nested: 1 },
}: {
  used?: { nested: number };
}) {}
    `,
    'function test([{ used } = { used: 1 }]: [{ used: number }?]) {}',
    // named and optional tuple members
    'function test([first, second]: [first: string, second?: number]) {}',
    'function test([{ used }]: [first: { used: string }]) {}',
    // object patterns on tuples
    'function test({ 0: a, 1: b }: [string, number]) {}',
    'function test({ 0: a, ...rest }: [string, number]) {}',
    'function test({ 0: a }: [string, ...number[]]) {}',
    `
declare const index: number;

function test({ [index]: a }: [string, number]) {}
    `,
    // Record
    "function test({ used }: Record<'used', boolean>) {}",
    "function test({ a, b }: Record<'a' | 'b', boolean>) {}",
    "function test({ a, ...rest }: Record<'a' | 'b', boolean>) {}",
    "function test({ a }: Record<'a' | string, boolean>) {}",
    'function test({ a }: Record<string, boolean>) {}',
    `
type Keys = 'a' | 'b';

function test({ a }: Record<Keys, boolean>) {}
    `,
    `
declare const key: 'a' | 'b';

function test({ [key]: value }: Record<'a' | 'b', boolean>) {}
    `,
    `
declare const key: string;

function test({ [key]: value }: Record<'a' | 'b', boolean>) {}
    `,
    `
export {};

type Record<K extends string, V> = { [P in K]: V };

function test({ a }: Record<'a' | 'b', boolean>) {}
    `,
    // other kinds of types
    'function test({ used }: { used: string } & { unused: string }) {}',
    "function test({ used }: Pick<{ used: string; unused: string }, 'used'>) {}",
    // signatures without implementations
    'declare function test({ used }: { used: string; unused: string }): void;',
    'declare const { used }: { used: string; unused: string };',
    'type Test = ({ used }: { used: string; unused: string }) => void;',
    'type Test = new ({ used }: { used: string; unused: string }) => object;',
    `
interface Test {
  ({ used }: { used: string; unused: string }): void;
  new ({ used }: { used: string; unused: string }): Test;
  method({ used }: { used: string; unused: string }): void;
}
    `,
    `
abstract class Test {
  abstract method({ used }: { used: string; unused: string }): void;
}
    `,
    `
function test({ used }: { used: string; unused: string }): void;
function test({ used }: { used: string }) {}
    `,
    `
class Test {
  method({ used }: { used: string; unused: string }): void;
  method({ used }: { used: string }) {}
}
    `,
    // properties also used as a whole
    'function test({ used, used: { nested } }: { used: { nested: 1; other: 2 } }) {}',
    `
function test({
  used: { first },
  used: { second },
}: {
  used: { first: 1; second: 2 };
}) {}
    `,
    // elements after a tuple rest type
    `
function test([{ used }, other]: [
  ...{ used: 1 }[],
  { used: number; other: number },
]) {}
    `,
    // readonly tuples
    'function test([first, second]: readonly [string, number]) {}',
    'function test({ length }: [string, number]) {}',
    // ambient contexts
    `
declare namespace Test {
  const { used }: { used: string; unused: string };
}
    `,
    `
declare global {
  const { used }: { used: string; unused: string };
}
    `,
    // template literal keys on number index signatures
    `
function test(key: \`\${number}\`, { [key]: used }: { [i: number]: string }) {}
    `,
    // numeric keys on template literal index signatures
    "function test({ '1': used }: { [i: `${number}`]: string }) {}",
    // dynamic keys that might be numeric or branded
    `
declare const key: string;

function test({ [key]: used }: { [1]: string; [i: string]: string }) {}
    `,
    `
declare const key: string & { brand: true };

function test({ [key]: used }: { a: string; [i: string]: string }) {}
    `,
    `
declare const key: string;

function test({
  used: { nested },
  [key]: other,
}: {
  used: { nested: string; other?: string };
  [i: string]: { nested: string; other?: string };
}) {}
    `,
    'function test({ 0: whole, 0: { used } }: [{ used: 1; other: 2 }]) {}',
    'function test({ 0: { first }, 0: { second } }: [{ first: 1; second: 2 }]) {}',
  ],
  invalid: [
    // non-exhaustive destructuring
    {
      code: 'function test({}: { unused: boolean }) {}',
      errors: [
        {
          column: 21,
          data: { key: 'unused', type: 'property' },
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({}: {  }) {}',
    },
    {
      code: 'function test({}: { 1: boolean }) {}',
      errors: [
        {
          column: 21,
          data: { key: '1', type: 'property' },
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({}: {  }) {}',
    },
    {
      code: 'function test({ used }: { unused: boolean; used: boolean }) {}',
      errors: [
        {
          column: 27,
          data: { key: 'unused', type: 'property' },
          endColumn: 43,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ used }: {  used: boolean }) {}',
    },
    {
      code: 'function test([]: [boolean]) {}',
      errors: [
        {
          column: 20,
          data: { key: '0', type: 'element' },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([]: []) {}',
    },
    {
      code: 'function test([a]: [boolean, number]) {}',
      errors: [
        {
          column: 30,
          data: { key: '1', type: 'element' },
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([a]: [boolean, ]) {}',
    },
    {
      code: 'function test([a]: [boolean, number, string]) {}',
      errors: [
        {
          column: 30,
          data: { key: '1', type: 'element' },
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
        {
          column: 38,
          data: { key: '2', type: 'element' },
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([a]: [boolean,  ]) {}',
    },
    {
      code: 'function test([{ used }]: [{ used: string; unused: number }, number]) {}',
      errors: [
        {
          column: 44,
          data: { key: 'unused', type: 'property' },
          endColumn: 58,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
        {
          column: 62,
          data: { key: '1', type: 'element' },
          endColumn: 68,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([{ used }]: [{ used: string;  }, ]) {}',
    },
    {
      code: 'function test([[used]]: [[string, number], number]) {}',
      errors: [
        {
          column: 35,
          data: { key: '1', type: 'element' },
          endColumn: 41,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
        {
          column: 44,
          data: { key: '1', type: 'element' },
          endColumn: 50,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([[used]]: [[string, ], ]) {}',
    },
    // complex keys to statically analyze
    {
      code: "function test({ ['used']: renamed }: { unused: boolean; used: boolean }) {}",
      errors: [
        {
          column: 40,
          data: { key: 'unused', type: 'property' },
          endColumn: 56,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: "function test({ ['used']: renamed }: {  used: boolean }) {}",
    },
    {
      code: `
function test({
  [Symbol.iterator]: renamed,
}: {
  unused: boolean;
  [Symbol.iterator]: boolean;
}) {}
      `,
      errors: [
        {
          column: 3,
          data: { key: 'unused', type: 'property' },
          endColumn: 19,
          endLine: 5,
          line: 5,
          messageId: 'unused',
        },
      ],
      output: `
function test({
  [Symbol.iterator]: renamed,
}: {
  [Symbol.iterator]: boolean;
}) {}
      `,
    },
    {
      code: `
function test({ used }: { used: boolean; [Symbol.iterator]: boolean }) {}
      `,
      errors: [
        {
          column: 42,
          data: { key: '[Symbol.iterator]', type: 'property' },
          endColumn: 68,
          endLine: 2,
          line: 2,
          messageId: 'unused',
        },
      ],
      output: `
function test({ used }: { used: boolean;  }) {}
      `,
    },
    {
      code: `
const token = Symbol();

function test({ [token]: renamed }: { unused: boolean; [token]: boolean }) {}
      `,
      errors: [
        {
          column: 39,
          data: { key: 'unused', type: 'property' },
          endColumn: 55,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
const token = Symbol();

function test({ [token]: renamed }: {  [token]: boolean }) {}
      `,
    },
    {
      code: `
const token = Symbol();

function test({ used }: { used: boolean; [token]: boolean }) {}
      `,
      errors: [
        {
          column: 42,
          data: { key: '[token]', type: 'property' },
          endColumn: 58,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
const token = Symbol();

function test({ used }: { used: boolean;  }) {}
      `,
    },
    {
      code: 'function test({ [1]: renamed }: { unused: boolean; 1: boolean }) {}',
      errors: [
        {
          column: 35,
          data: { key: 'unused', type: 'property' },
          endColumn: 51,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ [1]: renamed }: {  1: boolean }) {}',
    },
    // index signatures
    {
      code: 'function test({}: { [i: string]: boolean }) {}',
      errors: [
        {
          column: 21,
          data: { key: '[string]', type: 'index signature' },
          endColumn: 41,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({}: {  }) {}',
    },
    {
      code: 'function test({}: { [i: string | number]: boolean }) {}',
      errors: [
        {
          column: 21,
          data: { key: '[string | number]', type: 'index signature' },
          endColumn: 50,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({}: {  }) {}',
    },
    {
      code: 'function test({ used }: { used: boolean; [i: string]: boolean }) {}',
      errors: [
        {
          column: 42,
          data: { key: '[string]', type: 'index signature' },
          endColumn: 62,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ used }: { used: boolean;  }) {}',
    },
    {
      code: 'function test({ used }: { [i: number]: boolean; [i: string]: boolean }) {}',
      errors: [
        {
          column: 27,
          data: { key: '[number]', type: 'index signature' },
          endColumn: 48,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ used }: {  [i: string]: boolean }) {}',
    },
    {
      code: 'function test({ 1: used }: { [i: number]: boolean; [i: string]: boolean }) {}',
      errors: [
        {
          column: 52,
          data: { key: '[string]', type: 'index signature' },
          endColumn: 72,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ 1: used }: { [i: number]: boolean;  }) {}',
    },
    {
      code: 'function test({ used }: { unused: string; [i: string]: boolean }) {}',
      errors: [
        {
          column: 27,
          data: { key: 'unused', type: 'property' },
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ used }: {  [i: string]: boolean }) {}',
    },
    {
      code: 'function test({ a }: { a: 1; [i: number]: 1; [i: string]: 1 }) {}',
      errors: [
        {
          column: 30,
          data: { key: '[number]', type: 'index signature' },
          endColumn: 45,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
        {
          column: 46,
          data: { key: '[string]', type: 'index signature' },
          endColumn: 60,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ a }: { a: 1;   }) {}',
    },
    // destructure with dynamic keys
    {
      code: `
declare const s: 1;

function test({ [s]: used }: { [i: number]: string; unused: string }) {}
      `,
      errors: [
        {
          column: 53,
          data: { key: 'unused', type: 'property' },
          endColumn: 67,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
declare const s: 1;

function test({ [s]: used }: { [i: number]: string;  }) {}
      `,
    },
    {
      code: `
declare const s: 1;

function test({ [s]: used }: { unused: string; 1: string; 2: string }) {}
      `,
      errors: [
        {
          column: 32,
          data: { key: 'unused', type: 'property' },
          endColumn: 47,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
        {
          column: 59,
          data: { key: '2', type: 'property' },
          endColumn: 68,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
declare const s: 1;

function test({ [s]: used }: {  1: string;  }) {}
      `,
    },
    {
      code: `
declare const s: 1 | 2;

function test({ [s]: used }: { unused: string; 1: string; 2: string }) {}
      `,
      errors: [
        {
          column: 32,
          data: { key: 'unused', type: 'property' },
          endColumn: 47,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
declare const s: 1 | 2;

function test({ [s]: used }: {  1: string; 2: string }) {}
      `,
    },
    {
      code: `
declare const s: 'used1' | 'used2';

function test({ [s]: _ }: { used1: string; used2: boolean; unused: number }) {}
      `,
      errors: [
        {
          column: 60,
          data: { key: 'unused', type: 'property' },
          endColumn: 74,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
declare const s: 'used1' | 'used2';

function test({ [s]: _ }: { used1: string; used2: boolean;  }) {}
      `,
    },
    {
      code: `
declare const s: 'used1' | 'used2' | 'used3';

function test({
  [s]: used,
}: {
  used1: string;
  used2: boolean;
  used3: number;
  unused: number;
}) {}
      `,
      errors: [
        {
          column: 3,
          data: { key: 'unused', type: 'property' },
          endColumn: 18,
          endLine: 10,
          line: 10,
          messageId: 'unused',
        },
      ],
      output: `
declare const s: 'used1' | 'used2' | 'used3';

function test({
  [s]: used,
}: {
  used1: string;
  used2: boolean;
  used3: number;
}) {}
      `,
    },
    {
      code: `
declare const s: 'used1' | 'used2' | 'used3';

function test({
  [s]: { [s]: used },
}: {
  used1: {
    used1: string;
    used2: boolean;
    used3: number;
    unused: number;
  };
  used2: {
    used1: string;
    used2: boolean;
    used3: number;
  };
  used3: {
    used1: string;
    used2: boolean;
    used3: number;
  };
}) {}
      `,
      errors: [
        {
          column: 5,
          data: { key: 'unused', type: 'property' },
          endColumn: 20,
          endLine: 11,
          line: 11,
          messageId: 'unused',
        },
      ],
      output: `
declare const s: 'used1' | 'used2' | 'used3';

function test({
  [s]: { [s]: used },
}: {
  used1: {
    used1: string;
    used2: boolean;
    used3: number;
  };
  used2: {
    used1: string;
    used2: boolean;
    used3: number;
  };
  used3: {
    used1: string;
    used2: boolean;
    used3: number;
  };
}) {}
      `,
    },
    {
      code: `
declare const s: 2 | 3;

function test({ [s]: used }: { hello: string; 2: number; 3: boolean }) {}
      `,
      errors: [
        {
          column: 32,
          data: { key: 'hello', type: 'property' },
          endColumn: 46,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
declare const s: 2 | 3;

function test({ [s]: used }: {  2: number; 3: boolean }) {}
      `,
    },
    {
      code: `
const m = Symbol();

declare const s: 'hello' | typeof m;

function test({ [s]: used }: { hello: string; 2: number; [m]: string }) {}
      `,
      errors: [
        {
          column: 47,
          data: { key: '2', type: 'property' },
          endColumn: 57,
          endLine: 6,
          line: 6,
          messageId: 'unused',
        },
      ],
      output: `
const m = Symbol();

declare const s: 'hello' | typeof m;

function test({ [s]: used }: { hello: string;  [m]: string }) {}
      `,
    },
    {
      code: `
declare const s: 'hello' | typeof Symbol.iterator;

function test({
  [s]: { world: used },
}: {
  hello: { world: number; unused: string };
  [Symbol.iterator]: { world: boolean };
}) {}
      `,
      errors: [
        {
          column: 27,
          data: { key: 'unused', type: 'property' },
          endColumn: 41,
          endLine: 7,
          line: 7,
          messageId: 'unused',
        },
      ],
      output: `
declare const s: 'hello' | typeof Symbol.iterator;

function test({
  [s]: { world: used },
}: {
  hello: { world: number;  };
  [Symbol.iterator]: { world: boolean };
}) {}
      `,
    },
    // template literals as keys of index signatures
    {
      code: 'function test({ used }: { used: string; [i: `_${string}`]: string }) {}',
      errors: [
        {
          column: 41,
          data: { key: '[`_${string}`]', type: 'index signature' },
          endColumn: 66,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ used }: { used: string;  }) {}',
    },
    {
      code: 'function test({ _used }: { unused: string; [i: `_${string}`]: string }) {}',
      errors: [
        {
          column: 28,
          data: { key: 'unused', type: 'property' },
          endColumn: 43,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ _used }: {  [i: `_${string}`]: string }) {}',
    },
    {
      code: `
declare const s: \`_\${'one' | 'two'}\`;

function test({ [s]: used }: { _one: string; _two: number; three: boolean }) {}
      `,
      errors: [
        {
          column: 60,
          data: { key: 'three', type: 'property' },
          endColumn: 74,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
declare const s: \`_\${'one' | 'two'}\`;

function test({ [s]: used }: { _one: string; _two: number;  }) {}
      `,
    },
    {
      code: `
declare const a: \`b\${string}\`;

function test({
  [a]: used,
}: {
  [j: string]: string;
  [i: \`b\${string}\`]: string;
  [i: \`a\${string}\`]: string;
}) {}
      `,
      errors: [
        {
          column: 3,
          data: { key: '[`a${string}`]', type: 'index signature' },
          endColumn: 29,
          endLine: 9,
          line: 9,
          messageId: 'unused',
        },
      ],
      output: `
declare const a: \`b\${string}\`;

function test({
  [a]: used,
}: {
  [j: string]: string;
  [i: \`b\${string}\`]: string;
}) {}
      `,
    },
    {
      code: `
declare const c: \`ba\${'r' | 'zz'}\`;

function test({ [c]: a }: { foo: string; bar: number; bazz: string }) {}
      `,
      errors: [
        {
          column: 29,
          data: { key: 'foo', type: 'property' },
          endColumn: 41,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
declare const c: \`ba\${'r' | 'zz'}\`;

function test({ [c]: a }: {  bar: number; bazz: string }) {}
      `,
    },
    // different kinds of destructuring
    {
      code: `
declare const obj: unknown;

const { used }: { used: string; unused: string } = obj;
      `,
      errors: [
        {
          column: 33,
          data: { key: 'unused', type: 'property' },
          endColumn: 47,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
declare const obj: unknown;

const { used }: { used: string;  } = obj;
      `,
    },
    {
      code: `
class Test {
  constructor({ used }: { used: string; unused: string }) {}
}
      `,
      errors: [
        {
          column: 41,
          data: { key: 'unused', type: 'property' },
          endColumn: 55,
          endLine: 3,
          line: 3,
          messageId: 'unused',
        },
      ],
      output: `
class Test {
  constructor({ used }: { used: string;  }) {}
}
      `,
    },
    {
      code: `
class Test {
  test({ used }: { used: string; unused: string }) {}
}
      `,
      errors: [
        {
          column: 34,
          data: { key: 'unused', type: 'property' },
          endColumn: 48,
          endLine: 3,
          line: 3,
          messageId: 'unused',
        },
      ],
      output: `
class Test {
  test({ used }: { used: string;  }) {}
}
      `,
    },
    {
      code: 'const test = ({ used }: { used: string; unused: string }) => {};',
      errors: [
        {
          column: 41,
          data: { key: 'unused', type: 'property' },
          endColumn: 55,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'const test = ({ used }: { used: string;  }) => {};',
    },
    {
      code: 'const test = ({ used }: { used: string; unused: string }) => 1;',
      errors: [
        {
          column: 41,
          data: { key: 'unused', type: 'property' },
          endColumn: 55,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'const test = ({ used }: { used: string;  }) => 1;',
    },
    {
      code: 'function test({ used }: { used?: string; unused: string }) {}',
      errors: [
        {
          column: 42,
          data: { key: 'unused', type: 'property' },
          endColumn: 56,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ used }: { used?: string;  }) {}',
    },
    {
      code: "function test({ used = 'default' }: { used: string; unused: string }) {}",
      errors: [
        {
          column: 53,
          data: { key: 'unused', type: 'property' },
          endColumn: 67,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: "function test({ used = 'default' }: { used: string;  }) {}",
    },
    // skipping a tuple item
    {
      code: 'function test([, a]: [string, number, boolean]) {}',
      errors: [
        {
          column: 39,
          data: { key: '2', type: 'element' },
          endColumn: 46,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([, a]: [string, number, ]) {}',
    },
    {
      code: 'function test([a, , b]: [string, number, boolean, string]) {}',
      errors: [
        {
          column: 51,
          data: { key: '3', type: 'element' },
          endColumn: 57,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([a, , b]: [string, number, boolean, ]) {}',
    },
    {
      code: 'function test([a, , b, , ,]: [string, number, boolean, string]) {}',
      errors: [
        {
          column: 56,
          data: { key: '3', type: 'element' },
          endColumn: 62,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([a, , b, , ,]: [string, number, boolean, ]) {}',
    },
    // misc
    {
      code: 'function test({ foo }: { foo(): void; bar(): string }) {}',
      errors: [
        {
          column: 39,
          data: { key: 'bar', type: 'property' },
          endColumn: 52,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ foo }: { foo(): void;  }) {}',
    },
    // generic type constraints
    {
      code: `
function test<R extends string>({
  1: a,
}: {
  [i: number]: number;
  [i: R]: string;
}) {}
      `,
      errors: [
        {
          column: 3,
          data: { key: '[string]', type: 'index signature' },
          endColumn: 18,
          endLine: 6,
          line: 6,
          messageId: 'unused',
        },
      ],
      output: `
function test<R extends string>({
  1: a,
}: {
  [i: number]: number;
}) {}
      `,
    },
    {
      code: 'function test<R>({ a }: { [i: string]: number; [i: `_${string}_`]: R }) {}',
      errors: [
        {
          column: 48,
          data: { key: '[`_${string}_`]', type: 'index signature' },
          endColumn: 69,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test<R>({ a }: { [i: string]: number;  }) {}',
    },
    {
      code: `
function test<R extends boolean>({
  a,
}: {
  [i: string]: number;
  [i: \`_\${string}_\`]: R;
}) {}
      `,
      errors: [
        {
          column: 3,
          data: { key: '[`_${string}_`]', type: 'index signature' },
          endColumn: 25,
          endLine: 6,
          line: 6,
          messageId: 'unused',
        },
      ],
      output: `
function test<R extends boolean>({
  a,
}: {
  [i: string]: number;
}) {}
      `,
    },
    {
      code: `
function test<R extends boolean>({
  a,
}: {
  [i: string]: number;
  [i: \`_\${string}_\`]: number | R;
}) {}
      `,
      errors: [
        {
          column: 3,
          data: { key: '[`_${string}_`]', type: 'index signature' },
          endColumn: 34,
          endLine: 6,
          line: 6,
          messageId: 'unused',
        },
      ],
      output: `
function test<R extends boolean>({
  a,
}: {
  [i: string]: number;
}) {}
      `,
    },
    {
      code: `
function test<R extends 'used1' | 'used2'>(
  a: R,
  {
    [a]: used,
  }: {
    used1: string;
    used2: number;
    unused: boolean;
  },
) {}
      `,
      errors: [
        {
          column: 5,
          data: { key: 'unused', type: 'property' },
          endColumn: 21,
          endLine: 9,
          line: 9,
          messageId: 'unused',
        },
      ],
      output: `
function test<R extends 'used1' | 'used2'>(
  a: R,
  {
    [a]: used,
  }: {
    used1: string;
    used2: number;
  },
) {}
      `,
    },
    // tuple type spread
    {
      code: `
function test([a]: [number, ...string[], boolean]) {}
      `,
      errors: [
        {
          column: 29,
          data: { key: '1', type: 'element' },
          endColumn: 40,
          endLine: 2,
          line: 2,
          messageId: 'unused',
        },
        {
          column: 42,
          data: { key: '2', type: 'element' },
          endColumn: 49,
          endLine: 2,
          line: 2,
          messageId: 'unused',
        },
      ],
      output: `
function test([a]: [number,  ]) {}
      `,
    },
    {
      code: `
function test([a, b]: [number, boolean, ...string[]]) {}
      `,
      errors: [
        {
          column: 41,
          data: { key: '2', type: 'element' },
          endColumn: 52,
          endLine: 2,
          line: 2,
          messageId: 'unused',
        },
      ],
      output: `
function test([a, b]: [number, boolean, ]) {}
      `,
    },
    // template literal index signatures matched by key
    {
      code: `
function test({
  a,
}: {
  [i: \`b\${string}\`]: string;
  [i: \`a\${string}\`]: string;
}) {}
      `,
      errors: [
        {
          column: 3,
          data: { key: '[`b${string}`]', type: 'index signature' },
          endColumn: 29,
          endLine: 5,
          line: 5,
          messageId: 'unused',
        },
      ],
      output: `
function test({
  a,
}: {
  [i: \`a\${string}\`]: string;
}) {}
      `,
    },
    // default values
    {
      code: `
function test({
  used: { nested } = {},
}: {
  used?: { nested?: number; unused?: number };
}) {}
      `,
      errors: [
        {
          column: 29,
          data: { key: 'unused', type: 'property' },
          endColumn: 44,
          endLine: 5,
          line: 5,
          messageId: 'unused',
        },
      ],
      output: `
function test({
  used: { nested } = {},
}: {
  used?: { nested?: number;  };
}) {}
      `,
    },
    // named and optional tuple members
    {
      code: 'function test([first]: [first: string, second: number]) {}',
      errors: [
        {
          column: 40,
          data: { key: '1', type: 'element' },
          endColumn: 54,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([first]: [first: string, ]) {}',
    },
    {
      code: 'function test([{ used }]: [first: { used: string; unused: string }]) {}',
      errors: [
        {
          column: 51,
          data: { key: 'unused', type: 'property' },
          endColumn: 65,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([{ used }]: [first: { used: string;  }]) {}',
    },
    {
      code: `
function test([{ used } = { used: '', unused: '' }]: [
  { used: string; unused: string }?,
]) {}
      `,
      errors: [
        {
          column: 19,
          data: { key: 'unused', type: 'property' },
          endColumn: 33,
          endLine: 3,
          line: 3,
          messageId: 'unused',
        },
      ],
      output: `
function test([{ used } = { used: '', unused: '' }]: [
  { used: string;  }?,
]) {}
      `,
    },
    // object patterns on tuples
    {
      code: 'function test({ 1: a }: [string, number, boolean]) {}',
      errors: [
        {
          column: 26,
          data: { key: '0', type: 'element' },
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
        {
          column: 42,
          data: { key: '2', type: 'element' },
          endColumn: 49,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: null,
    },
    {
      code: 'function test({ 0: a }: [string, number, ...boolean[]]) {}',
      errors: [
        {
          column: 34,
          data: { key: '1', type: 'element' },
          endColumn: 40,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: null,
    },
    {
      code: 'function test({ 0: { used } }: [{ used: string; unused: number }]) {}',
      errors: [
        {
          column: 49,
          data: { key: 'unused', type: 'property' },
          endColumn: 63,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ 0: { used } }: [{ used: string;  }]) {}',
    },
    // Record
    {
      code: "function test({ used }: Record<'used' | 'unused', boolean>) {}",
      errors: [
        {
          column: 41,
          data: { key: 'unused', type: 'key' },
          endColumn: 49,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: "function test({ used }: Record<'used' , boolean>) {}",
    },
    {
      code: "function test({ used }: Record<'unused' | 'used', boolean>) {}",
      errors: [
        {
          column: 32,
          data: { key: 'unused', type: 'key' },
          endColumn: 40,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: "function test({ used }: Record< 'used', boolean>) {}",
    },
    {
      code: 'function test({ 1: used }: Record<1 | 2 | 3, boolean>) {}',
      errors: [
        {
          column: 39,
          data: { key: '2', type: 'key' },
          endColumn: 40,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
        {
          column: 43,
          data: { key: '3', type: 'key' },
          endColumn: 44,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: [
        'function test({ 1: used }: Record<1 |  3, boolean>) {}',
        'function test({ 1: used }: Record<1 , boolean>) {}',
      ],
    },
    {
      code: "function test({}: Record<'a' | 'b', boolean>) {}",
      errors: [
        {
          column: 26,
          data: { key: 'a', type: 'key' },
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
        {
          column: 32,
          data: { key: 'b', type: 'key' },
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: null,
    },
    {
      code: `
declare const key: 'a' | 'b';

function test({ [key]: value }: Record<'a' | 'b' | 'c', boolean>) {}
      `,
      errors: [
        {
          column: 52,
          data: { key: 'c', type: 'key' },
          endColumn: 55,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
declare const key: 'a' | 'b';

function test({ [key]: value }: Record<'a' | 'b' , boolean>) {}
      `,
    },
    // signatures constrained by other declarations
    {
      code: `
function test(options: { used: string }): void;
function test(options: { used: string; unused: number }): void;
function test({ used }: { used: string; unused?: number }) {}
      `,
      errors: [
        {
          column: 41,
          data: { key: 'unused', type: 'property' },
          endColumn: 56,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
function test(options: { used: string }): void;
function test(options: { used: string; unused: number }): void;
function test({ used }: { used: string;  }) {}
      `,
    },
    {
      code: `
declare function on(
  callback: (event: { used: string; unused: string }) => void,
): void;

on(({ used }: { used: string; unused: string }) => {});
      `,
      errors: [
        {
          column: 31,
          data: { key: 'unused', type: 'property' },
          endColumn: 45,
          endLine: 6,
          line: 6,
          messageId: 'unused',
        },
      ],
      output: `
declare function on(
  callback: (event: { used: string; unused: string }) => void,
): void;

on(({ used }: { used: string;  }) => {});
      `,
    },
    {
      code: `
interface Handler {
  handle(event: { used: string; unused: string }): void;
}

class Test implements Handler {
  handle({ used }: { used: string; unused: string }) {}
}
      `,
      errors: [
        {
          column: 36,
          data: { key: 'unused', type: 'property' },
          endColumn: 50,
          endLine: 7,
          line: 7,
          messageId: 'unused',
        },
      ],
      output: `
interface Handler {
  handle(event: { used: string; unused: string }): void;
}

class Test implements Handler {
  handle({ used }: { used: string;  }) {}
}
      `,
    },
    {
      code: `
type Callback = (event: { used: string; unused: string }) => void;

const callback: Callback = ({ used }: { used: string; unused: string }) => {};
      `,
      errors: [
        {
          column: 55,
          data: { key: 'unused', type: 'property' },
          endColumn: 69,
          endLine: 4,
          line: 4,
          messageId: 'unused',
        },
      ],
      output: `
type Callback = (event: { used: string; unused: string }) => void;

const callback: Callback = ({ used }: { used: string;  }) => {};
      `,
    },
    // readonly tuples
    {
      code: 'function test([first]: readonly [string, number]) {}',
      errors: [
        {
          column: 42,
          data: { key: '1', type: 'element' },
          endColumn: 48,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([first]: readonly [string, ]) {}',
    },
    // other kinds of keys
    {
      code: `
enum Key {
  Used,
  Unused,
}

function test({ [Key.Used]: used }: { 0: string; 1: string }) {}
      `,
      errors: [
        {
          column: 50,
          data: { key: '1', type: 'property' },
          endColumn: 59,
          endLine: 7,
          line: 7,
          messageId: 'unused',
        },
      ],
      output: `
enum Key {
  Used,
  Unused,
}

function test({ [Key.Used]: used }: { 0: string;  }) {}
      `,
    },
    {
      code: "function test({ used }: { used: string; 'un-used': string }) {}",
      errors: [
        {
          column: 41,
          data: { key: 'un-used', type: 'property' },
          endColumn: 58,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ used }: { used: string;  }) {}',
    },
    {
      code: "function test({ used }: { ['used'](): void; ['unused']: string }) {}",
      errors: [
        {
          column: 45,
          data: { key: 'unused', type: 'property' },
          endColumn: 63,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: "function test({ used }: { ['used'](): void;  }) {}",
    },
    {
      code: 'function test({ used }: { used: string; get unused(): string }) {}',
      errors: [
        {
          column: 41,
          data: { key: 'unused', type: 'property' },
          endColumn: 61,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ used }: { used: string;  }) {}',
    },
    // different kinds of implementations
    {
      code: `
class Test {
  set value({ used }: { used: string; unused: string }) {}
}
      `,
      errors: [
        {
          column: 39,
          data: { key: 'unused', type: 'property' },
          endColumn: 53,
          endLine: 3,
          line: 3,
          messageId: 'unused',
        },
      ],
      output: `
class Test {
  set value({ used }: { used: string;  }) {}
}
      `,
    },
    {
      code: "function test({ used }: { used: string; unused: string } = { used: '' }) {}",
      errors: [
        {
          column: 41,
          data: { key: 'unused', type: 'property' },
          endColumn: 55,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: "function test({ used }: { used: string;  } = { used: '' }) {}",
    },
    // comments
    {
      code: `
function test({
  used,
}: {
  used: string;
  unused: string; // trailing
}) {}
      `,
      errors: [
        {
          column: 3,
          data: { key: 'unused', type: 'property' },
          endColumn: 18,
          endLine: 6,
          line: 6,
          messageId: 'unused',
        },
      ],
      output: `
function test({
  used,
}: {
  used: string;
   // trailing
}) {}
      `,
    },
    // unfixable removals
    {
      code: noFormat`function test([first]: [string, (number)]) {}`,
      errors: [
        {
          column: 34,
          data: { key: '1', type: 'element' },
          endColumn: 40,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: null,
    },
    {
      code: noFormat`function test({ used }: Record<'used' | ('unused'), string>) {}`,
      errors: [
        {
          column: 42,
          data: { key: 'unused', type: 'key' },
          endColumn: 50,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: null,
    },
    {
      code: 'function test([first]: [string, number /* comment */, boolean]) {}',
      errors: [
        {
          column: 33,
          data: { key: '1', type: 'element' },
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
        {
          column: 55,
          data: { key: '2', type: 'element' },
          endColumn: 62,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test([first]: [string, number /* comment */, ]) {}',
    },
    {
      code: "function test({ used }: Record<'used' | /* comment */ 'unused', string>) {}",
      errors: [
        {
          column: 55,
          data: { key: 'unused', type: 'key' },
          endColumn: 63,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: null,
    },
    {
      code: 'function test({ used }: { used: string; unused: string /* comment */ }) {}',
      errors: [
        {
          column: 41,
          data: { key: 'unused', type: 'property' },
          endColumn: 55,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ used }: { used: string;  /* comment */ }) {}',
    },
    {
      code: 'function test({ used }: { used: string; unused: /* comment */ string }) {}',
      errors: [
        {
          column: 41,
          data: { key: 'unused', type: 'property' },
          endColumn: 69,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: null,
    },
    // numeric keys on template literal index signatures
    {
      code: 'function test({ 1: used }: { [i: `${number}`]: 1; [j: string]: 1 }) {}',
      errors: [
        {
          column: 30,
          data: { key: '[`${number}`]', type: 'index signature' },
          endColumn: 50,
          endLine: 1,
          line: 1,
          messageId: 'unused',
        },
      ],
      output: 'function test({ 1: used }: {  [j: string]: 1 }) {}',
    },
    {
      code: `
function test({
  used,
}: {
  used: string;
  /** Documents the unused property. */
  unused: string;
}) {}
      `,
      errors: [
        {
          column: 3,
          data: { key: 'unused', type: 'property' },
          endColumn: 18,
          endLine: 7,
          line: 7,
          messageId: 'unused',
        },
      ],
      output: null,
    },
  ],
});
