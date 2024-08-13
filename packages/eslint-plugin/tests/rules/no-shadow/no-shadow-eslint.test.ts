// The following tests are adapted from the tests in eslint.
// Original Code: https://github.com/t-mangoe/eslint/blob/c4a70499720f48e27734068074fbeee4f48fb460/tests/lib/rules/no-shadow.js
// License      : https://github.com/eslint/eslint/blob/c4a70499720f48e27734068074fbeee4f48fb460/LICENSE

import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../../src/rules/no-shadow';

const ruleTester = new RuleTester();

ruleTester.run('no-shadow', rule, {
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
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  let a;
}
var a;
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  let a;
}
function a() {}
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  const a = 0;
}
const a = 1;
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  const a = 0;
}
var a;
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
{
  const a = 0;
}
function a() {}
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  let a;
}
let a;
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  let a;
}
var a;
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  let a;
}
function a() {}
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  var a;
}
let a;
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  var a;
}
var a;
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  var a;
}
function a() {}
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo(a) {}
let a;
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo(a) {}
var a;
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo(a) {}
function a() {}
      `,
      options: [{ hoist: 'never' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
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
          messageId: 'noShadow',
          data: {
            name: 'x',
            shadowedLine: 2,
            shadowedColumn: 12,
          },
          type: AST_NODE_TYPES.Identifier,
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'x',
            shadowedLine: 2,
            shadowedColumn: 9,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
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
          messageId: 'noShadow',
          data: {
            name: 'x',
            shadowedLine: 2,
            shadowedColumn: 12,
          },
          type: AST_NODE_TYPES.Identifier,
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
          messageId: 'noShadow',
          data: {
            name: 'x',
            shadowedLine: 2,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
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
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 2,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
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
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 2,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
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
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 2,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
        {
          messageId: 'noShadow',
          data: {
            name: 'b',
            shadowedLine: 3,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'x',
            shadowedLine: 2,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
let x = 1;
{
  const x = 2;
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'x',
            shadowedLine: 2,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  let a;
}
function a() {}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  const a = 0;
}
function a() {}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  let a;
}
function a() {}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  var a;
}
function a() {}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo(a) {}
function a() {}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 3,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  let a;
}
let a;
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  let a;
}
var a;
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  let a;
}
function a() {}
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  const a = 0;
}
const a = 1;
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 7,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  const a = 0;
}
var a;
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
{
  const a = 0;
}
function a() {}
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  let a;
}
let a;
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  let a;
}
var a;
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  let a;
}
function a() {}
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  var a;
}
let a;
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  var a;
}
var a;
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  var a;
}
function a() {}
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 5,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo(a) {}
let a;
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 3,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo(a) {}
var a;
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 3,
            shadowedColumn: 5,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo(a) {}
function a() {}
      `,
      options: [{ hoist: 'all' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 3,
            shadowedColumn: 10,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function a() {
  function a() {}
})();
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 2,
            shadowedColumn: 11,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function a() {
  class a {}
})();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 2,
            shadowedColumn: 11,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function a() {
  (function a() {});
})();
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 2,
            shadowedColumn: 11,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function a() {
  (class a {});
})();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 2,
            shadowedColumn: 11,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
(function () {
  var a = function (a) {};
})();
      `,
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 3,
            shadowedColumn: 7,
          },
          type: AST_NODE_TYPES.Identifier,
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
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 3,
            shadowedColumn: 7,
          },
          type: AST_NODE_TYPES.Identifier,
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 3,
            shadowedColumn: 7,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
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
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 3,
            shadowedColumn: 7,
          },
          type: AST_NODE_TYPES.Identifier,
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 3,
            shadowedColumn: 7,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 3,
            shadowedColumn: 7,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
class A {
  constructor() {
    var A;
  }
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          messageId: 'noShadow',
          data: {
            name: 'A',
            shadowedLine: 2,
            shadowedColumn: 7,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
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
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 2,
            shadowedColumn: 11,
          },
          type: AST_NODE_TYPES.Identifier,
        },
        {
          messageId: 'noShadow',
          data: {
            name: 'a',
            shadowedLine: 3,
            shadowedColumn: 12,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  var Object = 0;
}
      `,
      options: [{ builtinGlobals: true }],
      errors: [
        {
          messageId: 'noShadowGlobal',
          data: {
            name: 'Object',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: `
function foo() {
  var top = 0;
}
      `,
      options: [{ builtinGlobals: true }],
      languageOptions: { globals: { top: 'readonly' } },
      errors: [
        {
          messageId: 'noShadowGlobal',
          data: {
            name: 'top',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var Object = 0;',
      options: [{ builtinGlobals: true }],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      errors: [
        {
          messageId: 'noShadowGlobal',
          data: {
            name: 'Object',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: true }],
      languageOptions: {
        globals: { top: 'readonly' },
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      errors: [
        {
          messageId: 'noShadowGlobal',
          data: {
            name: 'top',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var Object = 0;',
      options: [{ builtinGlobals: true }],
      languageOptions: {
        parserOptions: { ecmaFeatures: { globalReturn: true } },
      },
      errors: [
        {
          messageId: 'noShadowGlobal',
          data: {
            name: 'Object',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
    {
      code: 'var top = 0;',
      options: [{ builtinGlobals: true }],
      languageOptions: {
        globals: { top: 'readonly' },
        parserOptions: { ecmaFeatures: { globalReturn: true } },
      },
      errors: [
        {
          messageId: 'noShadowGlobal',
          data: {
            name: 'top',
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
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
          messageId: 'noShadow',
          data: {
            name: 'cb',
            shadowedLine: 2,
            shadowedColumn: 14,
          },
          type: AST_NODE_TYPES.Identifier,
        },
      ],
    },
  ],
});
