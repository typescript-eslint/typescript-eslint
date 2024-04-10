import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/init-declarations';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('init-declarations', rule, {
  valid: [
    // checking compatibility with base rule
    'var foo = null;',
    'foo = true;',
    `
var foo = 1,
  bar = false,
  baz = {};
    `,
    `
function foo() {
  var foo = 0;
  var bar = [];
}
    `,
    'var fn = function () {};',
    'var foo = (bar = 2);',
    'for (var i = 0; i < 1; i++) {}',
    `
for (var foo in []) {
}
    `,
    {
      code: `
for (var foo of []) {
}
      `,
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'let a = true;',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'const a = {};',
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  let a = 1,
    b = false;
  if (a) {
    let c = 3,
      d = null;
  }
}
      `,
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  const a = 1,
    b = true;
  if (a) {
    const c = 3,
      d = null;
  }
}
      `,
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  let a = 1;
  const b = false;
  var c = true;
}
      `,
      options: ['always'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'var foo, bar, baz;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  var foo;
  var bar;
}
      `,
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'let a;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'const a = 1;',
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  let a, b;
  if (a) {
    let c, d;
  }
}
      `,
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  const a = 1,
    b = true;
  if (a) {
    const c = 3,
      d = null;
  }
}
      `,
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  let a;
  const b = false;
  var c;
}
      `,
      options: ['never'],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: 'for (var i = 0; i < 1; i++) {}',
      options: ['never', { ignoreForLoopInit: true }],
    },
    {
      code: `
for (var foo in []) {
}
      `,
      options: ['never', { ignoreForLoopInit: true }],
    },
    {
      code: `
for (var foo of []) {
}
      `,
      options: ['never', { ignoreForLoopInit: true }],
      parserOptions: { ecmaVersion: 6 },
    },
    {
      code: `
function foo() {
  var bar = 1;
  let baz = 2;
  const qux = 3;
}
      `,
      options: ['always'],
    },

    // typescript-eslint
    {
      code: 'declare const foo: number;',
      options: ['always'],
    },
    {
      code: 'declare const foo: number;',
      options: ['never'],
    },
    {
      code: `
declare namespace myLib {
  let numberOfGreetings: number;
}
      `,
      options: ['always'],
    },
    {
      code: `
declare namespace myLib {
  let numberOfGreetings: number;
}
      `,
      options: ['never'],
    },
    {
      code: `
interface GreetingSettings {
  greeting: string;
  duration?: number;
  color?: string;
}
      `,
    },
    {
      code: `
interface GreetingSettings {
  greeting: string;
  duration?: number;
  color?: string;
}
      `,
      options: ['never'],
    },
    'type GreetingLike = string | (() => string) | Greeter;',
    {
      code: 'type GreetingLike = string | (() => string) | Greeter;',
      options: ['never'],
    },
    {
      code: `
function foo() {
  var bar: string;
}
      `,
      options: ['never'],
    },
    {
      code: 'var bar: string;',
      options: ['never'],
    },
    {
      code: `
var bar: string = function (): string {
  return 'string';
};
      `,
      options: ['always'],
    },
    {
      code: `
var bar: string = function (arg1: stirng): string {
  return 'string';
};
      `,
      options: ['always'],
    },
    {
      code: "function foo(arg1: string = 'string'): void {}",
      options: ['never'],
    },
    {
      code: "const foo: string = 'hello';",
      options: ['never'],
    },
    {
      code: `
const class1 = class NAME {
  constructor() {
    var name1: string = 'hello';
  }
};
      `,
    },
    {
      code: `
const class1 = class NAME {
  static pi: number = 3.14;
};
      `,
    },
    {
      code: `
const class1 = class NAME {
  static pi: number = 3.14;
};
      `,
      options: ['never'],
    },
    {
      code: `
interface IEmployee {
  empCode: number;
  empName: string;
  getSalary: (number) => number; // arrow function
  getManagerName(number): string;
}
      `,
    },
    {
      code: `
interface IEmployee {
  empCode: number;
  empName: string;
  getSalary: (number) => number; // arrow function
  getManagerName(number): string;
}
      `,
      options: ['never'],
    },
    {
      code: "declare const foo: number = 'asd';",
      options: ['always'],
    },

    {
      code: "const foo: number = 'asd';",
      options: ['always'],
    },
    {
      code: 'const foo: number;',
      options: ['never'],
    },
    {
      code: `
namespace myLib {
  let numberOfGreetings: number;
}
      `,
      options: ['never'],
    },
    {
      code: `
namespace myLib {
  let numberOfGreetings: number = 2;
}
      `,
      options: ['always'],
    },
    {
      code: `
declare namespace myLib1 {
  const foo: number;
  namespace myLib2 {
    let bar: string;
    namespace myLib3 {
      let baz: object;
    }
  }
}
      `,
      options: ['always'],
    },

    {
      code: `
declare namespace myLib1 {
  const foo: number;
  namespace myLib2 {
    let bar: string;
    namespace myLib3 {
      let baz: object;
    }
  }
}
      `,
      options: ['never'],
    },
  ],
  invalid: [
    // checking compatibility with base rule
    {
      code: 'var foo;',
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'foo' },
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 8,
        },
      ],
    },
    {
      code: 'for (var a in []) var foo;',
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'foo' },
          line: 1,
          column: 23,
          endLine: 1,
          endColumn: 26,
        },
      ],
    },
    {
      code: `
var foo,
  bar = false,
  baz;
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'foo' },
          line: 2,
          column: 5,
          endLine: 2,
          endColumn: 8,
        },
        {
          messageId: 'initialized',
          data: { idName: 'baz' },
          line: 4,
          column: 3,
          endLine: 4,
          endColumn: 6,
        },
      ],
    },
    {
      code: `
function foo() {
  var foo = 0;
  var bar;
}
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'bar' },
          line: 4,
          column: 7,
          endLine: 4,
          endColumn: 10,
        },
      ],
    },
    {
      code: `
function foo() {
  var foo;
  var bar = foo;
}
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'foo' },
          line: 3,
          column: 7,
          endLine: 3,
          endColumn: 10,
        },
      ],
    },
    {
      code: 'let a;',
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'a' },
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 6,
        },
      ],
    },
    {
      code: `
function foo() {
  let a = 1,
    b;
  if (a) {
    let c = 3,
      d = null;
  }
}
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'b' },
          line: 4,
          column: 5,
          endLine: 4,
          endColumn: 6,
        },
      ],
    },
    {
      code: `
function foo() {
  let a;
  const b = false;
  var c;
}
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'a' },
          line: 3,
          column: 7,
          endLine: 3,
          endColumn: 8,
        },
        {
          messageId: 'initialized',
          data: { idName: 'c' },
          line: 5,
          column: 7,
          endLine: 5,
          endColumn: 8,
        },
      ],
    },
    {
      code: 'var foo = (bar = 2);',
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'foo' },
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 20,
        },
      ],
    },
    {
      code: 'var foo = true;',
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'foo' },
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 15,
        },
      ],
    },
    {
      code: `
var foo,
  bar = 5,
  baz = 3;
      `,
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'bar' },
          line: 3,
          column: 3,
          endLine: 3,
          endColumn: 10,
        },
        {
          messageId: 'notInitialized',
          data: { idName: 'baz' },
          line: 4,
          column: 3,
          endLine: 4,
          endColumn: 10,
        },
      ],
    },
    {
      code: `
function foo() {
  var foo;
  var bar = foo;
}
      `,
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'bar' },
          line: 4,
          column: 7,
          endLine: 4,
          endColumn: 16,
        },
      ],
    },
    {
      code: 'let a = 1;',
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'a' },
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 10,
        },
      ],
    },
    {
      code: `
function foo() {
  let a = 'foo',
    b;
  if (a) {
    let c, d;
  }
}
      `,
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'a' },
          line: 3,
          column: 7,
          endLine: 3,
          endColumn: 16,
        },
      ],
    },
    {
      code: `
function foo() {
  let a;
  const b = false;
  var c = 1;
}
      `,
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'c' },
          line: 5,
          column: 7,
          endLine: 5,
          endColumn: 12,
        },
      ],
    },
    {
      code: 'for (var i = 0; i < 1; i++) {}',
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'i' },
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 15,
        },
      ],
    },
    {
      code: `
for (var foo in []) {
}
      `,
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'foo' },
          line: 2,
          column: 10,
          endLine: 2,
          endColumn: 13,
        },
      ],
    },
    {
      code: `
for (var foo of []) {
}
      `,
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'foo' },
          line: 2,
          column: 10,
          endLine: 2,
          endColumn: 13,
        },
      ],
    },
    {
      code: `
function foo() {
  var bar;
}
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'bar' },
          line: 3,
          column: 7,
          endLine: 3,
          endColumn: 10,
        },
      ],
    },

    // typescript-eslint
    {
      code: "let arr: string[] = ['arr', 'ar'];",
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'arr' },
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 34,
        },
      ],
    },
    {
      code: 'let arr: string = function () {};',
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'arr' },
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 33,
        },
      ],
    },
    {
      code: `
const class1 = class NAME {
  constructor() {
    var name1: string = 'hello';
  }
};
      `,
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'name1' },
          line: 4,
          column: 9,
          endLine: 4,
          endColumn: 32,
        },
      ],
    },
    {
      code: 'let arr: string;',
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'arr' },
          line: 1,
          column: 5,
          endLine: 1,
          endColumn: 8,
        },
      ],
    },
    {
      code: "declare var foo: number = 'asd';",
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'foo' },
          line: 1,
          column: 13,
          endLine: 1,
          endColumn: 32,
        },
      ],
    },
    {
      code: `
namespace myLib {
  let numberOfGreetings: number;
}
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'numberOfGreetings' },
          line: 3,
          column: 7,
          endLine: 3,
          endColumn: 24,
        },
      ],
    },
    {
      code: `
namespace myLib {
  let numberOfGreetings: number = 2;
}
      `,
      options: ['never'],
      errors: [
        {
          messageId: 'notInitialized',
          data: { idName: 'numberOfGreetings' },
          line: 3,
          column: 7,
          endLine: 3,
          endColumn: 36,
        },
      ],
    },
    {
      code: `
namespace myLib1 {
  const foo: number;
  namespace myLib2 {
    let bar: string;
    namespace myLib3 {
      let baz: object;
    }
  }
}
      `,
      options: ['always'],
      errors: [
        {
          messageId: 'initialized',
          data: { idName: 'foo' },
          line: 3,
          column: 9,
          endLine: 3,
          endColumn: 12,
        },
        {
          messageId: 'initialized',
          data: { idName: 'bar' },
          line: 5,
          column: 9,
          endLine: 5,
          endColumn: 12,
        },
        {
          messageId: 'initialized',
          data: { idName: 'baz' },
          line: 7,
          column: 11,
          endLine: 7,
          endColumn: 14,
        },
      ],
    },
  ],
});
