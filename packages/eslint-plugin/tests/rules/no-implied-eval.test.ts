import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-implied-eval';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    tsconfigRootDir: rootDir,
    ecmaVersion: 2015,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-implied-eval', rule, {
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
setInterval('x = 1', 0);
setImmediate('x = 1');
execScript('x = 1');
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 2,
          column: 12,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 3,
          column: 13,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 4,
          column: 14,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 12,
        },
      ],
    },
    {
      code: `
setTimeout(undefined, 0);
setInterval(undefined, 0);
setImmediate(undefined);
execScript(undefined);
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 2,
          column: 12,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 3,
          column: 13,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 4,
          column: 14,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 12,
        },
      ],
    },
    {
      code: `
setTimeout(1 + '' + (() => {}), 0);
setInterval(1 + '' + (() => {}), 0);
setImmediate(1 + '' + (() => {}));
execScript(1 + '' + (() => {}));
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 2,
          column: 12,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 3,
          column: 13,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 4,
          column: 14,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 12,
        },
      ],
    },
    {
      code: `
const foo = 'x = 1';

setTimeout(foo, 0);
setInterval(foo, 0);
setImmediate(foo);
execScript(foo);
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 4,
          column: 12,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 13,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 6,
          column: 14,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 7,
          column: 12,
        },
      ],
    },
    {
      code: `
const foo = function () {
  return 'x + 1';
};

setTimeout(foo(), 0);
setInterval(foo(), 0);
setImmediate(foo());
execScript(foo());
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 6,
          column: 12,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 7,
          column: 13,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 8,
          column: 14,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 9,
          column: 12,
        },
      ],
    },
    {
      code: `
const foo = function () {
  return () => 'x + 1';
};

setTimeout(foo()(), 0);
setInterval(foo()(), 0);
setImmediate(foo()());
execScript(foo()());
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 6,
          column: 12,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 7,
          column: 13,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 8,
          column: 14,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 9,
          column: 12,
        },
      ],
    },
    {
      code: `
const fn = function () {};

setTimeout(fn + '', 0);
setInterval(fn + '', 0);
setImmediate(fn + '');
execScript(fn + '');
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 4,
          column: 12,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 13,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 6,
          column: 14,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 7,
          column: 12,
        },
      ],
    },
    {
      code: `
const foo: string = 'x + 1';

setTimeout(foo, 0);
setInterval(foo, 0);
setImmediate(foo);
execScript(foo);
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 4,
          column: 12,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 13,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 6,
          column: 14,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 7,
          column: 12,
        },
      ],
    },
    {
      code: `
const foo = new String('x + 1');

setTimeout(foo, 0);
setInterval(foo, 0);
setImmediate(foo);
execScript(foo);
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 4,
          column: 12,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 13,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 6,
          column: 14,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 7,
          column: 12,
        },
      ],
    },
    {
      code: `
const foo = 'x + 1';

setTimeout(foo as any, 0);
setInterval(foo as any, 0);
setImmediate(foo as any);
execScript(foo as any);
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 4,
          column: 12,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 13,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 6,
          column: 14,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 7,
          column: 12,
        },
      ],
    },
    {
      code: `
const fn = (foo: string | any) => {
  setTimeout(foo, 0);
  setInterval(foo, 0);
  setImmediate(foo);
  execScript(foo);
};
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 3,
          column: 14,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 4,
          column: 15,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 16,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 6,
          column: 14,
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
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 12,
        },
      ],
    },
    {
      code: `
window.setTimeout(\`\`, 0);
window['setTimeout'](\`\`, 0);

window.setInterval(\`\`, 0);
window['setInterval'](\`\`, 0);

window.setImmediate(\`\`);
window['setImmediate'](\`\`);

window.execScript(\`\`);
window['execScript'](\`\`);
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 2,
          column: 19,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 3,
          column: 22,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 20,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 6,
          column: 23,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 8,
          column: 21,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 9,
          column: 24,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 11,
          column: 19,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 12,
          column: 22,
        },
      ],
    },
    {
      code: `
global.setTimeout(\`\`, 0);
global['setTimeout'](\`\`, 0);

global.setInterval(\`\`, 0);
global['setInterval'](\`\`, 0);

global.setImmediate(\`\`);
global['setImmediate'](\`\`);

global.execScript(\`\`);
global['execScript'](\`\`);
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 2,
          column: 19,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 3,
          column: 22,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 20,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 6,
          column: 23,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 8,
          column: 21,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 9,
          column: 24,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 11,
          column: 19,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 12,
          column: 22,
        },
      ],
    },
    {
      code: `
globalThis.setTimeout(\`\`, 0);
globalThis['setTimeout'](\`\`, 0);

globalThis.setInterval(\`\`, 0);
globalThis['setInterval'](\`\`, 0);

globalThis.setImmediate(\`\`);
globalThis['setImmediate'](\`\`);

globalThis.execScript(\`\`);
globalThis['execScript'](\`\`);
      `,
      errors: [
        {
          messageId: 'noImpliedEvalError',
          line: 2,
          column: 23,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 3,
          column: 26,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 24,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 6,
          column: 27,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 8,
          column: 25,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 9,
          column: 28,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 11,
          column: 23,
        },
        {
          messageId: 'noImpliedEvalError',
          line: 12,
          column: 26,
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
          messageId: 'noImpliedEvalError',
          line: 5,
          column: 12,
        },
      ],
    },
    {
      code: 'const fn = Function();',
      errors: [
        {
          messageId: 'noFunctionConstructor',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: "const fn = new Function('a', 'b', 'return a + b');",
      errors: [
        {
          messageId: 'noFunctionConstructor',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'const fn = window.Function();',
      errors: [
        {
          messageId: 'noFunctionConstructor',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'const fn = new window.Function();',
      errors: [
        {
          messageId: 'noFunctionConstructor',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: "const fn = window['Function']();",
      errors: [
        {
          messageId: 'noFunctionConstructor',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: "const fn = new window['Function']();",
      errors: [
        {
          messageId: 'noFunctionConstructor',
          line: 1,
          column: 12,
        },
      ],
    },
  ],
});
