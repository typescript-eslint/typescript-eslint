import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-partial-destructuring';
import { getFixturesRootDir } from '../RuleTester';

const emptyline = '';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('no-partial-destructuring', rule, {
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
const symol = Symbol.for('symbol');

function test({ [symol]: used }: { [symol]: string }) {}
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
    {
      code: `
function test({ _used }: { [i: \`_\${string}\`]: string }) {}
      `,
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
    },
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
    'function test({ 1: a }: [string, number, boolean]) {}',
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
  ],
  invalid: [
    // non-exhaustive destructuring
    {
      code: 'function test({}: { unused: boolean }) {}',
      errors: [
        {
          column: 21,
          data: { key: 'unused', type: 'property' },
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
        },
      ],
      output: 'function test({ used }: {  used: boolean }) {}',
    },
    {
      code: 'function test([]: [boolean]) {}',
      errors: [
        {
          column: 20,
          data: { key: '0', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
        },
      ],
      output: 'function test([]: []) {}',
    },
    {
      code: 'function test([a]: [boolean, number]) {}',
      errors: [
        {
          column: 30,
          data: { key: '1', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
        },
      ],
      output: 'function test([a]: [boolean, ]) {}',
    },
    {
      code: 'function test([a]: [boolean, number, string]) {}',
      errors: [
        {
          column: 30,
          data: { key: '1', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
        },
        {
          column: 38,
          data: { key: '2', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
        },
        {
          column: 62,
          data: { key: '1', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
        },
      ],
      output: 'function test([{ used }]: [{ used: string;  }, ]) {}',
    },
    {
      code: 'function test([[used]]: [[string, number], number]) {}',
      errors: [
        {
          column: 35,
          data: { key: '1', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
        },
        {
          column: 44,
          data: { key: '1', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 5,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
function test({
  [Symbol.iterator]: renamed,
}: {
  ${emptyline}
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
          data: { key: 'Symbol(Symbol.iterator)', type: 'property' },
          line: 2,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
function test({ used }: { used: boolean;  }) {}
      `,
    },
    {
      code: `
const symol = Symbol.for('symbol');

function test({ [symol]: renamed }: { unused: boolean; [symol]: boolean }) {}
      `,
      errors: [
        {
          column: 39,
          data: { key: 'unused', type: 'property' },
          line: 4,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
const symol = Symbol.for('symbol');

function test({ [symol]: renamed }: {  [symol]: boolean }) {}
      `,
    },
    {
      code: `
const symol = Symbol.for('symbol');

function test({ used }: { used: boolean; [symol]: boolean }) {}
      `,
      errors: [
        {
          column: 42,
          data: { key: 'Symbol(symbol)', type: 'property' },
          line: 4,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
const symol = Symbol.for('symbol');

function test({ used }: { used: boolean;  }) {}
      `,
    },
    {
      code: 'function test({ [1]: renamed }: { unused: boolean; 1: boolean }) {}',
      errors: [
        {
          column: 35,
          data: { key: 'unused', type: 'property' },
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
        },
      ],
      output: 'function test({ used }: {  [i: string]: boolean }) {}',
    },
    {
      code: `
function test({
  used,
}: {
  used: boolean;
  [i: number]: boolean;
  [i: string]: boolean;
}) {}
      `,
      errors: [
        {
          column: 3,
          data: { key: '[number]', type: 'index signature' },
          line: 6,
          messageId: 'partialDestructuring',
        },
        {
          column: 3,
          data: { key: '[string]', type: 'index signature' },
          line: 7,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
function test({
  used,
}: {
  used: boolean;
  ${emptyline}
  ${emptyline}
}) {}
      `,
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
          line: 4,
          messageId: 'partialDestructuring',
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
          line: 4,
          messageId: 'partialDestructuring',
        },
        {
          column: 59,
          data: { key: '2', type: 'property' },
          line: 4,
          messageId: 'partialDestructuring',
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
          line: 4,
          messageId: 'partialDestructuring',
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
          line: 4,
          messageId: 'partialDestructuring',
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
          line: 10,
          messageId: 'partialDestructuring',
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
  ${emptyline}
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
          line: 11,
          messageId: 'partialDestructuring',
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
    ${emptyline}
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
          line: 4,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
declare const s: 2 | 3;

function test({ [s]: used }: {  2: number; 3: boolean }) {}
      `,
    },
    {
      code: `
const m = Symbol.for('static');

declare const s: 'hello' | typeof m;

function test({ [s]: used }: { hello: string; 2: number; [m]: string }) {}
      `,
      errors: [
        {
          column: 47,
          data: { key: '2', type: 'property' },
          line: 6,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
const m = Symbol.for('static');

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
  2: number;
  [Symbol.iterator]: { world: boolean };
}) {}
      `,
      errors: [
        {
          column: 27,
          data: { key: 'unused', type: 'property' },
          line: 7,
          messageId: 'partialDestructuring',
        },
        {
          column: 3,
          data: { key: '2', type: 'property' },
          line: 8,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
declare const s: 'hello' | typeof Symbol.iterator;

function test({
  [s]: { world: used },
}: {
  hello: { world: number;  };
  ${emptyline}
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 4,
          messageId: 'partialDestructuring',
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
          line: 9,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
declare const a: \`b\${string}\`;

function test({
  [a]: used,
}: {
  [j: string]: string;
  [i: \`b\${string}\`]: string;
  ${emptyline}
}) {}
      `,
    },
    {
      code: 'function test({ _used }: { unused: string; [i: `_${string}`]: string }) {}',
      errors: [
        {
          column: 28,
          data: { key: 'unused', type: 'property' },
          line: 1,
          messageId: 'partialDestructuring',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
      output: 'function test({ _used }: {  [i: `_${string}`]: string }) {}',
    },
    {
      code: 'function test({ used }: { used: string; [i: `_${string}`]: number | string }) {}',
      errors: [
        {
          column: 41,
          data: { key: '[`_${string}`]', type: 'index signature' },
          line: 1,
          messageId: 'partialDestructuring',
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.noUncheckedIndexedAccess.json',
          projectService: false,
          tsconfigRootDir: rootDir,
        },
      },
      output: 'function test({ used }: { used: string;  }) {}',
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
          line: 4,
          messageId: 'partialDestructuring',
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
          line: 4,
          messageId: 'partialDestructuring',
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
          line: 3,
          messageId: 'partialDestructuring',
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
          line: 3,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          data: { key: '2', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
        },
      ],
      output: 'function test([, a]: [string, number, ]) {}',
    },
    {
      code: 'function test([a, , b]: [string, number, boolean, string]) {}',
      errors: [
        {
          column: 51,
          data: { key: '3', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
        },
      ],
      output: 'function test([a, , b]: [string, number, boolean, ]) {}',
    },
    {
      code: 'function test([a, , b, , ,]: [string, number, boolean, string]) {}',
      errors: [
        {
          column: 56,
          data: { key: '3', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 6,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
function test<R extends string>({
  1: a,
}: {
  [i: number]: number;
  ${emptyline}
}) {}
      `,
    },
    {
      code: 'function test<R>({ a }: { [i: string]: number; [i: `_${string}_`]: R }) {}',
      errors: [
        {
          column: 48,
          data: { key: '[`_${string}_`]', type: 'index signature' },
          line: 1,
          messageId: 'partialDestructuring',
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
          line: 6,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
function test<R extends boolean>({
  a,
}: {
  [i: string]: number;
  ${emptyline}
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
          line: 6,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
function test<R extends boolean>({
  a,
}: {
  [i: string]: number;
  ${emptyline}
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
          line: 9,
          messageId: 'partialDestructuring',
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
    ${emptyline}
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
          data: { key: '1', type: 'key' },
          line: 2,
          messageId: 'partialDestructuring',
        },
        {
          column: 42,
          data: { key: '2', type: 'key' },
          line: 2,
          messageId: 'partialDestructuring',
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
          data: { key: '2', type: 'key' },
          line: 2,
          messageId: 'partialDestructuring',
        },
      ],
      output: `
function test([a, b]: [number, boolean, ]) {}
      `,
    },
  ],
});
