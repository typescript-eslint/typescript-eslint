import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unused-destructure-elements';
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

ruleTester.run('no-unused-destructure-elements', rule, {
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
    // non-function-parameters destructuring
    `
declare const obj: unknown;
const { used1, used2 }: { used1: string; used2: string } = obj;
    `,
    `
declare const obj: unknown;
const { hello: used1, world: used2 }: { hello: string; world: string } = obj;
    `,
    // skipping a tuple item
    'function test([, used]: [boolean, number]) {}',
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
    'function test({ used }: { [i: `_${string}`] }) {}',
    'function test({ hello: used }: { [b] }) {}',
    'function test({ hello: used }: { [i: string, j: number]: string }) {}',
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
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output: 'function test({}: {  }) {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function test({}: { 1: boolean }) {}',
      errors: [
        {
          column: 21,
          data: { key: '1', type: 'property' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '1', type: 'property' },
              messageId: 'removeUnusedKey',
              output: 'function test({}: {  }) {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function test({ used }: { unused: boolean; used: boolean }) {}',
      errors: [
        {
          column: 27,
          data: { key: 'unused', type: 'property' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output: 'function test({ used }: {  used: boolean }) {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function test([]: [boolean]) {}',
      errors: [
        {
          column: 20,
          data: { key: '0', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '0', type: 'key' },
              messageId: 'removeUnusedKey',
              output: 'function test([]: []) {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function test([a]: [boolean, number]) {}',
      errors: [
        {
          column: 30,
          data: { key: '1', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '1', type: 'key' },
              messageId: 'removeUnusedKey',
              output: 'function test([a]: [boolean, ]) {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function test([a]: [boolean, number, string]) {}',
      errors: [
        {
          column: 30,
          data: { key: '1', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '1', type: 'key' },
              messageId: 'removeUnusedKey',
              output: 'function test([a]: [boolean,  string]) {}',
            },
          ],
        },
        {
          column: 38,
          data: { key: '2', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '2', type: 'key' },
              messageId: 'removeUnusedKey',
              output: 'function test([a]: [boolean, number, ]) {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function test([{ used }]: [{ used: string; unused: number }, number]) {}',
      errors: [
        {
          column: 44,
          data: { key: 'unused', type: 'property' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output:
                'function test([{ used }]: [{ used: string;  }, number]) {}',
            },
          ],
        },
        {
          column: 62,
          data: { key: '1', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '1', type: 'key' },
              messageId: 'removeUnusedKey',
              output:
                'function test([{ used }]: [{ used: string; unused: number }, ]) {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function test([[used]]: [[string, number], number]) {}',
      errors: [
        {
          column: 35,
          data: { key: '1', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '1', type: 'key' },
              messageId: 'removeUnusedKey',
              output: 'function test([[used]]: [[string, ], number]) {}',
            },
          ],
        },
        {
          column: 44,
          data: { key: '1', type: 'key' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '1', type: 'key' },
              messageId: 'removeUnusedKey',
              output: 'function test([[used]]: [[string, number], ]) {}',
            },
          ],
        },
      ],
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
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output:
                "function test({ ['used']: renamed }: {  used: boolean }) {}",
            },
          ],
        },
      ],
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
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
function test({
  [Symbol.iterator]: renamed,
}: {
\u0020\u0020
  [Symbol.iterator]: boolean;
}) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: 'function test({ [1]: renamed }: { unused: boolean; 1: boolean }) {}',
      errors: [
        {
          column: 35,
          data: { key: 'unused', type: 'property' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output: 'function test({ [1]: renamed }: {  1: boolean }) {}',
            },
          ],
        },
      ],
    },
    // index signatures
    {
      code: `
        function test({}: { [i: string]: boolean }) {}
      `,
      errors: [
        {
          column: 29,
          data: { key: '[string]', type: 'index signature' },
          line: 2,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '[string]', type: 'index signature' },
              messageId: 'removeUnusedKey',
              output: `
        function test({}: {  }) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        function test({}: { [i: string | number]: boolean }) {}
      `,
      errors: [
        {
          column: 29,
          data: { key: '[string | number]', type: 'index signature' },
          line: 2,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '[string | number]', type: 'index signature' },
              messageId: 'removeUnusedKey',
              output: `
        function test({}: {  }) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        function test({ used }: { used: boolean; [i: string]: boolean }) {}
      `,
      errors: [
        {
          column: 50,
          data: { key: '[string]', type: 'index signature' },
          line: 2,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '[string]', type: 'index signature' },
              messageId: 'removeUnusedKey',
              output: `
        function test({ used }: { used: boolean;  }) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        function test({ used }: { [i: number]: boolean; [i: string]: boolean }) {}
      `,
      errors: [
        {
          column: 35,
          data: { key: '[number]', type: 'index signature' },
          line: 2,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '[number]', type: 'index signature' },
              messageId: 'removeUnusedKey',
              output: `
        function test({ used }: {  [i: string]: boolean }) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        function test({ 1: used }: { [i: number]: boolean; [i: string]: boolean }) {}
      `,
      errors: [
        {
          column: 60,
          data: { key: '[string]', type: 'index signature' },
          line: 2,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '[string]', type: 'index signature' },
              messageId: 'removeUnusedKey',
              output: `
        function test({ 1: used }: { [i: number]: boolean;  }) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        function test({ used }: { unused: string; [i: string]: boolean }) {}
      `,
      errors: [
        {
          column: 35,
          data: { key: 'unused', type: 'property' },
          line: 2,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
        function test({ used }: {  [i: string]: boolean }) {}
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              data: { key: '[number]', type: 'index signature' },
              messageId: 'removeUnusedKey',
              output: `
function test({
  used,
}: {
  used: boolean;
\u0020\u0020
  [i: string]: boolean;
}) {}
      `,
            },
          ],
        },
        {
          column: 3,
          data: { key: '[string]', type: 'index signature' },
          line: 7,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '[string]', type: 'index signature' },
              messageId: 'removeUnusedKey',
              output: `
function test({
  used,
}: {
  used: boolean;
  [i: number]: boolean;
\u0020\u0020
}) {}
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const s: 1;

function test({ [s]: used }: { [i: number]: string;  }) {}
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const s: 1;

function test({ [s]: used }: {  1: string; 2: string }) {}
      `,
            },
          ],
        },
        {
          column: 59,
          data: { key: '2', type: 'property' },
          line: 4,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '2', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const s: 1;

function test({ [s]: used }: { unused: string; 1: string;  }) {}
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const s: 1 | 2;

function test({ [s]: used }: {  1: string; 2: string }) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const s: 'used' | 'unexisting';

function test({ [s]: used }: { used: string; unused: number }) {}
      `,
      errors: [
        {
          column: 46,
          data: { key: 'unused', type: 'property' },
          line: 4,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const s: 'used' | 'unexisting';

function test({ [s]: used }: { used: string;  }) {}
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const s: 'used1' | 'used2' | 'used3';

function test({
  [s]: used,
}: {
  used1: string;
  used2: boolean;
  used3: number;
\u0020\u0020
}) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const s: 'used1' | 'used2' | 'used3';

function test({
  [s]: { [s]: used },
}: {
  used1: {
    used2: boolean;
    used3: number;
    unused: number;
  };
}) {}
      `,
      errors: [
        {
          column: 5,
          data: { key: 'unused', type: 'property' },
          line: 10,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const s: 'used1' | 'used2' | 'used3';

function test({
  [s]: { [s]: used },
}: {
  used1: {
    used2: boolean;
    used3: number;
\u0020\u0020\u0020\u0020
  };
}) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const s: string;

function test({ [s]: used }: { hello: string; world: number; 3: boolean }) {}
      `,
      errors: [
        {
          column: 62,
          data: { key: '3', type: 'property' },
          line: 4,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: '3', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const s: string;

function test({ [s]: used }: { hello: string; world: number;  }) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const s: number;

function test({ [s]: used }: { hello: string; 2: number; 3: boolean }) {}
      `,
      errors: [
        {
          column: 32,
          data: { key: 'hello', type: 'property' },
          line: 4,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: 'hello', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const s: number;

function test({ [s]: used }: {  2: number; 3: boolean }) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const s: number | string;

function test({
  [s]: used,
}: {
  hello: string;
  2: number;
  [Symbol.iterator]: string;
}) {}
      `,
      errors: [
        {
          column: 3,
          data: { key: 'Symbol(Symbol.iterator)', type: 'property' },
          line: 9,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: 'Symbol(Symbol.iterator)', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const s: number | string;

function test({
  [s]: used,
}: {
  hello: string;
  2: number;
\u0020\u0020
}) {}
      `,
            },
          ],
        },
      ],
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
          suggestions: [
            {
              data: { key: '[`_${string}`]', type: 'index signature' },
              messageId: 'removeUnusedKey',
              output: 'function test({ used }: { used: string;  }) {}',
            },
          ],
        },
      ],
    },
    {
      code: 'function test({ _used }: { unused: string; [i: `_${string}`]: string }) {}',
      errors: [
        {
          column: 28,
          data: { key: 'unused', type: 'property' },
          line: 1,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: 'unused', type: 'property' },
              messageId: 'removeUnusedKey',
              output:
                'function test({ _used }: {  [i: `_${string}`]: string }) {}',
            },
          ],
        },
      ],
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
          suggestions: [
            {
              data: { key: 'three', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const s: \`_\${'one' | 'two'}\`;

function test({ [s]: used }: { _one: string; _two: number;  }) {}
      `,
            },
          ],
        },
      ],
    },
    // non-function-parameters destructuring
    {
      code: `
declare const obj: unknown;

const { hello }: { hello: string; world: string } = obj;
      `,
      errors: [
        {
          column: 35,
          data: { key: 'world', type: 'property' },
          line: 4,
          messageId: 'partialDestructuring',
          suggestions: [
            {
              data: { key: 'world', type: 'property' },
              messageId: 'removeUnusedKey',
              output: `
declare const obj: unknown;

const { hello }: { hello: string;  } = obj;
      `,
            },
          ],
        },
      ],
    },
  ],
});
