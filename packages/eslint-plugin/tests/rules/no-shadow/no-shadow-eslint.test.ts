/* eslint-disable @typescript-eslint/internal/no-multiple-lines-of-errors */

// The following tests are adapted from the tests in eslint.
// Original Code: https://github.com/t-mangoe/eslint/blob/c4a70499720f48e27734068074fbeee4f48fb460/tests/lib/rules/no-shadow.js
// License      : https://github.com/eslint/eslint/blob/c4a70499720f48e27734068074fbeee4f48fb460/LICENSE

import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/no-shadow';

const ruleTester = new RuleTester();

ruleTester.run('no-shadow', rule, {
  invalid: [
    {
      code: `
function a(x) {
  var b = function c() {
    var x = 'foo';
  };
}
      `,
      errors: [
        {
          column: 9,
          data: {
            name: 'x',
            shadowedColumn: 12,
            shadowedLine: 2,
          },
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
var a = x => {
  var b = () => {
    var x = 'foo';
  };
};
      `,
      errors: [
        {
          column: 9,
          data: {
            name: 'x',
            shadowedColumn: 9,
            shadowedLine: 2,
          },
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function a(x) {
  var b = function () {
    var x = 'foo';
  };
}
      `,
      errors: [
        {
          column: 9,
          data: {
            name: 'x',
            shadowedColumn: 12,
            shadowedLine: 2,
          },
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
var x = 1;
function a(x) {
  return ++x;
}
      `,
      errors: [
        {
          column: 12,
          data: {
            name: 'x',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
var a = 3;
function b() {
  var a = 10;
}
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
var a = 3;
function b() {
  var a = 10;
}
setTimeout(function () {
  b();
}, 0);
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
var a = 3;
function b() {
  var a = 10;
  var b = 0;
}
setTimeout(function () {
  b();
}, 0);
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
        {
          column: 7,
          data: {
            name: 'b',
            shadowedColumn: 10,
            shadowedLine: 3,
          },
          endColumn: 8,
          endLine: 5,
          line: 5,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
var x = 1;
{
  let x = 2;
}
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'x',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          endColumn: 8,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let x = 1;
{
  const x = 2;
}
      `,
      errors: [
        {
          column: 9,
          data: {
            name: 'x',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  let a;
}
function a() {}
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  const a = 0;
}
function a() {}
      `,
      errors: [
        {
          column: 9,
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  let a;
}
function a() {}
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  var a;
}
function a() {}
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo(a) {}
function a() {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 3,
          },
          endColumn: 15,
          endLine: 2,
          line: 2,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  let a;
}
let a;
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
{
  let a;
}
var a;
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
{
  let a;
}
function a() {}
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
{
  const a = 0;
}
const a = 1;
      `,
      errors: [
        {
          column: 9,
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 5,
          },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
{
  const a = 0;
}
var a;
      `,
      errors: [
        {
          column: 9,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
{
  const a = 0;
}
function a() {}
      `,
      errors: [
        {
          column: 9,
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
function foo() {
  let a;
}
let a;
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
function foo() {
  let a;
}
var a;
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
function foo() {
  let a;
}
function a() {}
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
function foo() {
  var a;
}
let a;
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
function foo() {
  var a;
}
var a;
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
function foo() {
  var a;
}
function a() {}
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          endColumn: 8,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
function foo(a) {}
let a;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 3,
          },
          endColumn: 15,
          endLine: 2,
          line: 2,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
function foo(a) {}
var a;
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 3,
          },
          endColumn: 15,
          endLine: 2,
          line: 2,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
function foo(a) {}
function a() {}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 3,
          },
          endColumn: 15,
          endLine: 2,
          line: 2,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'all' }],
    },
    {
      code: `
(function a() {
  function a() {}
})();
      `,
      errors: [
        {
          column: 12,
          data: {
            name: 'a',
            shadowedColumn: 11,
            shadowedLine: 2,
          },
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
(function a() {
  class a {}
})();
      `,
      errors: [
        {
          column: 9,
          data: {
            name: 'a',
            shadowedColumn: 11,
            shadowedLine: 2,
          },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function a() {
  (function a() {});
})();
      `,
      errors: [
        {
          column: 13,
          data: {
            name: 'a',
            shadowedColumn: 11,
            shadowedLine: 2,
          },
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
(function a() {
  (class a {});
})();
      `,
      errors: [
        {
          column: 10,
          data: {
            name: 'a',
            shadowedColumn: 11,
            shadowedLine: 2,
          },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function () {
  var a = function (a) {};
})();
      `,
      errors: [
        {
          column: 21,
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          endColumn: 22,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
(function () {
  var a = function () {
    function a() {}
  };
})();
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
(function () {
  var a = function () {
    class a {}
  };
})();
      `,
      errors: [
        {
          column: 11,
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          endColumn: 12,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function () {
  var a = function () {
    (function a() {});
  };
})();
      `,
      errors: [
        {
          column: 15,
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
(function () {
  var a = function () {
    (class a {});
  };
})();
      `,
      errors: [
        {
          column: 12,
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          endColumn: 13,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function () {
  var a = class {
    constructor() {
      class a {}
    }
  };
})();
      `,
      errors: [
        {
          column: 13,
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          endColumn: 14,
          endLine: 5,
          line: 5,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
class A {
  constructor() {
    var A;
  }
}
      `,
      errors: [
        {
          column: 9,
          data: {
            name: 'A',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          endColumn: 10,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function a() {
  function a() {
    function a() {}
  }
})();
      `,
      errors: [
        {
          column: 12,
          data: {
            name: 'a',
            shadowedColumn: 11,
            shadowedLine: 2,
          },
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
        {
          column: 14,
          data: {
            name: 'a',
            shadowedColumn: 12,
            shadowedLine: 3,
          },
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
function foo() {
  var Object = 0;
}
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'Object',
          },
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'noShadowGlobal',
        },
      ],
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
function foo() {
  var top = 0;
}
      `,
      errors: [
        {
          column: 7,
          data: {
            name: 'top',
          },
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'noShadowGlobal',
        },
      ],
      languageOptions: { globals: { top: 'readonly' } },
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var Object = 0;',
      errors: [
        {
          column: 5,
          data: {
            name: 'Object',
          },
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'noShadowGlobal',
        },
      ],
      languageOptions: {},
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var top = 0;',
      errors: [
        {
          column: 5,
          data: {
            name: 'top',
          },
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'noShadowGlobal',
        },
      ],
      languageOptions: {
        globals: { top: 'readonly' },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var Object = 0;',
      errors: [
        {
          column: 5,
          data: {
            name: 'Object',
          },
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'noShadowGlobal',
        },
      ],
      languageOptions: {
        parserOptions: { ecmaFeatures: { globalReturn: true } },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var top = 0;',
      errors: [
        {
          column: 5,
          data: {
            name: 'top',
          },
          endColumn: 8,
          endLine: 1,
          line: 1,
          messageId: 'noShadowGlobal',
        },
      ],
      languageOptions: {
        globals: { top: 'readonly' },
        parserOptions: { ecmaFeatures: { globalReturn: true } },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
function foo(cb) {
  (function (cb) {
    cb(42);
  })(cb);
}
      `,
      errors: [
        {
          column: 14,
          data: {
            name: 'cb',
            shadowedColumn: 14,
            shadowedLine: 2,
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
const FooBarComponent = memo(function FooBarComponent() {});
      `,
      errors: [
        {
          column: 39,
          data: {
            name: 'FooBarComponent',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          endColumn: 54,
          endLine: 2,
          line: 2,
          messageId: 'noShadow',
        },
      ],
    },
    {
      code: `
const FooBarComponent = memo(class FooBarComponent {});
      `,
      errors: [
        {
          column: 36,
          data: {
            name: 'FooBarComponent',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          endColumn: 51,
          endLine: 2,
          line: 2,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const FooBarComponent = memo(function FooBarComponent() {});
      `,
      errors: [
        {
          column: 39,
          data: {
            name: 'FooBarComponent',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          endColumn: 54,
          endLine: 2,
          line: 2,
          messageId: 'noShadow',
        },
      ],
      options: [{ ignoreOnInitialization: true }],
    },
    {
      code: `
function foo(a = wrap(function a() {})) {}
      `,
      errors: [
        {
          column: 32,
          data: {
            name: 'a',
            shadowedColumn: 14,
            shadowedLine: 2,
          },
          endColumn: 33,
          endLine: 2,
          line: 2,
          messageId: 'noShadow',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a = 1;
var b = function a() {};
      `,
      errors: [
        {
          column: 18,
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'noShadow',
        },
      ],
    },
  ],
  valid: [
    `
var a = 3;
function b(x) {
  a++;
  return x + a;
}
setTimeout(function () {
  b(a);
}, 0);
    `,
    `
(function () {
  var doSomething = function doSomething() {};
  doSomething();
})();
    `,
    {
      code: `
var a = foo || function a() {};
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a = foo ? function a() {} : bar;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo(a = function a() {}) {}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    `
var arguments;
function bar() {}
    `,
    {
      code: `
var a = 3;
var b = x => {
  a++;
  return x + a;
};
setTimeout(() => {
  b(a);
}, 0);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'class A {}',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
class A {
  constructor() {
    var a;
  }
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function () {
  var A = class A {};
})();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  var a;
}
var a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    }, // this case reports `no-redeclare`, not shadowing.
    {
      code: `
{
  let a;
}
let a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
{
  let a;
}
var a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
{
  let a;
}
function a() {}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
{
  const a = 0;
}
const a = 1;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
{
  const a = 0;
}
var a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
{
  const a = 0;
}
function a() {}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
function foo() {
  let a;
}
let a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
function foo() {
  let a;
}
var a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
function foo() {
  let a;
}
function a() {}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
function foo() {
  var a;
}
let a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
function foo() {
  var a;
}
var a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
function foo() {
  var a;
}
function a() {}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
function foo(a) {}
let a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
function foo(a) {}
var a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
function foo(a) {}
function a() {}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ hoist: 'never' }],
    },
    {
      code: `
{
  let a;
}
let a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  let a;
}
var a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  const a = 0;
}
const a = 1;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  const a = 0;
}
var a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  let a;
}
let a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  let a;
}
var a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  var a;
}
let a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  var a;
}
var a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo(a) {}
let a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo(a) {}
var a;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    `
function foo() {
  var Object = 0;
}
    `,
    {
      code: `
function foo() {
  var top = 0;
}
      `,
    },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: true }],
    },
    {
      code: `
function foo(cb) {
  (function (cb) {
    cb(42);
  })(cb);
}
      `,
      options: [{ allow: ['cb'] }],
    },
  ],
});
