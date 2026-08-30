import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-redundant-default-arguments';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-redundant-default-arguments', rule, {
  valid: [
    `
function foo(value = 0) {}
foo();
    `,
    `
function foo(value = 0) {}
foo(1);
    `,
    `
const zero = 0;
function foo(value = 0) {}
foo(zero);
    `,
    `
const DEFAULT_VALUE = 5;
function foo(value = DEFAULT_VALUE) {}
foo(5);
    `,
    `
function foo(value = 0, other = 1) {}
foo(0, 2);
    `,
    `
declare const values: [number];
function foo(first: number, value = 20) {}
foo(...values, 20);
    `,
    `
declare const values: number[];
function foo(value = 20, ...rest: number[]) {}
foo(20, ...values);
    `,
    `
declare const values: [unknown];
function foo(first: unknown, { value = 5 }) {}
foo(...values, { value: 5 });
    `,
    `
function foo(value: number) {}
foo(0);
    `,
    `
const object = {
  foo(value = 0) {},
};
object.foo(0);
    `,
    `
let foo = (value = 0) => {};
foo(0);
    `,
    `
function foo(value = 0) {}
function bar(value = 1) {}
foo = bar;
foo(0);
    `,
    `
function foo(value = 1) {}
function outer() {
  function foo(value = 0) {}
  foo(1);
}
    `,
    `
function foo({ value = 0 }) {}
foo({ value: 1 });
    `,
    `
const value = 0;
function foo({ value = 0 }) {}
foo({ value });
    `,
    `
declare const other: object;
function foo({ value = 0 }) {}
foo({ value: 0, ...other });
    `,
    `
declare const other: object;
function foo({ value = 0 }) {}
foo({ ...other, value: 0 });
    `,
    `
function foo(value = -0) {}
foo(0);
    `,
    `
function foo(value: number): void;
function foo(value = 0): void {}
foo(0);
    `,
    `
const foo: (value?: number) => void = (value = 0) => {};
foo(0);
    `,
    `
function foo(value = 0) {}
foo(undefined);
    `,
    `
function foo(value = NaN) {}
foo(NaN);
    `,
    `
function foo(value: number | string = 5) {}
foo('5');
    `,
    `
function foo(a = 1, b = 2) {}
foo(1, 3);
    `,
    `
class C {
  foo(value = 0) {}
}
new C().foo(0);
    `,
    `
function foo(value = \`a\${1}b\`) {}
foo('a1b');
    `,
    `
function foo(value = /a/) {}
foo(/a/);
    `,
    `
enum E {
  A,
}
function foo(value = E.A) {}
foo(E.A);
    `,
    `
function foo(value = 1n) {}
foo(2n);
    `,
    `
function foo(value = 1) {}
foo(/a/);
    `,
    `
function foo(value = 'a1b') {}
foo(\`a\${1}b\`);
    `,
    `
function foo(value = 1) {}
foo(~1);
    `,
    `
function foo(value = 1) {}
foo(-'a');
    `,
    `
function foo(value = -'a') {}
foo(1);
    `,
    `
const key = 'value';
function foo({ [key]: renamed = 1 }) {}
foo({ value: 1 });
    `,
    `
const d = 1;
function foo({ value = d }) {}
foo({ value: 1 });
    `,
    `
function foo({ value = 5 }) {}
foo({
  get value() {
    return 5;
  },
});
    `,
    `
const key = 'value';
function foo({ value = 1 }) {}
foo({ [key]: 1 });
    `,
    `
function foo({ value = 1 }) {}
foo({ other: 1 });
    `,
    `
function foo({ value = 1, ...rest }) {}
foo({ value: 2 });
    `,
    {
      code: '<Foo value={5} />;',
      filename: 'react.tsx',
    },
    {
      code: `
function Foo({ value = 5 }) {
  return null;
}
<Foo ns:value={5} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
function Foo({ value = 5 }) {
  return null;
}
<Foo other={1} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: noFormat`function Foo({ value = 5 }) { return null; } <Foo value=<div /> />;`,
      filename: 'react.tsx',
    },
    {
      code: `
function Foo({ value = 5 }) {
  return null;
}
<Foo value={6} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
const dynamic = 5;
function Foo({ value = 5 }) {
  return null;
}
<Foo value={dynamic} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
declare const props: object;
function Foo({ value = 5 }) {
  return null;
}
<Foo value={5} {...props} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
declare const props: object;
function Foo({ value = 5 }) {
  return null;
}
<Foo {...props} value={5} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
function div({ value = 5 }) {
  return null;
}
<div value={5} />;
      `,
      filename: 'react.tsx',
    },
    {
      code: `
function Foo({ value = 5 }) {
  return null;
}
<Foo value="5" />;
      `,
      filename: 'react.tsx',
    },
  ],
  invalid: [
    {
      code: `
function foo(value = 20) {}
foo(20);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '20' },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(value = 20) {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
foo(0);
function foo(value = 0) {}
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '0' },
          endColumn: 6,
          endLine: 2,
          line: 2,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
foo();
function foo(value = 0) {}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const foo = (value = 'all') => {};
foo('all');
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '"all"' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
const foo = (value = 'all') => {};
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const foo = function (value = false) {};
foo(false);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: 'false' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
const foo = function (value = false) {};
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(enabled = false, mode = 'all') {}
foo(false, 'all');
      `,
      errors: [
        {
          column: 5,
          data: { name: 'enabled', value: 'false' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(enabled = false, mode = 'all') {}
foo();
      `,
            },
          ],
        },
        {
          column: 12,
          data: { name: 'mode', value: '"all"' },
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(enabled = false, mode = 'all') {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(first = false, second = true) {}
foo(false, /* keep */ true);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'first', value: 'false' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
        },
        {
          column: 23,
          data: { name: 'second', value: 'true' },
          endColumn: 27,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
        },
      ],
    },
    {
      code: `
function foo(value = -1) {}
foo(-1);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '-1' },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(value = -1) {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(value = 10n) {}
foo(10n);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '10n' },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(value = 10n) {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
const foo = (value = 5 as const) => {};
foo(5 as const);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '5' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
const foo = (value = 5 as const) => {};
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(value = \`all\`) {}
foo('all');
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '"all"' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(value = \`all\`) {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo({ value = 5 }) {}
foo({ value: 5 });
      `,
      errors: [
        {
          column: 7,
          data: { name: 'value', value: '5' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeProperty',
              output: `
function foo({ value = 5 }) {}
foo({});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo({ value: renamed = 5 }) {}
foo({ value: 5 });
      `,
      errors: [
        {
          column: 7,
          data: { name: 'value', value: '5' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeProperty',
              output: `
function foo({ value: renamed = 5 }) {}
foo({});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
declare const values: number[];
function foo({ value = 5 }, ...rest: number[]) {}
foo({ value: 5 }, ...values);
      `,
      errors: [
        {
          column: 7,
          data: { name: 'value', value: '5' },
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeProperty',
              output: `
declare const values: number[];
function foo({ value = 5 }, ...rest: number[]) {}
foo({}, ...values);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo({ first = 1, second = 2 }) {}
foo({ first: 1, second: 2 });
      `,
      errors: [
        {
          column: 7,
          data: { name: 'first', value: '1' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeProperty',
              output: `
function foo({ first = 1, second = 2 }) {}
foo({ second: 2 });
      `,
            },
          ],
        },
        {
          column: 17,
          data: { name: 'second', value: '2' },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeProperty',
              output: `
function foo({ first = 1, second = 2 }) {}
foo({ first: 1 });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(a = 1, b = 2) {}
foo(2, 2);
      `,
      errors: [
        {
          column: 8,
          data: { name: 'b', value: '2' },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(a = 1, b = 2) {}
foo(2);
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo({ 'a-b': value = 1 }) {}
foo({ 'a-b': 1 });
      `,
      errors: [
        {
          column: 7,
          data: { name: 'a-b', value: '1' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeProperty',
              output: `
function foo({ 'a-b': value = 1 }) {}
foo({});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(value = 1) {}
foo(+1);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '1' },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(value = 1) {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(value = +1) {}
foo(1);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '1' },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(value = +1) {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(value = 1_000n) {}
foo(1000n);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '1000n' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(value = 1_000n) {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(value: number | null = null) {}
foo(null);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: 'null' },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(value: number | null = null) {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo({ 1: one = 2 }) {}
foo({ 1: 2 });
      `,
      errors: [
        {
          column: 7,
          data: { name: '1', value: '2' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeProperty',
              output: `
function foo({ 1: one = 2 }) {}
foo({});
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(value = 'all') {}
foo(\`all\`);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '"all"' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(value = 'all') {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(value = -1n) {}
foo(-1n);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '-1n' },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(value = -1n) {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(value = -0) {}
foo(-0);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '-0' },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(value = -0) {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function foo(this: void, value = 1) {}
foo(1);
      `,
      errors: [
        {
          column: 5,
          data: { name: 'value', value: '1' },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function foo(this: void, value = 1) {}
foo();
      `,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`const foo = ((value = 1) => {}); foo(1);`,
      errors: [
        {
          column: 38,
          data: { name: 'value', value: '1' },
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: 'const foo = ((value = 1) => {}); foo();',
            },
          ],
        },
      ],
    },
    {
      code: `
function foo({ value = 5 }) {}
foo({ value: /* keep */ 5 });
      `,
      errors: [
        {
          column: 7,
          data: { name: 'value', value: '5' },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
        },
      ],
    },
    {
      code: `
function foo({ value = 5 }) {}
foo({ value: 1, value: 5 });
      `,
      errors: [
        {
          column: 17,
          data: { name: 'value', value: '5' },
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeProperty',
              output: `
function foo({ value = 5 }) {}
foo({ value: 1 });
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
function Foo({ value = 5 }) {
  return null;
}
<Foo value={5 /* keep */} />;
      `,
      errors: [
        {
          column: 6,
          data: { name: 'value', value: '5' },
          endColumn: 26,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefault',
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
function Foo({ value = 5 }) {
  return null;
}
<Foo value={6} value={5} />;
      `,
      errors: [
        {
          column: 16,
          data: { name: 'value', value: '5' },
          endColumn: 25,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeAttribute',
              output: `
function Foo({ value = 5 }) {
  return null;
}
<Foo value={6} />;
      `,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: noFormat`function foo(value = 1) {} foo((1));`,
      errors: [
        {
          column: 33,
          data: { name: 'value', value: '1' },
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: 'function foo(value = 1) {} foo();',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`function foo(a: number, b = 2) {} foo((1), 2);`,
      errors: [
        {
          column: 44,
          data: { name: 'b', value: '2' },
          endColumn: 45,
          endLine: 1,
          line: 1,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: 'function foo(a: number, b = 2) {} foo((1));',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`function foo(value = 1) {} foo(1,);`,
      errors: [
        {
          column: 32,
          data: { name: 'value', value: '1' },
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: 'function foo(value = 1) {} foo();',
            },
          ],
        },
      ],
    },
    {
      code: `
function Foo({ value = 5 }) {
  return null;
}
<Foo value={5} />;
      `,
      errors: [
        {
          column: 6,
          data: { name: 'value', value: '5' },
          endColumn: 15,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeAttribute',
              output: `
function Foo({ value = 5 }) {
  return null;
}
<Foo />;
      `,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
const Foo = ({ label = 'hello' }) => null;
<Foo label="hello" />;
      `,
      errors: [
        {
          column: 6,
          data: { name: 'label', value: '"hello"' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeAttribute',
              output: `
const Foo = ({ label = 'hello' }) => null;
<Foo />;
      `,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
function Foo({ enabled = true }) {
  return null;
}
<Foo enabled />;
      `,
      errors: [
        {
          column: 6,
          data: { name: 'enabled', value: 'true' },
          endColumn: 13,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeAttribute',
              output: `
function Foo({ enabled = true }) {
  return null;
}
<Foo />;
      `,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
function Foo({ value = 5 } = {}) {
  return null;
}
<Foo value={5} />;
      `,
      errors: [
        {
          column: 6,
          data: { name: 'value', value: '5' },
          endColumn: 15,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeAttribute',
              output: `
function Foo({ value = 5 } = {}) {
  return null;
}
<Foo />;
      `,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
    {
      code: `
function Foo({ first = 1, second = 2 }) {
  return null;
}
<Foo first={1} second={2} />;
      `,
      errors: [
        {
          column: 6,
          data: { name: 'first', value: '1' },
          endColumn: 15,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeAttribute',
              output: `
function Foo({ first = 1, second = 2 }) {
  return null;
}
<Foo second={2} />;
      `,
            },
          ],
        },
        {
          column: 16,
          data: { name: 'second', value: '2' },
          endColumn: 26,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefault',
          suggestions: [
            {
              messageId: 'removeAttribute',
              output: `
function Foo({ first = 1, second = 2 }) {
  return null;
}
<Foo first={1} />;
      `,
            },
          ],
        },
      ],
      filename: 'react.tsx',
    },
  ],
});
