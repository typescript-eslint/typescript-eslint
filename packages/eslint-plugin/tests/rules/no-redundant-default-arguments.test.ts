import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-redundant-default-arguments';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-redundant-default-arguments', rule, {
  valid: [
    // A self-import must not hide an invalid local function reassignment.
    `
import { select as imported } from './file';
export function select(value = 0) {
  return value;
}
select = (value = 1) => value;
imported(0);
    `,
    `
function select({ toString = 0 }) {
  return toString;
}
select({ toString: 0 });
    `,
    `
namespace Functions {
  export function select(value = 0) {
    return value;
  }
}
Functions.select = (value = 1) => value;
import select = Functions.select;
select(0);
    `,
    {
      code: `
export {};
function select(value = 0) {
  return value;
}
const view = <div>{select(1)}</div>;
      `,
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    },
    // TypeScript error recovery must not expose implementation defaults as a valid call contract.
    `
function select(value: 1 = 0) {}
select(0);
    `,
    `
function select({ value = 0 }: { value?: 1 }) {}
select({ value: 0 });
    `,
    `
function select(value = 0) {}
select(0, 1);
    `,
    `
function select({ value = 0 }, required: number) {}
select({ value: 0 });
    `,
    `
declare const select: unknown;
select(0);
    `,
    `
import { select } from './missing-default-arguments-source';
select(0);
    `,
    `
function select({ value = 0 }) {}
select({ value: 0, value: 1 });
    `,
    `
function select({ value = 0, value: repeated = 1 }) {}
select({ value: 0 });
    `,
    `
function select(value = 0, other = arguments.length) {}
select(0, 1);
    `,
    `
import { select } from './no-redundant-default-arguments/ambient';
select(0);
    `,
    `
import { mutable } from './no-redundant-default-arguments/source';
mutable(0);
    `,
    `
import { conditional } from './no-redundant-default-arguments/source';
conditional(0);
    `,
    `
import * as source from './no-redundant-default-arguments/source';
source.select(0);
    `,
    `
function select(value = 0) {}
select(1);
    `,
    `
function select(value = 0) {
  return arguments.length;
}
select(0);
    `,
    `
let select = (value = 0) => value;
select = (value = 1) => value;
select(0);
    `,
    `
function select(value = 0) {}
select = (value = 1) => {};
select(0);
    `,
    `
function select<T>(value = 0) {}
select(0);
    `,
    `
function select({ value = 0 }: { value: number }) {}
select({ value: 0 });
    `,
    `
function select(value = 0) {}
select();
    `,
    `
function select(value: number) {}
select(0);
    `,
    `
function select(first = 0, second = 1) {}
select(0, 2);
    `,
    `
const select = (value = 0) => value;
const alias = select;
alias(0);
    `,
    `
const select: (value?: number) => number = (value = 0) => value;
select(0);
    `,
    `
const select: typeof original = (value = 0) => value;
function original(value = 0) {
  return value;
}
select(0);
    `,
    `
function select(value = 0) {}
function invoke(callback: typeof select) {
  callback(0);
}
    `,
    `
const select = (value = 0) => value;
function factory() {
  return select;
}
factory()(0);
    `,
    `
const object = { select(value = 0) {} };
object.select(0);
    `,
    `
class Base {
  select(value = 0) {}
}
class Child extends Base {
  override select(value = 1) {}
}
const object: Base = new Child();
object.select(0);
    `,
    `
const object = Math.random()
  ? { select(value = 0) {} }
  : { select(value = 1) {} };
object.select(0);
    `,
    `
function select(value = 0) {}
select?.(0);
    `,
    `
function select(value = 0) {}
select(...[0]);
    `,
    `
function select(value = 0, ...rest: number[]) {}
select(0);
    `,
    `
function select<T>() {
  function inner(value = 0) {}
  inner(0);
}
    `,
    `
class Container<T> {
  run() {
    function select(value = 0) {}
    select(0);
  }
}
    `,
    `
function select(value: number): number;
function select(): string;
function select(value = 0): number | string {
  return value;
}
select(0);
    `,
    `
function select<T = string>(value: T = '' as T): T {
  return value;
}
select('');
    `,
    `
function select<T extends { value?: number }>({ value = 0 }: T) {}
select({ value: 0 });
    `,
    `
function first(value = 0) {}
function second(value = 1) {}
declare const select: typeof first | typeof second;
select(0);
    `,
    `
function first(value = 0) {}
function second(value = 1) {}
declare const select: typeof first & typeof second;
select(0);
    `,
    `
declare function select(value?: number): void;
select(0);
    `,
    `
declare const select: any;
select(0);
    `,
    `
function select(value = -0) {}
select(0);
    `,
    `
function select(value = 0) {}
select(-0);
    `,
    `
function select(value = undefined) {}
select(undefined);
    `,
    `
function outer(undefined: number) {
  function select(value = undefined) {}
  select(undefined);
}
    `,
    `
function select(value = void 0) {}
select(void 0);
    `,
    `
const value = 0;
function select(input = value) {}
select(0);
    `,
    `
function select(value = 0) {}
select(0 as number);
    `,
    `
function select(value = 0) {}
select(0!);
    `,
    `
function select(value = 0) {}
select(0 satisfies number);
    `,
    `
function select(value = 0) {}
select(Number(0));
    `,
    `
function select(value = /pattern/) {}
select(/pattern/);
    `,
    `
function select(value = [0]) {}
select([0]);
    `,
    `
function select(value = {}) {}
select({});
    `,
    `
function select({ value = 0 }) {}
select({ value: 1 });
    `,
    `
function select({ value = 0 }) {}
select({ value: 0, ...{} });
    `,
    `
function select({ value = 0 }) {}
select({ ['value']: 0 });
    `,
    `
function select({ value = 0 }) {}
select({
  get value() {
    return 0;
  },
});
    `,
    `
function select({ value = 0 }) {}
const value = 0;
select({ value });
    `,
    `
function select({ ['value']: value = 0 }) {}
select({ value: 0 });
    `,
    `
function select({ 0: value = 0 }) {}
select({ 0: 0 });
    `,
    `
function select({ value: { inner = 0 } }) {}
select({ value: { inner: 0 } });
    `,
    `
function select({ value = 0, ...rest }) {}
select({ value: 0 });
    `,
    `
function select({ __proto__ = 0 }) {}
select({ __proto__: 0 });
    `,
    `
function select({
  value = 0,
}: { value?: number } | { value?: number; other?: string }) {}
select({ value: 0 });
    `,
    `
function select({ value = 0 }: { value?: number } & { other?: string }) {}
select({ value: 0 });
    `,
    `
function select({ value = 0 }: any) {}
select({ value: 0 });
    `,
    `
function select(value = 0) {
  return () => arguments.length;
}
select(0);
    `,
    `
function select(value = 0) {
  return eval('value');
}
select(0);
    `,
    `
function select(value = 0) {
  function nested() {
    return arguments.length;
  }
}
select(0);
    `,
    `
function select(value = 0) {
  const object = { eval: value };
}
select(0);
    `,
    `
const first = (value = 0) => value;
const second = (value = 1) => value;
const selected = Math.random() ? first : second;
selected(0);
    `,
  ],
  invalid: [
    {
      code: `
function select({ first = 0, middle = 1, last = 2 }) {}
select({ first: 3, middle: 1, last: 4 });
      `,
      errors: [
        {
          column: 20,
          data: { name: 'middle' },
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'redundantProperty',
          suggestions: [
            {
              data: { name: 'middle' },
              messageId: 'removeProperty',
              output: `
function select({ first = 0, middle = 1, last = 2 }) {}
select({ first: 3,  last: 4 });
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select({ value = 0, other = 1 }) {}
select({ value: 0 /* keep */, other: 2 });
      `,
      errors: [
        {
          column: 10,
          data: { name: 'value' },
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'redundantProperty',
          suggestions: [],
        },
      ],
      output: null,
    },
    {
      code: `
function select(first: number, second = 1) {}
select(0, /* keep */ 1);
      `,
      errors: [
        {
          column: 22,
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [],
        },
      ],
      output: null,
    },
    {
      code: `
function select({ value = 0 }, trailing = 1) {}
const value = 0;
select({ value }, 1);
      `,
      errors: [
        {
          column: 19,
          endColumn: 20,
          endLine: 4,
          line: 4,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select({ value = 0 }, trailing = 1) {}
const value = 0;
select({ value });
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
import {
  options,
  options as renamed,
} from './no-redundant-default-arguments/source';
options({ value: 0 });
renamed({ value: 0 });
      `,
      errors: [
        {
          column: 11,
          data: { name: 'value' },
          endColumn: 19,
          endLine: 6,
          line: 6,
          messageId: 'redundantProperty',
          suggestions: [
            {
              data: { name: 'value' },
              messageId: 'removeProperty',
              output: `
import {
  options,
  options as renamed,
} from './no-redundant-default-arguments/source';
options({  });
renamed({ value: 0 });
      `,
            },
          ],
        },
        {
          column: 11,
          data: { name: 'value' },
          endColumn: 19,
          endLine: 7,
          line: 7,
          messageId: 'redundantProperty',
          suggestions: [
            {
              data: { name: 'value' },
              messageId: 'removeProperty',
              output: `
import {
  options,
  options as renamed,
} from './no-redundant-default-arguments/source';
options({ value: 0 });
renamed({  });
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
import { arrow, select } from './no-redundant-default-arguments/source';
arrow(0);
select(0);
      `,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
import { arrow, select } from './no-redundant-default-arguments/source';
arrow();
select(0);
      `,
            },
          ],
        },
        {
          column: 8,
          endColumn: 9,
          endLine: 4,
          line: 4,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
import { arrow, select } from './no-redundant-default-arguments/source';
arrow(0);
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select({ value = 0, other = 1 }) {}
select({ value: 0, other: 1 });
      `,
      errors: [
        {
          column: 10,
          data: { name: 'value' },
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'redundantProperty',
          suggestions: [
            {
              data: { name: 'value' },
              messageId: 'removeProperty',
              output: `
function select({ value = 0, other = 1 }) {}
select({  other: 1 });
      `,
            },
          ],
        },
        {
          column: 20,
          data: { name: 'other' },
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'redundantProperty',
          suggestions: [
            {
              data: { name: 'other' },
              messageId: 'removeProperty',
              output: `
function select({ value = 0, other = 1 }) {}
select({ value: 0 });
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: noFormat`
function select(value = (0)) {}
select(0);
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = (0)) {}
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
const select = (value = 0) => value;
select(0);
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
const select = (value = 0) => value;
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
const select = function (value = 0) {
  return value;
};
select(0);
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 5,
          line: 5,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
const select = function (value = 0) {
  return value;
};
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: '(function (value = 0) {})(0);',
      errors: [
        {
          column: 27,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: '(function (value = 0) {})();',
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: '((value = 0) => value)(0);',
      errors: [
        {
          column: 24,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: '((value = 0) => value)();',
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
select(0);
function select(value = 0) {}
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 2,
          line: 2,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
select();
function select(value = 0) {}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(value = 1) {}
function outer() {
  function select(value = 0) {}
  select(0);
}
      `,
      errors: [
        {
          column: 10,
          endColumn: 11,
          endLine: 5,
          line: 5,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = 1) {}
function outer() {
  function select(value = 0) {}
  select();
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
import { select } from './no-redundant-default-arguments/source';
select(0);
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
import { select } from './no-redundant-default-arguments/source';
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
import select from './no-redundant-default-arguments/source';
select(0);
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
import select from './no-redundant-default-arguments/source';
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
import { forwarded } from './no-redundant-default-arguments/barrel';
forwarded(0);
      `,
      errors: [
        {
          column: 11,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
import { forwarded } from './no-redundant-default-arguments/barrel';
forwarded();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
import { arrow } from './no-redundant-default-arguments/source';
arrow(0);
      `,
      errors: [
        {
          column: 7,
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
import { arrow } from './no-redundant-default-arguments/source';
arrow();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
import { expression } from './no-redundant-default-arguments/source';
expression(0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
import { expression } from './no-redundant-default-arguments/source';
expression();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
import { options } from './no-redundant-default-arguments/source';
options({ value: 0 });
      `,
      errors: [
        {
          column: 11,
          data: { name: 'value' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'redundantProperty',
          suggestions: [
            {
              data: { name: 'value' },
              messageId: 'removeProperty',
              output: `
import { options } from './no-redundant-default-arguments/source';
options({  });
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(value = 0) {}
select(0);
function invoke(callback: typeof select) {
  callback(0);
}
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = 0) {}
select();
function invoke(callback: typeof select) {
  callback(0);
}
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(value = 0) {}
function invoke(callback: typeof select) {
  callback(0);
}
select(0);
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 6,
          line: 6,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = 0) {}
function invoke(callback: typeof select) {
  callback(0);
}
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select({ value: renamed = 0 }) {}
select({ value: 0 });
      `,
      errors: [
        {
          column: 10,
          data: { name: 'value' },
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'redundantProperty',
          suggestions: [
            {
              data: { name: 'value' },
              messageId: 'removeProperty',
              output: `
function select({ value: renamed = 0 }) {}
select({  });
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select({ value = 0, other = 1 }) {}
select({ value: 0, other: 2 });
      `,
      errors: [
        {
          column: 10,
          data: { name: 'value' },
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'redundantProperty',
          suggestions: [
            {
              data: { name: 'value' },
              messageId: 'removeProperty',
              output: `
function select({ value = 0, other = 1 }) {}
select({  other: 2 });
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select({ value = 0 }) {}
select({ value: /* keep */ 0 });
      `,
      errors: [
        {
          column: 10,
          data: { name: 'value' },
          endColumn: 29,
          endLine: 3,
          line: 3,
          messageId: 'redundantProperty',
          suggestions: [],
        },
      ],
      output: null,
    },
    {
      code: `
export {};
function select(value = 0) {
  return value;
}
const view = <div>{select(0)}</div>;
      `,
      errors: [
        {
          column: 27,
          endColumn: 28,
          endLine: 6,
          line: 6,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
export {};
function select(value = 0) {
  return value;
}
const view = <div>{select()}</div>;
      `,
            },
          ],
        },
      ],
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      output: null,
    },
    {
      code: `
import { select as renamed } from './no-redundant-default-arguments/source';
renamed(0);
      `,
      errors: [
        {
          column: 9,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
import { select as renamed } from './no-redundant-default-arguments/source';
renamed();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(this: void, value = 0) {}
select(0);
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(this: void, value = 0) {}
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(value = true) {}
select(true);
      `,
      errors: [
        {
          column: 8,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = true) {}
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(value = false) {}
select(false);
      `,
      errors: [
        {
          column: 8,
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = false) {}
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(value = null) {}
select(null);
      `,
      errors: [
        {
          column: 8,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = null) {}
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(value = 0x10n) {}
select(16n);
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = 0x10n) {}
select();
      `,
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.no-redundant-default-arguments.json',
          projectService: false,
        },
      },
      output: null,
    },
    {
      code: `
function select(value = -1n) {}
select(-1n);
      `,
      errors: [
        {
          column: 8,
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = -1n) {}
select();
      `,
            },
          ],
        },
      ],
      languageOptions: {
        parserOptions: {
          project: './tsconfig.no-redundant-default-arguments.json',
          projectService: false,
        },
      },
      output: null,
    },
    {
      code: `
function select(value = -0) {}
select(-0);
      `,
      errors: [
        {
          column: 8,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = -0) {}
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(value = +1) {}
select(1);
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = +1) {}
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select({ value = 0, other = 1 }) {}
select({ value: 2, other: 1 });
      `,
      errors: [
        {
          column: 20,
          data: { name: 'other' },
          endColumn: 28,
          endLine: 3,
          line: 3,
          messageId: 'redundantProperty',
          suggestions: [
            {
              data: { name: 'other' },
              messageId: 'removeProperty',
              output: `
function select({ value = 0, other = 1 }) {}
select({ value: 2 });
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: noFormat`
function select(value = 0) {}
select((/* keep */ 0));
      `,
      errors: [
        {
          column: 20,
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [],
        },
      ],
      output: null,
    },
    {
      code: noFormat`
function select(first = 0, second = 1) {}
select(2, (1),);
      `,
      errors: [
        {
          column: 12,
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(first = 0, second = 1) {}
select(2);
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select({ value = 0 }) {}
select({ value: 0 });
      `,
      errors: [
        {
          column: 10,
          data: { name: 'value' },
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'redundantProperty',
          suggestions: [
            {
              data: { name: 'value' },
              messageId: 'removeProperty',
              output: `
function select({ value = 0 }) {}
select({  });
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(value = 'ready') {}
select(\`ready\`);
      `,
      errors: [
        {
          column: 8,
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = 'ready') {}
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(first = 0, second = 1) {}
select(0, 1);
      `,
      errors: [
        {
          column: 8,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(first = 0, second = 1) {}
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
    {
      code: `
function select(value = 0) {}
select(0);
      `,
      errors: [
        {
          column: 8,
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'redundantArguments',
          suggestions: [
            {
              messageId: 'removeArguments',
              output: `
function select(value = 0) {}
select();
      `,
            },
          ],
        },
      ],
      output: null,
    },
  ],
});
