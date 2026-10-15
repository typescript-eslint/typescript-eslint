import rule from '../../src/rules/no-implied-eval';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-implied-eval', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    'foo.setImmediate(null);',
    'foo.setInterval(null);',
    'foo.execScript(null);',
    'foo.setTimeout(null);',
    'foo();',
    '(function () {})();',

    'setTimeout(() => {}, 0);',
    'window.setTimeout(() => {}, 0);',
    "window['setTimeout'](() => {}, 0);",

    'setInterval(() => {}, 0);',
    'window.setInterval(() => {}, 0);',
    "window['setInterval'](() => {}, 0);",

    'setImmediate(() => {});',
    'window.setImmediate(() => {});',
    "window['setImmediate'](() => {});",

    'execScript(() => {});',
    'window.execScript(() => {});',
    "window['execScript'](() => {});",

    `
const foo = () => {};

setTimeout(foo, 0);
setInterval(foo, 0);
setImmediate(foo);
execScript(foo);
    `,
    `
const foo = function () {};

setTimeout(foo, 0);
setInterval(foo, 0);
setImmediate(foo);
execScript(foo);
    `,
    `
function foo() {}

setTimeout(foo, 0);
setInterval(foo, 0);
setImmediate(foo);
execScript(foo);
    `,
    `
const foo = {
  fn: () => {},
};

setTimeout(foo.fn, 0);
setInterval(foo.fn, 0);
setImmediate(foo.fn);
execScript(foo.fn);
    `,
    `
const foo = {
  fn: function () {},
};

setTimeout(foo.fn, 0);
setInterval(foo.fn, 0);
setImmediate(foo.fn);
execScript(foo.fn);
    `,
    `
const foo = {
  fn: function foo() {},
};

setTimeout(foo.fn, 0);
setInterval(foo.fn, 0);
setImmediate(foo.fn);
execScript(foo.fn);
    `,
    `
const foo = {
  fn() {},
};

setTimeout(foo.fn, 0);
setInterval(foo.fn, 0);
setImmediate(foo.fn);
execScript(foo.fn);
    `,
    `
const foo = {
  fn: () => {},
};
const fn = 'fn';

setTimeout(foo[fn], 0);
setInterval(foo[fn], 0);
setImmediate(foo[fn]);
execScript(foo[fn]);
    `,
    `
const foo = {
  fn: () => {},
};

setTimeout(foo['fn'], 0);
setInterval(foo['fn'], 0);
setImmediate(foo['fn']);
execScript(foo['fn']);
    `,
    `
const foo: () => void = () => {};

setTimeout(foo, 0);
setInterval(foo, 0);
setImmediate(foo);
execScript(foo);
    `,
    `
const foo: () => () => void = () => {
  return () => {};
};

setTimeout(foo(), 0);
setInterval(foo(), 0);
setImmediate(foo());
execScript(foo());
    `,
    `
const foo: () => () => void = () => () => {};

setTimeout(foo(), 0);
setInterval(foo(), 0);
setImmediate(foo());
execScript(foo());
    `,
    `
const foo = () => () => {};

setTimeout(foo(), 0);
setInterval(foo(), 0);
setImmediate(foo());
execScript(foo());
    `,
    `
const foo = function foo() {
  return function foo() {};
};

setTimeout(foo(), 0);
setInterval(foo(), 0);
setImmediate(foo());
execScript(foo());
    `,
    `
const foo = function () {
  return function () {
    return '';
  };
};

setTimeout(foo(), 0);
setInterval(foo(), 0);
setImmediate(foo());
execScript(foo());
    `,
    `
const foo: () => () => void = function foo() {
  return function foo() {};
};

setTimeout(foo(), 0);
setInterval(foo(), 0);
setImmediate(foo());
execScript(foo());
    `,
    `
function foo() {
  return function foo() {
    return () => {};
  };
}

setTimeout(foo()(), 0);
setInterval(foo()(), 0);
setImmediate(foo()());
execScript(foo()());
    `,
    `
class Foo {
  static fn = () => {};
}

setTimeout(Foo.fn, 0);
setInterval(Foo.fn, 0);
setImmediate(Foo.fn);
execScript(Foo.fn);
    `,
    `
class Foo {
  fn() {}
}

const foo = new Foo();

setTimeout(foo.fn, 0);
setInterval(foo.fn, 0);
setImmediate(foo.fn);
execScript(foo.fn);
    `,
    `
class Foo {
  fn() {}
}
const foo = new Foo();
const fn = foo.fn;

setTimeout(fn.bind(null), 0);
setInterval(fn.bind(null), 0);
setImmediate(fn.bind(null));
execScript(fn.bind(null));
    `,
    `
const fn = (foo: () => void) => {
  setTimeout(foo, 0);
  setInterval(foo, 0);
  setImmediate(foo);
  execScript(foo);
};
    `,
    `
import { Function } from './class';
new Function('foo');
    `,
    `
const foo = (callback: Function) => {
  setTimeout(callback, 0);
};
    `,
    `
const foo = () => {};
const bar = () => {};

setTimeout(Math.radom() > 0.5 ? foo : bar, 0);
setTimeout(foo || bar, 500);
    `,
    `
class Foo {
  func1() {}
  func2(): void {
    setTimeout(this.func1.bind(this), 1);
  }
}
    `,
    `
class Foo {
  private a = {
    b: {
      c: function () {},
    },
  };
  funcw(): void {
    setTimeout(this.a.b.c.bind(this), 1);
  }
}
    `,
    `
function setTimeout(input: string, value: number) {}

setTimeout('', 0);
    `,
    `
declare module 'my-timers-promises' {
  export function setTimeout(ms: number): void;
}

import { setTimeout } from 'my-timers-promises';

setTimeout(1000);
    `,
    `
function setTimeout() {}

{
  setTimeout(100);
}
    `,
    `
function setTimeout() {}

{
  setTimeout("alert('evil!')");
}
    `,
  ],

  invalid: [
    {
      code: `
setTimeout('x = 1', 0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
setInterval('x = 1', 0);
      `,
      errors: [
        {
          column: 13,
          endColumn: 20,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
setImmediate('x = 1');
      `,
      errors: [
        {
          column: 14,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
execScript('x = 1');
      `,
      errors: [
        {
          column: 12,
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
setTimeout(undefined, 0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
setInterval(undefined, 0);
      `,
      errors: [
        {
          column: 13,
          endColumn: 22,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
setImmediate(undefined);
      `,
      errors: [
        {
          column: 14,
          endColumn: 23,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
execScript(undefined);
      `,
      errors: [
        {
          column: 12,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
setTimeout(1 + '' + (() => {}), 0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 31,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
setInterval(1 + '' + (() => {}), 0);
      `,
      errors: [
        {
          column: 13,
          endColumn: 32,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
setImmediate(1 + '' + (() => {}));
      `,
      errors: [
        {
          column: 14,
          endColumn: 33,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
execScript(1 + '' + (() => {}));
      `,
      errors: [
        {
          column: 12,
          endColumn: 31,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = 'x = 1';

setTimeout(foo, 0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = 'x = 1';

setInterval(foo, 0);
      `,
      errors: [
        {
          column: 13,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = 'x = 1';

setImmediate(foo);
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = 'x = 1';

execScript(foo);
      `,
      errors: [
        {
          column: 12,
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = function () {
  return 'x + 1';
};

setTimeout(foo(), 0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = function () {
  return 'x + 1';
};

setInterval(foo(), 0);
      `,
      errors: [
        {
          column: 13,
          endColumn: 18,
          endLine: 6,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = function () {
  return 'x + 1';
};

setImmediate(foo());
      `,
      errors: [
        {
          column: 14,
          endColumn: 19,
          endLine: 6,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = function () {
  return 'x + 1';
};

execScript(foo());
      `,
      errors: [
        {
          column: 12,
          endColumn: 17,
          endLine: 6,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = function () {
  return () => 'x + 1';
};

setTimeout(foo()(), 0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 19,
          endLine: 6,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = function () {
  return () => 'x + 1';
};

setInterval(foo()(), 0);
      `,
      errors: [
        {
          column: 13,
          endColumn: 20,
          endLine: 6,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = function () {
  return () => 'x + 1';
};

setImmediate(foo()());
      `,
      errors: [
        {
          column: 14,
          endColumn: 21,
          endLine: 6,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = function () {
  return () => 'x + 1';
};

execScript(foo()());
      `,
      errors: [
        {
          column: 12,
          endColumn: 19,
          endLine: 6,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const fn = function () {};

setTimeout(fn + '', 0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 19,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const fn = function () {};

setInterval(fn + '', 0);
      `,
      errors: [
        {
          column: 13,
          endColumn: 20,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const fn = function () {};

setImmediate(fn + '');
      `,
      errors: [
        {
          column: 14,
          endColumn: 21,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const fn = function () {};

execScript(fn + '');
      `,
      errors: [
        {
          column: 12,
          endColumn: 19,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo: string = 'x + 1';

setTimeout(foo, 0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo: string = 'x + 1';

setInterval(foo, 0);
      `,
      errors: [
        {
          column: 13,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo: string = 'x + 1';

setImmediate(foo);
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo: string = 'x + 1';

execScript(foo);
      `,
      errors: [
        {
          column: 12,
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = new String('x + 1');

setTimeout(foo, 0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = new String('x + 1');

setInterval(foo, 0);
      `,
      errors: [
        {
          column: 13,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = new String('x + 1');

setImmediate(foo);
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = new String('x + 1');

execScript(foo);
      `,
      errors: [
        {
          column: 12,
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = 'x + 1';

setTimeout(foo as any, 0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 22,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = 'x + 1';

setInterval(foo as any, 0);
      `,
      errors: [
        {
          column: 13,
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = 'x + 1';

setImmediate(foo as any);
      `,
      errors: [
        {
          column: 14,
          endColumn: 24,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = 'x + 1';

execScript(foo as any);
      `,
      errors: [
        {
          column: 12,
          endColumn: 22,
          endLine: 4,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const fn = (foo: string | any) => {
  setTimeout(foo, 0);
};
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const fn = (foo: string | any) => {
  setInterval(foo, 0);
};
      `,
      errors: [
        {
          column: 15,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const fn = (foo: string | any) => {
  setImmediate(foo);
};
      `,
      errors: [
        {
          column: 16,
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const fn = (foo: string | any) => {
  execScript(foo);
};
      `,
      errors: [
        {
          column: 14,
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo = 'foo';
const bar = () => {};

setTimeout(Math.radom() > 0.5 ? foo : bar, 0);
      `,
      errors: [
        {
          column: 12,
          endColumn: 42,
          endLine: 5,
          line: 5,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
window.setTimeout(\`\`, 0);
      `,
      errors: [
        {
          column: 19,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
window['setTimeout'](\`\`, 0);
      `,
      errors: [
        {
          column: 22,
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
window.setInterval(\`\`, 0);
      `,
      errors: [
        {
          column: 20,
          endColumn: 22,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
window['setInterval'](\`\`, 0);
      `,
      errors: [
        {
          column: 23,
          endColumn: 25,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
window.setImmediate(\`\`);
      `,
      errors: [
        {
          column: 21,
          endColumn: 23,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
window['setImmediate'](\`\`);
      `,
      errors: [
        {
          column: 24,
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
window.execScript(\`\`);
      `,
      errors: [
        {
          column: 19,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
window['execScript'](\`\`);
      `,
      errors: [
        {
          column: 22,
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
global.setTimeout(\`\`, 0);
      `,
      errors: [
        {
          column: 19,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
global['setTimeout'](\`\`, 0);
      `,
      errors: [
        {
          column: 22,
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
global.setInterval(\`\`, 0);
      `,
      errors: [
        {
          column: 20,
          endColumn: 22,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
global['setInterval'](\`\`, 0);
      `,
      errors: [
        {
          column: 23,
          endColumn: 25,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
global.setImmediate(\`\`);
      `,
      errors: [
        {
          column: 21,
          endColumn: 23,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
global['setImmediate'](\`\`);
      `,
      errors: [
        {
          column: 24,
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
global.execScript(\`\`);
      `,
      errors: [
        {
          column: 19,
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
global['execScript'](\`\`);
      `,
      errors: [
        {
          column: 22,
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
globalThis.setTimeout(\`\`, 0);
      `,
      errors: [
        {
          column: 23,
          endColumn: 25,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
globalThis['setTimeout'](\`\`, 0);
      `,
      errors: [
        {
          column: 26,
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
globalThis.setInterval(\`\`, 0);
      `,
      errors: [
        {
          column: 24,
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
globalThis['setInterval'](\`\`, 0);
      `,
      errors: [
        {
          column: 27,
          endColumn: 29,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
globalThis.setImmediate(\`\`);
      `,
      errors: [
        {
          column: 25,
          endColumn: 27,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
globalThis['setImmediate'](\`\`);
      `,
      errors: [
        {
          column: 28,
          endColumn: 30,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
globalThis.execScript(\`\`);
      `,
      errors: [
        {
          column: 23,
          endColumn: 25,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
globalThis['execScript'](\`\`);
      `,
      errors: [
        {
          column: 26,
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: `
const foo: string | undefined = 'hello';
const bar = () => {};

setTimeout(foo || bar, 500);
      `,
      errors: [
        {
          column: 12,
          endColumn: 22,
          endLine: 5,
          line: 5,
          messageId: 'noImpliedEvalError',
        },
      ],
    },
    {
      code: 'const fn = Function();',
      errors: [
        {
          column: 12,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'noFunctionConstructor',
        },
      ],
    },
    {
      code: "const fn = new Function('a', 'b', 'return a + b');",
      errors: [
        {
          column: 12,
          endColumn: 50,
          endLine: 1,
          line: 1,
          messageId: 'noFunctionConstructor',
        },
      ],
    },
    {
      code: 'const fn = window.Function();',
      errors: [
        {
          column: 12,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noFunctionConstructor',
        },
      ],
    },
    {
      code: 'const fn = new window.Function();',
      errors: [
        {
          column: 12,
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'noFunctionConstructor',
        },
      ],
    },
    {
      code: "const fn = window['Function']();",
      errors: [
        {
          column: 12,
          endColumn: 32,
          endLine: 1,
          line: 1,
          messageId: 'noFunctionConstructor',
        },
      ],
    },
    {
      code: "const fn = new window['Function']();",
      errors: [
        {
          column: 12,
          endColumn: 36,
          endLine: 1,
          line: 1,
          messageId: 'noFunctionConstructor',
        },
      ],
    },
  ],
});
