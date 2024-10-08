import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-implied-eval';
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
          column: 12,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 13,
          line: 3,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 14,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 12,
          line: 5,
          messageId: 'noImpliedEvalError',
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
          column: 12,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 13,
          line: 3,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 14,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 12,
          line: 5,
          messageId: 'noImpliedEvalError',
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
          column: 12,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 13,
          line: 3,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 14,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 12,
          line: 5,
          messageId: 'noImpliedEvalError',
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
          column: 12,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 13,
          line: 5,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 14,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 12,
          line: 7,
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
setInterval(foo(), 0);
setImmediate(foo());
execScript(foo());
      `,
      errors: [
        {
          column: 12,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 13,
          line: 7,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 14,
          line: 8,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 12,
          line: 9,
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
setInterval(foo()(), 0);
setImmediate(foo()());
execScript(foo()());
      `,
      errors: [
        {
          column: 12,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 13,
          line: 7,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 14,
          line: 8,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 12,
          line: 9,
          messageId: 'noImpliedEvalError',
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
          column: 12,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 13,
          line: 5,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 14,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 12,
          line: 7,
          messageId: 'noImpliedEvalError',
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
          column: 12,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 13,
          line: 5,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 14,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 12,
          line: 7,
          messageId: 'noImpliedEvalError',
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
          column: 12,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 13,
          line: 5,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 14,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 12,
          line: 7,
          messageId: 'noImpliedEvalError',
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
          column: 12,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 13,
          line: 5,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 14,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 12,
          line: 7,
          messageId: 'noImpliedEvalError',
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
          column: 14,
          line: 3,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 15,
          line: 4,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 16,
          line: 5,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 14,
          line: 6,
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
          line: 5,
          messageId: 'noImpliedEvalError',
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
          column: 19,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 22,
          line: 3,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 20,
          line: 5,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 23,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 21,
          line: 8,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 24,
          line: 9,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 19,
          line: 11,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 22,
          line: 12,
          messageId: 'noImpliedEvalError',
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
          column: 19,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 22,
          line: 3,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 20,
          line: 5,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 23,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 21,
          line: 8,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 24,
          line: 9,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 19,
          line: 11,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 22,
          line: 12,
          messageId: 'noImpliedEvalError',
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
          column: 23,
          line: 2,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 26,
          line: 3,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 24,
          line: 5,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 27,
          line: 6,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 25,
          line: 8,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 28,
          line: 9,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 23,
          line: 11,
          messageId: 'noImpliedEvalError',
        },
        {
          column: 26,
          line: 12,
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
          line: 1,
          messageId: 'noFunctionConstructor',
        },
      ],
    },
  ],
});
