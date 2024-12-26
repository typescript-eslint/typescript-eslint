import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/init-declarations';

const ruleTester = new RuleTester();

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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'let a = true;',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['always'],
    },
    {
      code: 'const a = {};',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['always'],
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['always'],
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['always'],
    },
    {
      code: `
function foo() {
  let a = 1;
  const b = false;
  var c = true;
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['always'],
    },
    {
      code: 'var foo;',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['never'],
    },
    {
      code: 'var foo, bar, baz;',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['never'],
    },
    {
      code: `
function foo() {
  var foo;
  var bar;
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['never'],
    },
    {
      code: 'let a;',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['never'],
    },
    {
      code: 'const a = 1;',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['never'],
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['never'],
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['never'],
    },
    {
      code: `
function foo() {
  let a;
  const b = false;
  var c;
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['never'],
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: ['never', { ignoreForLoopInit: true }],
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
      errors: [
        {
          column: 5,
          data: { idName: 'foo' },
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
    },
    {
      code: 'for (var a in []) var foo;',
      errors: [
        {
          column: 23,
          data: { idName: 'foo' },
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
    },
    {
      code: `
var foo,
  bar = false,
  baz;
      `,
      errors: [
        {
          column: 5,
          data: { idName: 'foo' },
          endColumn: 8,
          endLine: 2,
          line: 2,
          messageId: 'initialized',
        },
        {
          column: 3,
          data: { idName: 'baz' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
    },
    {
      code: `
function foo() {
  var foo = 0;
  var bar;
}
      `,
      errors: [
        {
          column: 7,
          data: { idName: 'bar' },
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
    },
    {
      code: `
function foo() {
  var foo;
  var bar = foo;
}
      `,
      errors: [
        {
          column: 7,
          data: { idName: 'foo' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
    },
    {
      code: 'let a;',
      errors: [
        {
          column: 5,
          data: { idName: 'a' },
          endColumn: 6,
          endLine: 1,
          line: 1,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
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
      errors: [
        {
          column: 5,
          data: { idName: 'b' },
          endColumn: 6,
          endLine: 4,
          line: 4,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
    },
    {
      code: `
function foo() {
  let a;
  const b = false;
  var c;
}
      `,
      errors: [
        {
          column: 7,
          data: { idName: 'a' },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'initialized',
        },
        {
          column: 7,
          data: { idName: 'c' },
          endColumn: 8,
          endLine: 5,
          line: 5,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
    },
    {
      code: 'var foo = (bar = 2);',
      errors: [
        {
          column: 5,
          data: { idName: 'foo' },
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
    },
    {
      code: 'var foo = true;',
      errors: [
        {
          column: 5,
          data: { idName: 'foo' },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
    },
    {
      code: `
var foo,
  bar = 5,
  baz = 3;
      `,
      errors: [
        {
          column: 3,
          data: { idName: 'bar' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'notInitialized',
        },
        {
          column: 3,
          data: { idName: 'baz' },
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
    },
    {
      code: `
function foo() {
  var foo;
  var bar = foo;
}
      `,
      errors: [
        {
          column: 7,
          data: { idName: 'bar' },
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
    },
    {
      code: 'let a = 1;',
      errors: [
        {
          column: 5,
          data: { idName: 'a' },
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
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
      errors: [
        {
          column: 7,
          data: { idName: 'a' },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
    },
    {
      code: `
function foo() {
  let a;
  const b = false;
  var c = 1;
}
      `,
      errors: [
        {
          column: 7,
          data: { idName: 'c' },
          endColumn: 12,
          endLine: 5,
          line: 5,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
    },
    {
      code: 'for (var i = 0; i < 1; i++) {}',
      errors: [
        {
          column: 10,
          data: { idName: 'i' },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
    },
    {
      code: `
for (var foo in []) {
}
      `,
      errors: [
        {
          column: 10,
          data: { idName: 'foo' },
          endColumn: 13,
          endLine: 2,
          line: 2,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
    },
    {
      code: `
for (var foo of []) {
}
      `,
      errors: [
        {
          column: 10,
          data: { idName: 'foo' },
          endColumn: 13,
          endLine: 2,
          line: 2,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
    },
    {
      code: `
function foo() {
  var bar;
}
      `,
      errors: [
        {
          column: 7,
          data: { idName: 'bar' },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
    },

    // typescript-eslint
    {
      code: "let arr: string[] = ['arr', 'ar'];",
      errors: [
        {
          column: 5,
          data: { idName: 'arr' },
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
    },
    {
      code: 'let arr: string = function () {};',
      errors: [
        {
          column: 5,
          data: { idName: 'arr' },
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'notInitialized',
        },
      ],
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
      errors: [
        {
          column: 9,
          data: { idName: 'name1' },
          endColumn: 32,
          endLine: 4,
          line: 4,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
    },
    {
      code: 'let arr: string;',
      errors: [
        {
          column: 5,
          data: { idName: 'arr' },
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
    },
    {
      code: `
namespace myLib {
  let numberOfGreetings: number;
}
      `,
      errors: [
        {
          column: 7,
          data: { idName: 'numberOfGreetings' },
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
    },
    {
      code: `
namespace myLib {
  let numberOfGreetings: number = 2;
}
      `,
      errors: [
        {
          column: 7,
          data: { idName: 'numberOfGreetings' },
          endColumn: 36,
          endLine: 3,
          line: 3,
          messageId: 'notInitialized',
        },
      ],
      options: ['never'],
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
      errors: [
        {
          column: 9,
          data: { idName: 'foo' },
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'initialized',
        },
        {
          column: 9,
          data: { idName: 'bar' },
          endColumn: 12,
          endLine: 5,
          line: 5,
          messageId: 'initialized',
        },
        {
          column: 11,
          data: { idName: 'baz' },
          endColumn: 14,
          endLine: 7,
          line: 7,
          messageId: 'initialized',
        },
      ],
      options: ['always'],
    },
  ],
});
