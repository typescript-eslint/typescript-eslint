// The following tests are adapted from the tests in eslint.
// Original Code: https://github.com/t-mangoe/eslint/blob/c4a70499720f48e27734068074fbeee4f48fb460/tests/lib/rules/no-shadow.js
// License      : https://github.com/eslint/eslint/blob/c4a70499720f48e27734068074fbeee4f48fb460/LICENSE

import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

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
          data: {
            name: 'x',
            shadowedColumn: 12,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
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
      errors: [
        {
          data: {
            name: 'x',
            shadowedColumn: 9,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'x',
            shadowedColumn: 12,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
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
          data: {
            name: 'x',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
        },
        {
          data: {
            name: 'b',
            shadowedColumn: 10,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
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
      errors: [
        {
          data: {
            name: 'x',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'x',
            shadowedColumn: 5,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 5,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 5,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 10,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 11,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
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
      errors: [
        {
          data: {
            name: 'a',
            shadowedColumn: 11,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 11,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
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
      errors: [
        {
          data: {
            name: 'a',
            shadowedColumn: 11,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
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
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
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
      errors: [
        {
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
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
      errors: [
        {
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 7,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'A',
            shadowedColumn: 7,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'a',
            shadowedColumn: 11,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
        },
        {
          data: {
            name: 'a',
            shadowedColumn: 12,
            shadowedLine: 3,
          },
          messageId: 'noShadow',
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
      errors: [
        {
          data: {
            name: 'Object',
          },
          messageId: 'noShadowGlobal',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'top',
          },
          messageId: 'noShadowGlobal',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
      languageOptions: { globals: { top: 'readonly' } },
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var Object = 0;',
      errors: [
        {
          data: {
            name: 'Object',
          },
          messageId: 'noShadowGlobal',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var top = 0;',
      errors: [
        {
          data: {
            name: 'top',
          },
          messageId: 'noShadowGlobal',
          type: AST_NODE_TYPES.Identifier,
        },
      ],
      languageOptions: {
        globals: { top: 'readonly' },
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      options: [{ builtinGlobals: true }],
    },
    {
      code: 'var Object = 0;',
      errors: [
        {
          data: {
            name: 'Object',
          },
          messageId: 'noShadowGlobal',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'top',
          },
          messageId: 'noShadowGlobal',
          type: AST_NODE_TYPES.Identifier,
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
          data: {
            name: 'cb',
            shadowedColumn: 14,
            shadowedLine: 2,
          },
          messageId: 'noShadow',
          type: AST_NODE_TYPES.Identifier,
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
