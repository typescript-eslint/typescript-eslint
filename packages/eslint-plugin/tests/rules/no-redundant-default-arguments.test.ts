import { noFormat } from '@typescript-eslint/rule-tester';
import * as path from 'node:path';

import rule from '../../src/rules/no-redundant-default-arguments';
import { createRuleTesterWithTypes, getFixturesRootDir } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();
const jsxFilename = path.join(getFixturesRootDir(), 'react.tsx');
ruleTester.run('no-redundant-default-arguments', rule, {
  assertionOptions: { requireData: true },
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
function foo(value: number) {}
foo(0);
    `,
    `
function foo(value = 0, other = 1) {}
foo(0, 2);
    `,
    `
function foo(value = 0) {}
foo(getValue());
    `,
    `
function foo(value = getValue()) {}
foo(0);
    `,
    `
const DEFAULT = 0;
function foo(value = DEFAULT) {}
foo(0);
    `,
    `
function foo(value = -0) {}
foo(0);
    `,
    `
function foo(value = 0) {}
foo(-0);
    `,
    `
function foo(value = {}) {}
foo({});
    `,
    `
function foo(value = /a/) {}
foo(/a/);
    `,
    `
function foo(value = 0, ...rest: number[]) {}
foo(0, ...values);
    `,
    `
function foo(first: number, value = 0) {}
foo(...values, 0);
    `,
    `
let foo = (value = 0) => {};
foo(0);
    `,
    `
function foo(value = 0) {}
foo = other;
foo(0);
    `,
    `
function foo(value = 0) {}
[foo] = [other];
foo(0);
    `,
    `
function foo(value = 0) {}
({ foo } = other);
foo(0);
    `,
    `
function foo(value = 0) {}
for (foo of values) {
}
foo(0);
    `,
    `
function foo(value = 0) {
  return arguments.length;
}
foo(0);
    `,
    `
function foo(value = 0, other = arguments[0]) {
  return other;
}
foo(0);
    `,
    `
function foo(value = 0) {
  return eval('arguments[0]');
}
foo(0);
    `,
    `
const foo = Math.max;
foo(0);
    `,
    `
const object = { foo(value = 0) {} };
object.foo(0);
    `,
    `
function foo(value = 0) {}
const bound = foo.bind(null, 1);
bound(0);
    `,
    `
function foo(value: 0): 0;
function foo(): 1;
function foo(value = 0) {
  return value;
}
foo(0);
    `,
    `
function foo(value = 0) {}
function bar(value = 1) {}
const selected = Math.random() ? foo : bar;
selected(0);
    `,
    `
function foo({ value = 0 }: { value?: number }) {}
foo({ value: 1 });
    `,
    `
function foo({ value = 0 }: { value?: number }) {}
foo({ value });
    `,
    `
function foo({ value = 0 }: { value?: number }) {}
foo({ ...other, value: 0 });
    `,
    `
function foo({ value = 0 }: { value?: number }) {}
foo({ value: 0, ...other });
    `,
    `
function foo({ value = 0 }: { value?: number }) {}
foo({ value: 1, value: 0 });
    `,
    `
function foo({ value = 0 }: { value?: number }) {}
foo({ [key]: 1, value: 0 });
    `,
    `
function foo({ value = 0 }: { value?: number }) {}
foo({
  get value() {
    return 0;
  },
});
    `,
    `
function foo({ value = 0, value: again }: { value?: number }) {}
foo({ value: 0 });
    `,
    `
function foo({ value = 0, [key]: again }: { value?: number }) {}
foo({ value: 0 });
    `,
    `
function foo({ constructor: value = 0 }: { constructor?: number }) {}
foo({ constructor: 0 });
    `,
    `
function foo({ value = 0 }: { value?: number }) {
  return arguments[0];
}
foo({ value: 0 });
    `,
    `
function foo(first: number, { value = 0 }: { value?: number }) {}
foo(...values, { value: 0 });
    `,
    {
      code: `
function Button({ value = 0 }: { value?: number }) {
  return null;
}
<Button value={1} />;
      `,
      filename: jsxFilename,
    },
    {
      code: `
function Button({ value = 0 }: { value?: number }) {
  return null;
}
<Button {...props} value={0} />;
      `,
      filename: jsxFilename,
    },
    {
      code: `
function Button({ value = 0 }: { value?: number }) {
  return null;
}
<Button value={0} {...props} />;
      `,
      filename: jsxFilename,
    },
    {
      code: `
function Button({ value = 0 }: { value?: number }) {
  return null;
}
<Button value={0} value={0} />;
      `,
      filename: jsxFilename,
    },
    {
      code: `
function Button({ key = 0, ref = 0 }: { key?: number; ref?: number }) {
  return null;
}
<Button key={0} ref={0} />;
      `,
      filename: jsxFilename,
    },
    {
      code: `
function Button({ value = 0 }: { value?: number }) {
  return null;
}
Button.defaultProps = { value: 1 };
<Button value={0} />;
      `,
      filename: jsxFilename,
    },
    {
      code: `
function button({ value = 0 }: { value?: number }) {
  return null;
}
<button value={0} />;
      `,
      filename: jsxFilename,
    },
    `
import { mutable, reassigned, choose } from './redundant-default-arguments';
mutable(3);
reassigned(3);
choose(3);
    `,
    `
function infer<T = unknown>(value: T = 0 as T): T {
  return value;
}
const result = infer(0);
    `,
    `
function first(value = 0) {}
function second(value = 1) {}
first(2);
first(3);
second(2);
    `,
    `
function outer(callback: (value: number) => void) {
  callback(0);
}
    `,
    `
const first = second;
const second = first;
first(0);
    `,
    `
function foo(value = !false) {}
foo(true);
    `,
    `
function foo({ value = 0 }: { value?: number }) {}
foo({ other: 0 });
    `,
    {
      code: `
function Button({ [key]: value = 0 }: { value?: number }) {
  return null;
}
<Button value={0} />;
      `,
      filename: jsxFilename,
    },
    {
      code: `
function Button({ value = 0 }: { value?: number }) {
  return null;
}
<Button other={0} />;
      `,
      filename: jsxFilename,
    },
    {
      code: `
function Button({ value = 0 }: { value?: number }) {
  return null;
}
<Button unknown:name={0} />;
      `,
      filename: jsxFilename,
    },
    {
      code: `
function Button<T = unknown>({ value = 0 as T }: { value?: T }) {
  return null;
}
<Button value={0} />;
      `,
      filename: jsxFilename,
    },
    `
import {
  byArray,
  byProperty,
  byShorthand,
  byDefault,
  union,
} from './redundant-default-arguments';
byArray(3);
byProperty(3);
byShorthand(3);
byDefault(3);
union(3);
    `,
    `
function foo({ value = 0 }: { value: number }) {}
foo({ value: 0 });
    `,
    {
      code: `
function Button({ value = 0 }: { value: number }) {
  return null;
}
<Button value={0} />;
      `,
      filename: jsxFilename,
    },
  ],
  invalid: [
    {
      code: `
function foo(value = 0) {}
foo(0);
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo(value = 0) {}
foo();
      `,
    },
    {
      code: `
foo(0);
function foo(value = 0) {}
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 6,
          endLine: 2,
          line: 2,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
foo();
function foo(value = 0) {}
      `,
    },
    {
      code: `
function foo(value = 0) {}
const alias = foo;
alias(0);
      `,
      errors: [
        {
          column: 7,
          data: { kind: 'argument', name: 'value' },
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo(value = 0) {}
const alias = foo;
alias();
      `,
    },
    {
      code: `
const foo = (value = 'all') => {};
foo('all');
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
const foo = (value = 'all') => {};
foo();
      `,
    },
    {
      code: `
const foo = function (value = false) {};
foo(false);
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
const foo = function (value = false) {};
foo();
      `,
    },
    {
      code: `
function foo(value = -1) {}
foo(-1);
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo(value = -1) {}
foo();
      `,
    },
    {
      code: `
function foo(value = +1) {}
foo(+1);
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo(value = +1) {}
foo();
      `,
    },
    {
      code: `
function foo(value = 1n) {}
foo(1n);
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo(value = 1n) {}
foo();
      `,
    },
    {
      code: `
function foo(value = -1n) {}
foo(-1n);
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo(value = -1n) {}
foo();
      `,
    },
    {
      code: `
function foo(value = null) {}
foo(null);
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 9,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo(value = null) {}
foo();
      `,
    },
    {
      code: `
function foo(value = \`all\`) {}
foo(\`all\`);
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo(value = \`all\`) {}
foo();
      `,
    },
    {
      code: `
const foo = (value = 0 as const) => {};
foo(0 as const);
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
const foo = (value = 0 as const) => {};
foo();
      `,
    },
    {
      code: noFormat`function foo(value = 0) {} foo(((0)));`,
      errors: [
        {
          column: 34,
          data: { kind: 'argument', name: 'value' },
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: 'function foo(value = 0) {} foo();',
    },
    {
      code: noFormat`function foo<T>(value = 0) {} foo<() => void>((0));`,
      errors: [
        {
          column: 48,
          data: { kind: 'argument', name: 'value' },
          endColumn: 49,
          endLine: 1,
          line: 1,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: 'function foo<T>(value = 0) {} foo<() => void>();',
    },
    {
      code: noFormat`function foo(value: number, other = 2) {} foo((1), (2),);`,
      errors: [
        {
          column: 53,
          data: { kind: 'argument', name: 'other' },
          endColumn: 54,
          endLine: 1,
          line: 1,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: 'function foo(value: number, other = 2) {} foo((1));',
    },
    {
      code: `
function foo(first = false, second = 'all') {}
foo(false, 'all');
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'first' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 12,
          data: { kind: 'argument', name: 'second' },
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo(first = false, second = 'all') {}
foo();
      `,
    },
    {
      code: `
function foo(value = 0) {}
foo(/* keep */ 0);
      `,
      errors: [
        {
          column: 16,
          data: { kind: 'argument', name: 'value' },
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: null,
    },
    {
      code: `
function foo(value = 0) {}
foo(0 /* keep */);
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: null,
    },
    {
      code: `
function foo({ value = 0 }: { value?: number }) {}
foo({ value: 0 });
      `,
      errors: [
        {
          column: 7,
          data: { kind: 'property', name: 'value' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo({ value = 0 }: { value?: number }) {}
foo({  });
      `,
    },
    {
      code: `
function foo({ value: renamed = 0 }: { value?: number }) {}
foo({ value: 0, other: 1 });
      `,
      errors: [
        {
          column: 7,
          data: { kind: 'property', name: 'value' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo({ value: renamed = 0 }: { value?: number }) {}
foo({ other: 1 });
      `,
    },
    {
      code: `
function foo({ value = 0 }: { value?: number }) {}
foo({ other: 1, value: 0 });
      `,
      errors: [
        {
          column: 17,
          data: { kind: 'property', name: 'value' },
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo({ value = 0 }: { value?: number }) {}
foo({ other: 1 });
      `,
    },
    {
      code: noFormat`function foo({ first = 1, second = 2 }: { first?: number; second?: number }) {} foo({ first: 1, second: 2 });`,
      errors: [
        {
          column: 87,
          data: { kind: 'property', name: 'first' },
          endColumn: 95,
          endLine: 1,
          line: 1,
          messageId: 'redundantDefaultValue',
        },
        {
          column: 97,
          data: { kind: 'property', name: 'second' },
          endColumn: 106,
          endLine: 1,
          line: 1,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: [
        'function foo({ first = 1, second = 2 }: { first?: number; second?: number }) {} foo({ second: 2 });',
        'function foo({ first = 1, second = 2 }: { first?: number; second?: number }) {} foo({  });',
      ],
    },
    {
      code: `
function foo({ options: { value = 0 } }: { options: { value?: number } }) {}
foo({ options: { value: 0 } });
      `,
      errors: [
        {
          column: 18,
          data: { kind: 'property', name: 'value' },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo({ options: { value = 0 } }: { options: { value?: number } }) {}
foo({ options: {  } });
      `,
    },
    {
      code: `
function foo({ value = 0 }: { value?: number }, ...rest: number[]) {}
foo({ value: 0 }, ...values);
      `,
      errors: [
        {
          column: 7,
          data: { kind: 'property', name: 'value' },
          endColumn: 15,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo({ value = 0 }: { value?: number }, ...rest: number[]) {}
foo({  }, ...values);
      `,
    },
    {
      code: `
function foo({ value = 0 }: { value?: number }) {}
foo({ value: /* keep */ 0 });
      `,
      errors: [
        {
          column: 7,
          data: { kind: 'property', name: 'value' },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: null,
    },
    {
      code: `
import { connect } from './redundant-default-arguments';
connect(3);
      `,
      errors: [
        {
          column: 9,
          data: { kind: 'argument', name: 'retries' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
import { connect } from './redundant-default-arguments';
connect();
      `,
    },
    {
      code: `
import { withOptions } from './redundant-default-arguments';
withOptions({ retries: 3 });
      `,
      errors: [
        {
          column: 15,
          data: { kind: 'property', name: 'retries' },
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
import { withOptions } from './redundant-default-arguments';
withOptions({  });
      `,
    },
    {
      code: `
function Button({ disabled = false }: { disabled?: any }) {
  return null;
}
<Button disabled={false} />;
      `,
      errors: [
        {
          column: 9,
          data: { kind: 'prop', name: 'disabled' },
          endColumn: 25,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: jsxFilename,
      output: `
function Button({ disabled = false }: { disabled?: any }) {
  return null;
}
<Button  />;
      `,
    },
    {
      code: `
function Button({ disabled = true }: { disabled?: any }) {
  return null;
}
<Button disabled />;
      `,
      errors: [
        {
          column: 9,
          data: { kind: 'prop', name: 'disabled' },
          endColumn: 17,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: jsxFilename,
      output: `
function Button({ disabled = true }: { disabled?: any }) {
  return null;
}
<Button  />;
      `,
    },
    {
      code: `
function Button({ disabled = 'hello' }: { disabled?: any }) {
  return null;
}
<Button disabled="hello" />;
      `,
      errors: [
        {
          column: 9,
          data: { kind: 'prop', name: 'disabled' },
          endColumn: 25,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: jsxFilename,
      output: `
function Button({ disabled = 'hello' }: { disabled?: any }) {
  return null;
}
<Button  />;
      `,
    },
    {
      code: `
function Button({ disabled = 'a&b' }: { disabled?: any }) {
  return null;
}
<Button disabled="a&amp;b" />;
      `,
      errors: [
        {
          column: 9,
          data: { kind: 'prop', name: 'disabled' },
          endColumn: 27,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: jsxFilename,
      output: `
function Button({ disabled = 'a&b' }: { disabled?: any }) {
  return null;
}
<Button  />;
      `,
    },
    {
      code: `
import { Button } from './redundant-default-arguments';
<Button disabled={false} />;
      `,
      errors: [
        {
          column: 9,
          data: { kind: 'prop', name: 'disabled' },
          endColumn: 25,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: jsxFilename,
      output: `
import { Button } from './redundant-default-arguments';
<Button  />;
      `,
    },
    {
      code: `
function Button({ value = 0 }: { value?: number }) {
  return null;
}
<Button value={/* keep */ 0} />;
      `,
      errors: [
        {
          column: 9,
          data: { kind: 'prop', name: 'value' },
          endColumn: 29,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      filename: jsxFilename,
      output: null,
    },
    {
      code: `
((value = 0) => value)(0);
      `,
      errors: [
        {
          column: 24,
          data: { kind: 'argument', name: 'value' },
          endColumn: 25,
          endLine: 2,
          line: 2,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
((value = 0) => value)();
      `,
    },
    {
      code: `
(function (value = 0) {
  return value;
})(0);
      `,
      errors: [
        {
          column: 4,
          data: { kind: 'argument', name: 'value' },
          endColumn: 5,
          endLine: 4,
          line: 4,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
(function (value = 0) {
  return value;
})();
      `,
    },
    {
      code: `
function foo(value = 0 satisfies number) {}
foo(0 satisfies number);
      `,
      dependencyConstraints: { typescript: '4.9' },
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 23,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo(value = 0 satisfies number) {}
foo();
      `,
    },
    {
      code: `
function foo(value = <number>0) {}
foo(0!);
      `,
      errors: [
        {
          column: 5,
          data: { kind: 'argument', name: 'value' },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo(value = <number>0) {}
foo();
      `,
    },
    {
      code: `
function foo({ value = 0, ...rest }: { value?: number; other?: number }) {
  return rest;
}
foo({ value: 0, other: 1 });
      `,
      errors: [
        {
          column: 7,
          data: { kind: 'property', name: 'value' },
          endColumn: 15,
          endLine: 5,
          line: 5,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo({ value = 0, ...rest }: { value?: number; other?: number }) {
  return rest;
}
foo({ other: 1 });
      `,
    },
    {
      code: `
function foo({ '0': value = 0 }: { '0'?: number }) {}
foo({ 0: 0 });
      `,
      errors: [
        {
          column: 7,
          data: { kind: 'property', name: '0' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'redundantDefaultValue',
        },
      ],
      output: `
function foo({ '0': value = 0 }: { '0'?: number }) {}
foo({  });
      `,
    },
  ],
});
