/* eslint-disable @typescript-eslint/internal/no-multiple-lines-of-errors */
// The following tests are adapted from the tests in eslint.
// Original Code: https://github.com/eslint/eslint/blob/eb76282e0a2db8aa10a3d5659f5f9237d9729121/tests/lib/rules/no-unused-vars.js
// License      : https://github.com/eslint/eslint/blob/eb76282e0a2db8aa10a3d5659f5f9237d9729121/LICENSE

import type { TestCaseError } from '@typescript-eslint/rule-tester';
import type { TSESTree } from '@typescript-eslint/utils';

import { RuleTester } from '@typescript-eslint/rule-tester';

import type { MessageIds } from '../../../src/rules/no-unused-vars';

import rule from '../../../src/rules/no-unused-vars';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      // espree defaults to `script`, so we need to mirror it
      sourceType: 'script',
    },
  },
});

ruleTester.defineRule('use-every-a', {
  create: context => {
    /**
     * Mark a variable as used
     */
    function useA(node: TSESTree.Node): void {
      context.sourceCode.markVariableAsUsed('a', node);
    }
    return {
      ReturnStatement: useA,
      VariableDeclaration: useA,
    };
  },
  defaultOptions: [],
  meta: {
    messages: {},
    schema: [],
    type: 'problem',
  },
});

/**
 * Returns an expected error for defined-but-not-used variables.
 * @param varName The name of the variable
 * @param [additional] The additional text for the message data
 * @param [type] The node type (defaults to "Identifier")
 * @returns An expected error object
 */
function definedError(
  varName: string,
  additional = '',
): TestCaseError<MessageIds> {
  return {
    data: {
      action: 'defined',
      additional,
      varName,
    },
    messageId: 'unusedVar',
  };
}

/**
 * Returns an expected error for assigned-but-not-used variables.
 * @param varName The name of the variable
 * @param [additional] The additional text for the message data
 * @param [type] The node type (defaults to "Identifier")
 * @returns An expected error object
 */
function assignedError(
  varName: string,
  additional = '',
): TestCaseError<MessageIds> {
  return {
    data: {
      action: 'assigned a value',
      additional,
      varName,
    },
    messageId: 'unusedVar',
  };
}

/**
 * Returns an expected error for used-but-ignored variables.
 * @param varName The name of the variable
 * @param [additional] The additional text for the message data
 * @returns An expected error object
 */
function usedIgnoredError(
  varName: string,
  additional = '',
): TestCaseError<MessageIds> {
  return {
    data: {
      additional,
      varName,
    },
    messageId: 'usedIgnoredVar',
  };
}

ruleTester.run('no-unused-vars', rule, {
  invalid: [
    {
      code: `
function foox() {
  return foox();
}
      `,
      errors: [definedError('foox')],
    },
    {
      code: `
(function () {
  function foox() {
    if (true) {
      return foox();
    }
  }
})();
      `,
      errors: [definedError('foox')],
    },
    {
      code: 'var a = 10;',
      errors: [assignedError('a')],
    },
    {
      code: `
function f() {
  var a = 1;
  return function () {
    f((a *= 2));
  };
}
      `,
      errors: [definedError('f')],
    },
    {
      code: `
function f() {
  var a = 1;
  return function () {
    f(++a);
  };
}
      `,
      errors: [definedError('f')],
    },
    {
      code: '/*global a */',
      errors: [definedError('a', '')],
    },
    {
      code: `
function foo(first, second) {
  doStuff(function () {
    console.log(second);
  });
}
      `,
      errors: [definedError('foo')],
    },
    {
      code: 'var a = 10;',
      errors: [assignedError('a')],
      options: ['all'],
    },
    {
      code: `
var a = 10;
a = 20;
      `,
      errors: [assignedError('a')],
      options: ['all'],
    },
    {
      code: `
var a = 10;
(function () {
  var a = 1;
  alert(a);
})();
      `,
      errors: [assignedError('a')],
      options: ['all'],
    },
    {
      code: `
var a = 10,
  b = 0,
  c = null;
alert(a + b);
      `,
      errors: [assignedError('c')],
      options: ['all'],
    },
    {
      code: `
var a = 10,
  b = 0,
  c = null;
setTimeout(function () {
  var b = 2;
  alert(a + b + c);
}, 0);
      `,
      errors: [assignedError('b')],
      options: ['all'],
    },
    {
      code: `
var a = 10,
  b = 0,
  c = null;
setTimeout(function () {
  var b = 2;
  var c = 2;
  alert(a + b + c);
}, 0);
      `,
      errors: [assignedError('b'), assignedError('c')],
      options: ['all'],
    },
    {
      code: `
function f() {
  var a = [];
  return a.map(function () {});
}
      `,
      errors: [definedError('f')],
      options: ['all'],
    },
    {
      code: `
function f() {
  var a = [];
  return a.map(function g() {});
}
      `,
      errors: [definedError('f')],
      options: ['all'],
    },
    {
      code: `
function foo() {
  function foo(x) {
    return x;
  }
  return function () {
    return foo;
  };
}
      `,
      errors: [
        {
          data: { action: 'defined', additional: '', varName: 'foo' },
          line: 2,
          messageId: 'unusedVar',
        },
      ],
    },
    {
      code: `
function f() {
  var x;
  function a() {
    x = 42;
  }
  function b() {
    alert(x);
  }
}
      `,
      errors: [definedError('f'), definedError('a'), definedError('b')],
      options: ['all'],
    },
    {
      code: `
function f(a) {}
f();
      `,
      errors: [definedError('a')],
      options: ['all'],
    },
    {
      code: `
function a(x, y, z) {
  return y;
}
a();
      `,
      errors: [definedError('z')],
      options: ['all'],
    },
    {
      code: 'var min = Math.min;',
      errors: [assignedError('min')],
      options: ['all'],
    },
    {
      code: 'var min = { min: 1 };',
      errors: [assignedError('min')],
      options: ['all'],
    },
    {
      code: `
Foo.bar = function (baz) {
  return 1;
};
      `,
      errors: [definedError('baz')],
      options: ['all'],
    },
    {
      code: 'var min = { min: 1 };',
      errors: [assignedError('min')],
      options: [{ vars: 'all' }],
    },
    {
      code: `
function gg(baz, bar) {
  return baz;
}
gg();
      `,
      errors: [definedError('bar')],
      options: [{ vars: 'all' }],
    },
    {
      code: `
(function (foo, baz, bar) {
  return baz;
})();
      `,
      errors: [definedError('bar')],
      options: [{ args: 'after-used', vars: 'all' }],
    },
    {
      code: `
(function (foo, baz, bar) {
  return baz;
})();
      `,
      errors: [definedError('foo'), definedError('bar')],
      options: [{ args: 'all', vars: 'all' }],
    },
    {
      code: `
(function z(foo) {
  var bar = 33;
})();
      `,
      errors: [definedError('foo'), assignedError('bar')],
      options: [{ args: 'all', vars: 'all' }],
    },
    {
      code: `
(function z(foo) {
  z();
})();
      `,
      errors: [definedError('foo')],
      options: [{}],
    },
    {
      code: `
function f() {
  var a = 1;
  return function () {
    f((a = 2));
  };
}
      `,
      errors: [definedError('f'), assignedError('a')],
      options: [{}],
    },
    {
      code: "import x from 'y';",
      errors: [definedError('x')],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },
    {
      code: `
export function fn2({ x, y }) {
  console.log(x);
}
      `,
      errors: [definedError('y')],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },
    {
      code: `
export function fn2(x, y) {
  console.log(x);
}
      `,
      errors: [definedError('y')],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },

    // exported
    {
      code: `
/*exported max*/ var max = 1,
  min = { min: 1 };
      `,
      errors: [assignedError('min')],
    },
    {
      code: '/*exported x*/ var { x, y } = z;',
      errors: [assignedError('y')],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // ignore pattern
    {
      code: `
var _a;
var b;
      `,
      errors: [
        {
          column: 5,
          data: {
            action: 'defined',
            additional: '. Allowed unused vars must match /^_/u',
            varName: 'b',
          },
          line: 3,
          messageId: 'unusedVar',
        },
      ],
      options: [{ vars: 'all', varsIgnorePattern: '^_' }],
    },
    {
      code: `
var a;
function foo() {
  var _b;
  var c_;
}
foo();
      `,
      errors: [
        {
          column: 7,
          data: {
            action: 'defined',
            additional: '. Allowed unused vars must match /^_/u',
            varName: 'c_',
          },
          line: 5,
          messageId: 'unusedVar',
        },
      ],
      options: [{ vars: 'local', varsIgnorePattern: '^_' }],
    },
    {
      code: `
function foo(a, _b) {}
foo();
      `,
      errors: [
        {
          column: 14,
          data: {
            action: 'defined',
            additional: '. Allowed unused args must match /^_/u',
            varName: 'a',
          },
          line: 2,
          messageId: 'unusedVar',
        },
      ],
      options: [{ args: 'all', argsIgnorePattern: '^_' }],
    },
    {
      code: `
function foo(a, _b, c) {
  return a;
}
foo();
      `,
      errors: [
        {
          column: 21,
          data: {
            action: 'defined',
            additional: '. Allowed unused args must match /^_/u',
            varName: 'c',
          },
          line: 2,
          messageId: 'unusedVar',
        },
      ],
      options: [{ args: 'after-used', argsIgnorePattern: '^_' }],
    },
    {
      code: `
function foo(_a) {}
foo();
      `,
      errors: [
        {
          column: 14,
          data: {
            action: 'defined',
            additional: '. Allowed unused args must match /[iI]gnored/u',
            varName: '_a',
          },
          line: 2,
          messageId: 'unusedVar',
        },
      ],
      options: [{ args: 'all', argsIgnorePattern: '[iI]gnored' }],
    },
    {
      code: 'var [firstItemIgnored, secondItem] = items;',
      errors: [
        {
          column: 24,
          data: {
            action: 'assigned a value',
            additional: '. Allowed unused vars must match /[iI]gnored/u',
            varName: 'secondItem',
          },
          line: 1,
          messageId: 'unusedVar',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ vars: 'all', varsIgnorePattern: '[iI]gnored' }],
    },

    // https://github.com/eslint/eslint/issues/15611
    {
      code: `
const array = ['a', 'b', 'c'];
const [a, _b, c] = array;
const newArray = [a, c];
      `,
      errors: [
        // should report only `newArray`
        { ...assignedError('newArray'), column: 7, line: 4 },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
const array = ['a', 'b', 'c', 'd', 'e'];
const [a, _b, c] = array;
      `,
      errors: [
        {
          ...assignedError(
            'a',
            '. Allowed unused elements of array destructuring must match /^_/u',
          ),
          column: 8,
          line: 3,
        },
        {
          ...assignedError(
            'c',
            '. Allowed unused elements of array destructuring must match /^_/u',
          ),
          column: 15,
          line: 3,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
const array = ['a', 'b', 'c'];
const [a, _b, c] = array;
const ignoreArray = ['ignore'];
      `,
      errors: [
        {
          ...assignedError(
            'a',
            '. Allowed unused elements of array destructuring must match /^_/u',
          ),
          column: 8,
          line: 3,
        },
        {
          ...assignedError(
            'c',
            '. Allowed unused elements of array destructuring must match /^_/u',
          ),
          column: 15,
          line: 3,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      options: [
        { destructuredArrayIgnorePattern: '^_', varsIgnorePattern: 'ignore' },
      ],
    },
    {
      code: `
const fooArray = ['foo'];
const ignoreArray = ['ignore'];
      `,
      errors: [
        {
          ...assignedError(
            'fooArray',
            '. Allowed unused vars must match /ignore/u',
          ),
          column: 7,
          line: 2,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      options: [
        { destructuredArrayIgnorePattern: '^_', varsIgnorePattern: 'ignore' },
      ],
    },
    {
      code: `
const barArray = ['bar'];
const ignoreArray = ['ignore'];
      `,
      errors: [
        {
          ...assignedError(
            'barArray',
            '. Allowed unused vars must match /ignore/u',
          ),
          column: 7,
          line: 2,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      options: [
        { destructuredArrayIgnorePattern: '^_', varsIgnorePattern: 'ignore' },
      ],
    },
    {
      code: `
const array = [obj];
const [{ _a, foo }] = array;
console.log(foo);
      `,
      errors: [
        {
          ...assignedError('_a'),
          column: 10,
          line: 3,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
function foo([{ _a, bar }]) {
  bar;
}
foo();
      `,
      errors: [
        {
          ...definedError('_a'),
          column: 17,
          line: 2,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
let _a, b;

foo.forEach(item => {
  [a, b] = item;
});
      `,
      errors: [
        {
          ...definedError('_a'),
          column: 5,
          line: 2,
        },
        {
          ...assignedError('b'),
          column: 9,
          line: 2,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },

    // for-in loops (see #2342)
    {
      code: `
(function (obj) {
  var name;
  for (name in obj) {
    i();
    return;
  }
})({});
      `,
      errors: [
        {
          column: 8,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'name',
          },
          line: 4,
          messageId: 'unusedVar',
        },
      ],
    },
    {
      code: `
(function (obj) {
  var name;
  for (name in obj) {
  }
})({});
      `,
      errors: [
        {
          column: 8,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'name',
          },
          line: 4,
          messageId: 'unusedVar',
        },
      ],
    },
    {
      code: `
(function (obj) {
  for (var name in obj) {
  }
})({});
      `,
      errors: [
        {
          column: 12,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'name',
          },
          line: 3,
          messageId: 'unusedVar',
        },
      ],
    },

    // For-of loops
    {
      code: `
(function (iter) {
  var name;
  for (name of iter) {
    i();
    return;
  }
})({});
      `,
      errors: [
        {
          column: 8,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'name',
          },
          line: 4,
          messageId: 'unusedVar',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function (iter) {
  var name;
  for (name of iter) {
  }
})({});
      `,
      errors: [
        {
          column: 8,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'name',
          },
          line: 4,
          messageId: 'unusedVar',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function (iter) {
  for (var name of iter) {
  }
})({});
      `,
      errors: [
        {
          column: 12,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'name',
          },
          line: 3,
          messageId: 'unusedVar',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // https://github.com/eslint/eslint/issues/3617
    {
      code: `
/* global foobar, foo, bar */
foobar;
      `,
      errors: [
        {
          column: 19,
          data: {
            action: 'defined',
            additional: '',
            varName: 'foo',
          },
          endColumn: 22,
          endLine: 2,
          line: 2,
          messageId: 'unusedVar',
        },
        {
          column: 24,
          data: {
            action: 'defined',
            additional: '',
            varName: 'bar',
          },
          endColumn: 27,
          endLine: 2,
          line: 2,
          messageId: 'unusedVar',
        },
      ],
    },
    {
      code: `
/* global foobar,
   foo,
   bar
 */
foobar;
      `,
      errors: [
        {
          column: 4,
          data: {
            action: 'defined',
            additional: '',
            varName: 'foo',
          },
          endColumn: 7,
          endLine: 3,
          line: 3,
          messageId: 'unusedVar',
        },
        {
          column: 4,
          data: {
            action: 'defined',
            additional: '',
            varName: 'bar',
          },
          endColumn: 7,
          endLine: 4,
          line: 4,
          messageId: 'unusedVar',
        },
      ],
    },

    // Rest property sibling without ignoreRestSiblings
    {
      code: `
const data = { type: 'coords', x: 1, y: 2 };
const { type, ...coords } = data;
console.log(coords);
      `,
      errors: [
        {
          column: 9,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'type',
          },
          line: 3,
          messageId: 'unusedVar',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
    },

    // Unused rest property with ignoreRestSiblings
    {
      code: `
const data = { type: 'coords', x: 2, y: 2 };
const { type, ...coords } = data;
console.log(type);
      `,
      errors: [
        {
          column: 18,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'coords',
          },
          line: 3,
          messageId: 'unusedVar',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      options: [{ ignoreRestSiblings: true }],
    },
    {
      code: `
let type, coords;
({ type, ...coords } = data);
console.log(type);
      `,
      errors: [
        {
          column: 13,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'coords',
          },
          line: 3,
          messageId: 'unusedVar',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      options: [{ ignoreRestSiblings: true }],
    },

    // Unused rest property without ignoreRestSiblings
    {
      code: `
const data = { type: 'coords', x: 3, y: 2 };
const { type, ...coords } = data;
console.log(type);
      `,
      errors: [
        {
          column: 18,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'coords',
          },
          line: 3,
          messageId: 'unusedVar',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
    },

    // Nested array destructuring with rest property
    {
      code: `
const data = { vars: ['x', 'y'], x: 1, y: 2 };
const {
  vars: [x],
  ...coords
} = data;
console.log(coords);
      `,
      errors: [
        {
          column: 10,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'x',
          },
          line: 4,
          messageId: 'unusedVar',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
    },

    // Nested object destructuring with rest property
    {
      code: `
const data = { defaults: { x: 0 }, x: 1, y: 2 };
const {
  defaults: { x },
  ...coords
} = data;
console.log(coords);
      `,
      errors: [
        {
          column: 15,
          data: {
            action: 'assigned a value',
            additional: '',
            varName: 'x',
          },
          line: 4,
          messageId: 'unusedVar',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
    },

    // https://github.com/eslint/eslint/issues/8119
    {
      code: '({ a, ...rest }) => {};',
      errors: [definedError('rest')],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      options: [{ args: 'all', ignoreRestSiblings: true }],
    },

    // https://github.com/eslint/eslint/issues/3714
    {
      code: `
/* global a$fooz,$foo */
a$fooz;
      `,
      errors: [
        {
          column: 18,
          data: {
            action: 'defined',
            additional: '',
            varName: '$foo',
          },
          endColumn: 22,
          endLine: 2,
          line: 2,
          messageId: 'unusedVar',
        },
      ],
    },
    {
      code: `
/* globals a$fooz, $ */
a$fooz;
      `,
      errors: [
        {
          column: 20,
          data: {
            action: 'defined',
            additional: '',
            varName: '$',
          },
          endColumn: 21,
          endLine: 2,
          line: 2,
          messageId: 'unusedVar',
        },
      ],
    },
    {
      code: '/*globals $foo*/',
      errors: [
        {
          column: 11,
          data: {
            action: 'defined',
            additional: '',
            varName: '$foo',
          },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'unusedVar',
        },
      ],
    },
    {
      code: '/* global global*/',
      errors: [
        {
          column: 11,
          data: {
            action: 'defined',
            additional: '',
            varName: 'global',
          },
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'unusedVar',
        },
      ],
    },
    {
      code: '/*global foo:true*/',
      errors: [
        {
          column: 10,
          data: {
            action: 'defined',
            additional: '',
            varName: 'foo',
          },
          endColumn: 13,
          endLine: 1,
          line: 1,
          messageId: 'unusedVar',
        },
      ],
    },

    // non ascii.
    {
      code: `
/*global 変数, 数*/

変数;
      `,
      errors: [
        {
          column: 14,
          data: {
            action: 'defined',
            additional: '',
            varName: '数',
          },
          endColumn: 15,
          endLine: 2,
          line: 2,
          messageId: 'unusedVar',
        },
      ],
    },

    // surrogate pair.
    {
      code: `
/*global 𠮷𩸽, 𠮷*/
𠮷𩸽;
      `,
      errors: [
        {
          column: 16,
          data: {
            action: 'defined',
            additional: '',
            varName: '𠮷',
          },
          endColumn: 18,
          endLine: 2,
          line: 2,
          messageId: 'unusedVar',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // https://github.com/eslint/eslint/issues/4047
    {
      code: 'export default function (a) {}',
      errors: [definedError('a')],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },
    {
      code: `
export default function (a, b) {
  console.log(a);
}
      `,
      errors: [definedError('b')],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },
    {
      code: 'export default (function (a) {});',
      errors: [definedError('a')],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },
    {
      code: `
export default (function (a, b) {
  console.log(a);
});
      `,
      errors: [definedError('b')],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },
    {
      code: 'export default a => {};',
      errors: [definedError('a')],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },
    {
      code: `
export default (a, b) => {
  console.log(a);
};
      `,
      errors: [definedError('b')],
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },

    // caughtErrors
    {
      code: `
try {
} catch (err) {}
      `,
      errors: [definedError('err')],
    },
    {
      code: `
try {
} catch (err) {}
      `,
      errors: [definedError('err')],
      options: [{ caughtErrors: 'all' }],
    },
    {
      code: `
try {
} catch (err) {}
      `,
      errors: [
        definedError(
          'err',
          '. Allowed unused caught errors must match /^ignore/u',
        ),
      ],
      options: [{ caughtErrors: 'all', caughtErrorsIgnorePattern: '^ignore' }],
    },
    {
      code: `
try {
} catch (err) {}
      `,
      errors: [definedError('err')],
      options: [{ caughtErrors: 'all', varsIgnorePattern: '^err' }],
    },
    {
      code: `
try {
} catch (err) {}
      `,
      errors: [definedError('err')],
      options: [{ caughtErrors: 'all', varsIgnorePattern: '^.' }],
    },

    // multiple try catch with one success
    {
      code: `
try {
} catch (ignoreErr) {}
try {
} catch (err) {}
      `,
      errors: [
        definedError(
          'err',
          '. Allowed unused caught errors must match /^ignore/u',
        ),
      ],
      options: [{ caughtErrors: 'all', caughtErrorsIgnorePattern: '^ignore' }],
    },

    // multiple try catch both fail
    {
      code: `
try {
} catch (error) {}
try {
} catch (err) {}
      `,
      errors: [
        definedError(
          'error',
          '. Allowed unused caught errors must match /^ignore/u',
        ),
        definedError(
          'err',
          '. Allowed unused caught errors must match /^ignore/u',
        ),
      ],
      options: [{ caughtErrors: 'all', caughtErrorsIgnorePattern: '^ignore' }],
    },

    // caughtErrors with other configs
    {
      code: `
try {
} catch (err) {}
      `,
      errors: [definedError('err')],
      options: [{ args: 'all', caughtErrors: 'all', vars: 'all' }],
    },

    // no conflict in ignore patterns
    {
      code: `
try {
} catch (err) {}
      `,
      errors: [definedError('err')],
      options: [
        {
          args: 'all',
          argsIgnorePattern: '^er',
          caughtErrors: 'all',
          vars: 'all',
        },
      ],
    },

    // Ignore reads for modifications to itself: https://github.com/eslint/eslint/issues/6348
    {
      code: `
var a = 0;
a = a + 1;
      `,
      errors: [assignedError('a')],
    },
    {
      code: `
var a = 0;
a = a + a;
      `,
      errors: [assignedError('a')],
    },
    {
      code: `
var a = 0;
a += a + 1;
      `,
      errors: [assignedError('a')],
    },
    {
      code: `
var a = 0;
a++;
      `,
      errors: [assignedError('a')],
    },
    {
      code: `
function foo(a) {
  a = a + 1;
}
foo();
      `,
      errors: [assignedError('a')],
    },
    {
      code: `
function foo(a) {
  a += a + 1;
}
foo();
      `,
      errors: [assignedError('a')],
    },
    {
      code: `
function foo(a) {
  a++;
}
foo();
      `,
      errors: [assignedError('a')],
    },
    {
      code: `
var a = 3;
a = a * 5 + 6;
      `,
      errors: [assignedError('a')],
    },
    {
      code: `
var a = 2,
  b = 4;
a = a * 2 + b;
      `,
      errors: [assignedError('a')],
    },

    // https://github.com/eslint/eslint/issues/6576 (For coverage)
    {
      code: `
function foo(cb) {
  cb = function (a) {
    cb(1 + a);
  };
  bar(not_cb);
}
foo();
      `,
      errors: [assignedError('cb')],
    },
    {
      code: `
function foo(cb) {
  cb = (function (a) {
    return cb(1 + a);
  })();
}
foo();
      `,
      errors: [assignedError('cb')],
    },
    {
      code: `
function foo(cb) {
  cb =
    (function (a) {
      cb(1 + a);
    },
    cb);
}
foo();
      `,
      errors: [assignedError('cb')],
    },
    {
      code: `
function foo(cb) {
  cb =
    (0,
    function (a) {
      cb(1 + a);
    });
}
foo();
      `,
      errors: [assignedError('cb')],
    },

    // https://github.com/eslint/eslint/issues/6646
    {
      code: `
while (a) {
  function foo(b) {
    b = b + 1;
  }
  foo();
}
      `,
      errors: [assignedError('b')],
    },

    // https://github.com/eslint/eslint/issues/7124
    {
      code: '(function (a, b, c) {});',
      errors: [
        definedError('a', '. Allowed unused args must match /c/u'),
        definedError('b', '. Allowed unused args must match /c/u'),
      ],
      options: [{ argsIgnorePattern: 'c' }],
    },
    {
      code: '(function (a, b, { c, d }) {});',
      errors: [
        definedError('a', '. Allowed unused args must match /[cd]/u'),
        definedError('b', '. Allowed unused args must match /[cd]/u'),
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ argsIgnorePattern: '[cd]' }],
    },
    {
      code: '(function (a, b, { c, d }) {});',
      errors: [
        definedError('a', '. Allowed unused args must match /c/u'),
        definedError('b', '. Allowed unused args must match /c/u'),
        definedError('d', '. Allowed unused args must match /c/u'),
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ argsIgnorePattern: 'c' }],
    },
    {
      code: '(function (a, b, { c, d }) {});',
      errors: [
        definedError('a', '. Allowed unused args must match /d/u'),
        definedError('b', '. Allowed unused args must match /d/u'),
        definedError('c', '. Allowed unused args must match /d/u'),
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ argsIgnorePattern: 'd' }],
    },
    {
      code: `
/*global
foo*/
      `,
      errors: [
        {
          column: 1,
          data: {
            action: 'defined',
            additional: '',
            varName: 'foo',
          },
          endColumn: 4,
          endLine: 3,
          line: 3,
          messageId: 'unusedVar',
        },
      ],
    },

    // https://github.com/eslint/eslint/issues/8442
    {
      code: `
(function ({ a }, b) {
  return b;
})();
      `,
      errors: [definedError('a')],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
(function ({ a }, { b, c }) {
  return b;
})();
      `,
      errors: [definedError('a'), definedError('c')],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },

    // https://github.com/eslint/eslint/issues/14325
    {
      code: `
let x = 0;
(x++, (x = 0));
      `,
      errors: [{ ...assignedError('x'), column: 8, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let x = 0;
(x++, (x = 0));
x = 3;
      `,
      errors: [{ ...assignedError('x'), column: 1, line: 4 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let x = 0;
(x++, 0);
      `,
      errors: [{ ...assignedError('x'), column: 2, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let x = 0;
(0, x++);
      `,
      errors: [{ ...assignedError('x'), column: 5, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let x = 0;
(0, (1, x++));
      `,
      errors: [{ ...assignedError('x'), column: 9, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let x = 0;
foo = (x++, 0);
      `,
      errors: [{ ...assignedError('x'), column: 8, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let x = 0;
foo = ((0, x++), 0);
      `,
      errors: [{ ...assignedError('x'), column: 12, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let x = 0;
((x += 1), 0);
      `,
      errors: [{ ...assignedError('x'), column: 3, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let x = 0;
(0, (x += 1));
      `,
      errors: [{ ...assignedError('x'), column: 6, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let x = 0;
(0, (1, (x += 1)));
      `,
      errors: [{ ...assignedError('x'), column: 10, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let x = 0;
foo = ((x += 1), 0);
      `,
      errors: [{ ...assignedError('x'), column: 9, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let x = 0;
foo = ((0, (x += 1)), 0);
      `,
      errors: [{ ...assignedError('x'), column: 13, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },

    // https://github.com/eslint/eslint/issues/14866
    {
      code: `
let z = 0;
((z = z + 1), (z = 2));
      `,
      errors: [{ ...assignedError('z'), column: 16, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },
    {
      code: `
let z = 0;
((z = z + 1), (z = 2));
z = 3;
      `,
      errors: [{ ...assignedError('z'), column: 1, line: 4 }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },
    {
      code: `
let z = 0;
((z = z + 1), (z = 2));
z = z + 3;
      `,
      errors: [{ ...assignedError('z'), column: 1, line: 4 }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },
    {
      code: `
let x = 0;
(0, (x = x + 1));
      `,
      errors: [{ ...assignedError('x'), column: 6, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },
    {
      code: `
let x = 0;
((x = x + 1), 0);
      `,
      errors: [{ ...assignedError('x'), column: 3, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },
    {
      code: `
let x = 0;
foo = ((0, (x = x + 1)), 0);
      `,
      errors: [{ ...assignedError('x'), column: 13, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },
    {
      code: `
let x = 0;
foo = ((x = x + 1), 0);
      `,
      errors: [{ ...assignedError('x'), column: 9, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },
    {
      code: `
let x = 0;
(0, (1, (x = x + 1)));
      `,
      errors: [{ ...assignedError('x'), column: 10, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },
    {
      code: `
(function ({ a, b }, { c }) {
  return b;
})();
      `,
      errors: [definedError('a'), definedError('c')],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
(function ([a], b) {
  return b;
})();
      `,
      errors: [definedError('a')],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
(function ([a], [b, c]) {
  return b;
})();
      `,
      errors: [definedError('a'), definedError('c')],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
(function ([a, b], [c]) {
  return b;
})();
      `,
      errors: [definedError('a'), definedError('c')],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },

    // https://github.com/eslint/eslint/issues/9774
    {
      code: '(function (_a) {})();',
      errors: [definedError('_a')],
      options: [{ args: 'all', varsIgnorePattern: '^_' }],
    },
    {
      code: '(function (_a) {})();',
      errors: [definedError('_a')],
      options: [{ args: 'all', caughtErrorsIgnorePattern: '^_' }],
    },

    // https://github.com/eslint/eslint/issues/10982
    {
      code: `
var a = function () {
  a();
};
      `,
      errors: [assignedError('a')],
    },
    {
      code: `
var a = function () {
  return function () {
    a();
  };
};
      `,
      errors: [{ ...assignedError('a'), column: 5, line: 2 }],
    },
    {
      code: `
const a = () => () => {
  a();
};
      `,
      errors: [{ ...assignedError('a'), column: 7, line: 2 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let myArray = [1, 2, 3, 4].filter(x => x == 0);
myArray = myArray.filter(x => x == 1);
      `,
      errors: [{ ...assignedError('myArray'), column: 1, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
const a = 1;
a += 1;
      `,
      errors: [{ ...assignedError('a'), column: 1, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
const a = () => {
  a();
};
      `,
      errors: [{ ...assignedError('a'), column: 7, line: 2 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },

    // https://github.com/eslint/eslint/issues/14324
    {
      code: `
let x = [];
x = x.concat(x);
      `,
      errors: [{ ...assignedError('x'), column: 1, line: 3 }],
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
let a = 'a';
a = 10;
function foo() {
  a = 11;
  a = () => {
    a = 13;
  };
}
      `,
      errors: [
        {
          ...assignedError('a'),
          column: 1,
          line: 3,
        },
        {
          ...definedError('foo'),
          column: 10,
          line: 4,
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },
    {
      code: `
let foo;
init();
foo = foo + 2;
function init() {
  foo = 1;
}
      `,
      errors: [{ ...assignedError('foo'), column: 1, line: 4 }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },
    {
      code: `
function foo(n) {
  if (n < 2) return 1;
  return n * foo(n - 1);
}
      `,
      errors: [{ ...definedError('foo'), column: 10, line: 2 }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },
    {
      code: `
let c = 'c';
c = 10;
function foo1() {
  c = 11;
  c = () => {
    c = 13;
  };
}

c = foo1;
      `,
      errors: [{ ...assignedError('c'), column: 1, line: 11 }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
    },

    // ignore class with static initialization block https://github.com/eslint/eslint/issues/17772
    {
      code: `
class Foo {
  static {}
}
      `,
      errors: [{ ...definedError('Foo'), column: 7, line: 2 }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [{ ignoreClassWithStaticInitBlock: false }],
    },
    {
      code: `
class Foo {
  static {}
}
      `,
      errors: [{ ...definedError('Foo'), column: 7, line: 2 }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: `
class Foo {
  static {
    var bar;
  }
}
      `,
      errors: [{ ...definedError('bar'), column: 9, line: 4 }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [{ ignoreClassWithStaticInitBlock: true }],
    },
    {
      code: 'class Foo {}',
      errors: [{ ...definedError('Foo'), column: 7, line: 1 }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [{ ignoreClassWithStaticInitBlock: true }],
    },
    {
      code: `
class Foo {
  static bar;
}
      `,
      errors: [{ ...definedError('Foo'), column: 7, line: 2 }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [{ ignoreClassWithStaticInitBlock: true }],
    },
    {
      code: `
class Foo {
  static bar() {}
}
      `,
      errors: [{ ...definedError('Foo'), column: 7, line: 2 }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [{ ignoreClassWithStaticInitBlock: true }],
    },

    // https://github.com/eslint/eslint/issues/17568
    {
      code: `
const _a = 5;
const _b = _a + 5;
      `,
      errors: [usedIgnoredError('_a', '. Used vars must not match /^_/u')],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [
        {
          args: 'all',
          reportUsedIgnorePattern: true,
          varsIgnorePattern: '^_',
        },
      ],
    },
    {
      code: `
const _a = 42;
foo(() => _a);
      `,
      errors: [usedIgnoredError('_a', '. Used vars must not match /^_/u')],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [
        {
          args: 'all',
          reportUsedIgnorePattern: true,
          varsIgnorePattern: '^_',
        },
      ],
    },
    {
      code: `
(function foo(_a) {
  return _a + 5;
})(5);
      `,
      errors: [usedIgnoredError('_a', '. Used args must not match /^_/u')],
      options: [
        {
          args: 'all',
          argsIgnorePattern: '^_',
          reportUsedIgnorePattern: true,
        },
      ],
    },
    {
      code: `
const [a, _b] = items;
console.log(a + _b);
      `,
      errors: [
        usedIgnoredError(
          '_b',
          '. Used elements of array destructuring must not match /^_/u',
        ),
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [
        {
          destructuredArrayIgnorePattern: '^_',
          reportUsedIgnorePattern: true,
        },
      ],
    },
    {
      code: `
let _x;
[_x] = arr;
foo(_x);
      `,
      errors: [
        usedIgnoredError(
          '_x',
          '. Used elements of array destructuring must not match /^_/u',
        ),
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [
        {
          destructuredArrayIgnorePattern: '^_',
          reportUsedIgnorePattern: true,
          varsIgnorePattern: '[iI]gnored',
        },
      ],
    },
    {
      code: `
const [ignored] = arr;
foo(ignored);
      `,
      errors: [
        usedIgnoredError('ignored', '. Used vars must not match /[iI]gnored/u'),
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [
        {
          destructuredArrayIgnorePattern: '^_',
          reportUsedIgnorePattern: true,
          varsIgnorePattern: '[iI]gnored',
        },
      ],
    },
    {
      code: `
try {
} catch (_err) {
  console.error(_err);
}
      `,
      errors: [
        usedIgnoredError('_err', '. Used caught errors must not match /^_/u'),
      ],
      options: [
        {
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          reportUsedIgnorePattern: true,
        },
      ],
    },
    {
      code: `
try {
} catch (_) {
  _ = 'foo';
}
      `,
      errors: [
        assignedError('_', '. Allowed unused caught errors must match /foo/u'),
      ],
      options: [{ caughtErrorsIgnorePattern: 'foo' }],
    },
    {
      code: `
try {
} catch (_) {
  _ = 'foo';
}
      `,
      errors: [
        assignedError(
          '_',
          '. Allowed unused caught errors must match /ignored/u',
        ),
      ],
      options: [
        {
          caughtErrorsIgnorePattern: 'ignored',
          varsIgnorePattern: '_',
        },
      ],
    },
    {
      code: `
try {
} catch ({ message, errors: [firstError] }) {}
      `,
      errors: [
        {
          ...definedError(
            'message',
            '. Allowed unused caught errors must match /foo/u',
          ),
          column: 12,
          endColumn: 19,
        },
        {
          ...definedError(
            'firstError',
            '. Allowed unused caught errors must match /foo/u',
          ),
          column: 30,
          endColumn: 40,
        },
      ],
      options: [{ caughtErrorsIgnorePattern: 'foo' }],
    },
    {
      code: `
try {
} catch ({ stack: $ }) {
  $ = 'Something broke: ' + $;
}
      `,
      errors: [
        {
          ...assignedError(
            '$',
            '. Allowed unused caught errors must match /\\w/u',
          ),
          column: 3,
          endColumn: 4,
        },
      ],
      options: [{ caughtErrorsIgnorePattern: '\\w' }],
    },
    {
      code: `
_ => {
  _ = _ + 1;
};
      `,
      errors: [
        assignedError('_', '. Allowed unused args must match /ignored/u'),
      ],
      options: [
        {
          argsIgnorePattern: 'ignored',
          varsIgnorePattern: '_',
        },
      ],
    },
  ],
  valid: [
    `
var foo = 5;

label: while (true) {
  console.log(foo);
  break label;
}
    `,
    `
var foo = 5;

while (true) {
  console.log(foo);
  break;
}
    `,
    {
      code: `
for (let prop in box) {
  box[prop] = parseInt(box[prop]);
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    `
var box = { a: 2 };
for (var prop in box) {
  box[prop] = parseInt(box[prop]);
}
    `,
    `
f({
  set foo(a) {
    return;
  },
});
    `,
    {
      code: `
a;
var a;
      `,
      options: ['all'],
    },
    {
      code: `
var a = 10;
alert(a);
      `,
      options: ['all'],
    },
    {
      code: `
var a = 10;
(function () {
  alert(a);
})();
      `,
      options: ['all'],
    },
    {
      code: `
var a = 10;
(function () {
  setTimeout(function () {
    alert(a);
  }, 0);
})();
      `,
      options: ['all'],
    },
    {
      code: `
var a = 10;
d[a] = 0;
      `,
      options: ['all'],
    },
    {
      code: `
(function () {
  var a = 10;
  return a;
})();
      `,
      options: ['all'],
    },
    {
      code: '(function g() {})();',
      options: ['all'],
    },
    {
      code: `
function f(a) {
  alert(a);
}
f();
      `,
      options: ['all'],
    },
    {
      code: `
var c = 0;
function f(a) {
  var b = a;
  return b;
}
f(c);
      `,
      options: ['all'],
    },
    {
      code: `
function a(x, y) {
  return y;
}
a();
      `,
      options: ['all'],
    },
    {
      code: `
var arr1 = [1, 2];
var arr2 = [3, 4];
for (var i in arr1) {
  arr1[i] = 5;
}
for (var i in arr2) {
  arr2[i] = 10;
}
      `,
      options: ['all'],
    },
    {
      code: 'var a = 10;',
      options: ['local'],
    },
    {
      code: `
var min = 'min';
Math[min];
      `,
      options: ['all'],
    },
    {
      code: `
Foo.bar = function (baz) {
  return baz;
};
      `,
      options: ['all'],
    },
    'myFunc(function foo() {}.bind(this));',
    'myFunc(function foo() {}.toString());',
    `
function foo(first, second) {
  doStuff(function () {
    console.log(second);
  });
}
foo();
    `,
    `
(function () {
  var doSomething = function doSomething() {};
  doSomething();
})();
    `,
    '/*global a */ a;',
    {
      code: `
var a = 10;
(function () {
  alert(a);
})();
      `,
      options: [{ vars: 'all' }],
    },
    {
      code: `
function g(bar, baz) {
  return baz;
}
g();
      `,
      options: [{ vars: 'all' }],
    },
    {
      code: `
function g(bar, baz) {
  return baz;
}
g();
      `,
      options: [{ args: 'after-used', vars: 'all' }],
    },
    {
      code: `
function g(bar, baz) {
  return bar;
}
g();
      `,
      options: [{ args: 'none', vars: 'all' }],
    },
    {
      code: `
function g(bar, baz) {
  return 2;
}
g();
      `,
      options: [{ args: 'none', vars: 'all' }],
    },
    {
      code: `
function g(bar, baz) {
  return bar + baz;
}
g();
      `,
      options: [{ args: 'all', vars: 'local' }],
    },
    {
      code: `
var g = function (bar, baz) {
  return 2;
};
g();
      `,
      options: [{ args: 'none', vars: 'all' }],
    },
    `
(function z() {
  z();
})();
    `,
    {
      code: ' ',
      languageOptions: { globals: { a: true } },
    },
    {
      code: `
var who = 'Paul';
module.exports = \`Hello \${who}!\`;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: 'export var foo = 123;',
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },
    {
      code: 'export function foo() {}',
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },
    {
      code: `
let toUpper = partial => partial.toUpperCase;
export { toUpper };
      `,
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },
    {
      code: 'export class foo {}',
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
    },
    {
      code: `
class Foo {}
var x = new Foo();
x.foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const foo = 'hello!';
function bar(foobar = foo) {
  foobar.replace(/!$/, ' world!');
}
bar();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    `
function Foo() {}
var x = new Foo();
x.foo();
    `,
    `
function foo() {
  var foo = 1;
  return foo;
}
foo();
    `,
    `
function foo(foo) {
  return foo;
}
foo(1);
    `,
    `
function foo() {
  function foo() {
    return 1;
  }
  return foo();
}
foo();
    `,
    {
      code: `
function foo() {
  var foo = 1;
  return foo;
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo(foo) {
  return foo;
}
foo(1);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo() {
  function foo() {
    return 1;
  }
  return foo();
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const x = 1;
const [y = x] = [];
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const x = 1;
const { y = x } = {};
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const x = 1;
const {
  z: [y = x],
} = {};
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const x = [];
const { z: [y] = x } = {};
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const x = 1;
let y;
[y = x] = [];
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const x = 1;
let y;
({
  z: [y = x],
} = {});
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const x = [];
let y;
({ z: [y] = x } = {});
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const x = 1;
function foo(y = x) {
  bar(y);
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const x = 1;
function foo({ y = x } = {}) {
  bar(y);
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const x = 1;
function foo(
  y = function (z = x) {
    bar(z);
  },
) {
  y();
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const x = 1;
function foo(
  y = function () {
    bar(x);
  },
) {
  y();
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var x = 1;
var [y = x] = [];
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var x = 1;
var { y = x } = {};
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var x = 1;
var {
  z: [y = x],
} = {};
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var x = [];
var { z: [y] = x } = {};
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var x = 1,
  y;
[y = x] = [];
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var x = 1,
  y;
({
  z: [y = x],
} = {});
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var x = [],
  y;
({ z: [y] = x } = {});
foo(y);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var x = 1;
function foo(y = x) {
  bar(y);
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var x = 1;
function foo({ y = x } = {}) {
  bar(y);
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var x = 1;
function foo(
  y = function (z = x) {
    bar(z);
  },
) {
  y();
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var x = 1;
function foo(
  y = function () {
    bar(x);
  },
) {
  y();
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // exported variables should work
    "/*exported toaster*/ var toaster = 'great';",
    `
/*exported toaster, poster*/ var toaster = 1;
poster = 0;
    `,
    {
      code: '/*exported x*/ var { x } = y;',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: '/*exported x, y*/ var { x, y } = z;',
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // Can mark variables as used via context.markVariableAsUsed()
    '/*eslint @rule-tester/use-every-a:1*/ var a;',
    `
/*eslint @rule-tester/use-every-a:1*/ !function (a) {
  return 1;
};
    `,
    `
/*eslint @rule-tester/use-every-a:1*/ !function () {
  var a;
  return 1;
};
    `,

    // ignore pattern
    {
      code: 'var _a;',
      options: [{ vars: 'all', varsIgnorePattern: '^_' }],
    },
    {
      code: `
var a;
function foo() {
  var _b;
}
foo();
      `,
      options: [{ vars: 'local', varsIgnorePattern: '^_' }],
    },
    {
      code: `
function foo(_a) {}
foo();
      `,
      options: [{ args: 'all', argsIgnorePattern: '^_' }],
    },
    {
      code: `
function foo(a, _b) {
  return a;
}
foo();
      `,
      options: [{ args: 'after-used', argsIgnorePattern: '^_' }],
    },
    {
      code: `
var [firstItemIgnored, secondItem] = items;
console.log(secondItem);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ vars: 'all', varsIgnorePattern: '[iI]gnored' }],
    },
    {
      code: `
const [a, _b, c] = items;
console.log(a + c);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
const [[a, _b, c]] = items;
console.log(a + c);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
const {
  x: [_a, foo],
} = bar;
console.log(foo);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
function baz([_b, foo]) {
  foo;
}
baz();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
function baz({ x: [_b, foo] }) {
  foo;
}
baz();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
function baz([
  {
    x: [_b, foo],
  },
]) {
  foo;
}
baz();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
let _a, b;
foo.forEach(item => {
  [_a, b] = item;
  doSomething(b);
});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
// doesn't report _x
let _x, y;
_x = 1;
[_x, y] = foo;
y;

// doesn't report _a
let _a, b;
[_a, b] = foo;
_a = 1;
b;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      options: [{ destructuredArrayIgnorePattern: '^_' }],
    },
    {
      code: `
// doesn't report _x
let _x, y;
_x = 1;
[_x, y] = foo;
y;

// doesn't report _a
let _a, b;
_a = 1;
({ _a, ...b } = foo);
b;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      options: [
        { destructuredArrayIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },

    // for-in loops (see #2342)
    `
(function (obj) {
  var name;
  for (name in obj) return;
})({});
    `,
    `
(function (obj) {
  var name;
  for (name in obj) {
    return;
  }
})({});
    `,
    `
(function (obj) {
  for (var name in obj) {
    return true;
  }
})({});
    `,
    `
(function (obj) {
  for (var name in obj) return true;
})({});
    `,

    {
      code: `
(function (obj) {
  let name;
  for (name in obj) return;
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function (obj) {
  let name;
  for (name in obj) {
    return;
  }
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function (obj) {
  for (let name in obj) {
    return true;
  }
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function (obj) {
  for (let name in obj) return true;
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    {
      code: `
(function (obj) {
  for (const name in obj) {
    return true;
  }
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function (obj) {
  for (const name in obj) return true;
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // For-of loops
    {
      code: `
(function (iter) {
  let name;
  for (name of iter) return;
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function (iter) {
  let name;
  for (name of iter) {
    return;
  }
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function (iter) {
  for (let name of iter) {
    return true;
  }
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function (iter) {
  for (let name of iter) return true;
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    {
      code: `
(function (iter) {
  for (const name of iter) {
    return true;
  }
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function (iter) {
  for (const name of iter) return true;
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // Sequence Expressions (See https://github.com/eslint/eslint/issues/14325)
    {
      code: `
let x = 0;
foo = (0, x++);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let x = 0;
foo = (0, (x += 1));
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let x = 0;
foo = (0, (x = x + 1));
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // caughtErrors
    {
      code: `
try {
} catch (err) {}
      `,
      options: [{ caughtErrors: 'none' }],
    },
    {
      code: `
try {
} catch (err) {
  console.error(err);
}
      `,
      options: [{ caughtErrors: 'all' }],
    },
    {
      code: `
try {
} catch (ignoreErr) {}
      `,
      options: [{ caughtErrorsIgnorePattern: '^ignore' }],
    },
    {
      code: `
try {
} catch (ignoreErr) {}
      `,
      options: [{ caughtErrors: 'all', caughtErrorsIgnorePattern: '^ignore' }],
    },

    // caughtErrors with other combinations
    {
      code: `
try {
} catch (err) {}
      `,
      options: [{ args: 'all', caughtErrors: 'none', vars: 'all' }],
    },

    // Using object rest for variable omission
    {
      code: `
const data = { type: 'coords', x: 1, y: 2 };
const { type, ...coords } = data;
console.log(coords);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      options: [{ ignoreRestSiblings: true }],
    },

    // https://github.com/eslint/eslint/issues/6348
    `
var a = 0,
  b;
b = a = a + 1;
foo(b);
    `,
    `
var a = 0,
  b;
b = a += a + 1;
foo(b);
    `,
    `
var a = 0,
  b;
b = a++;
foo(b);
    `,
    `
function foo(a) {
  var b = (a = a + 1);
  bar(b);
}
foo();
    `,
    `
function foo(a) {
  var b = (a += a + 1);
  bar(b);
}
foo();
    `,
    `
function foo(a) {
  var b = a++;
  bar(b);
}
foo();
    `,

    // https://github.com/eslint/eslint/issues/6576
    `
var unregisterFooWatcher;
// ...
unregisterFooWatcher = $scope.$watch('foo', function () {
  // ...some code..
  unregisterFooWatcher();
});
    `,
    `
var ref;
ref = setInterval(function () {
  clearInterval(ref);
}, 10);
    `,
    `
var _timer;
function f() {
  _timer = setTimeout(function () {}, _timer ? 100 : 0);
}
f();
    `,
    `
function foo(cb) {
  cb = (function () {
    function something(a) {
      cb(1 + a);
    }
    register(something);
  })();
}
foo();
    `,
    {
      code: `
function* foo(cb) {
  cb = yield function (a) {
    cb(1 + a);
  };
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function foo(cb) {
  cb = tag\`hello\${function (a) {
    cb(1 + a);
  }}\`;
}
foo();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    `
function foo(cb) {
  var b;
  cb = b = function (a) {
    cb(1 + a);
  };
  b();
}
foo();
    `,

    // https://github.com/eslint/eslint/issues/6646
    `
function someFunction() {
  var a = 0,
    i;
  for (i = 0; i < 2; i++) {
    a = myFunction(a);
  }
}
someFunction();
    `,

    // https://github.com/eslint/eslint/issues/7124
    {
      code: `
(function (a, b, { c, d }) {
  d;
});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ argsIgnorePattern: 'c' }],
    },
    {
      code: `
(function (a, b, { c, d }) {
  c;
});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ argsIgnorePattern: 'd' }],
    },

    // https://github.com/eslint/eslint/issues/7250
    {
      code: `
(function (a, b, c) {
  c;
});
      `,
      options: [{ argsIgnorePattern: 'c' }],
    },
    {
      code: `
(function (a, b, { c, d }) {
  c;
});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [{ argsIgnorePattern: '[cd]' }],
    },

    // https://github.com/eslint/eslint/issues/7351
    {
      code: `
(class {
  set foo(UNUSED) {}
});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
class Foo {
  set bar(UNUSED) {}
}
console.log(Foo);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // https://github.com/eslint/eslint/issues/8119
    {
      code: '({ a, ...rest }) => rest;',
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      options: [{ args: 'all', ignoreRestSiblings: true }],
    },

    // https://github.com/eslint/eslint/issues/14163
    {
      code: `
let foo, rest;
({ foo, ...rest } = something);
console.log(rest);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      options: [{ ignoreRestSiblings: true }],
    },

    // https://github.com/eslint/eslint/issues/10952
    `
/*eslint @rule-tester/use-every-a:1*/ !function (b, a) {
  return 1;
};
    `,

    // https://github.com/eslint/eslint/issues/10982
    `
var a = function () {
  a();
};
a();
    `,
    `
var a = function () {
  return function () {
    a();
  };
};
a();
    `,
    {
      code: `
const a = () => {
  a();
};
a();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },
    {
      code: `
const a = () => () => {
  a();
};
a();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
    },

    // export * as ns from "source"
    {
      code: "export * as ns from 'source';",
      languageOptions: {
        parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
      },
    },

    // import.meta
    {
      code: 'import.meta;',
      languageOptions: {
        parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
      },
    },

    // https://github.com/eslint/eslint/issues/17299
    {
      code: `
var a;
a ||= 1;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2021 } },
    },
    {
      code: `
var a;
a &&= 1;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2021 } },
    },
    {
      code: `
var a;
a ??= 1;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2021 } },
    },

    // ignore class with static initialization block https://github.com/eslint/eslint/issues/17772
    {
      code: `
class Foo {
  static {}
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [{ ignoreClassWithStaticInitBlock: true }],
    },
    {
      code: `
class Foo {
  static {}
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [
        { ignoreClassWithStaticInitBlock: true, varsIgnorePattern: '^_' },
      ],
    },
    {
      code: `
class Foo {
  static {}
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      options: [
        { ignoreClassWithStaticInitBlock: false, varsIgnorePattern: '^Foo' },
      ],
    },

    // https://github.com/eslint/eslint/issues/17568
    {
      code: `
const a = 5;
const _c = a + 5;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [
        {
          args: 'all',
          reportUsedIgnorePattern: true,
          varsIgnorePattern: '^_',
        },
      ],
    },
    {
      code: `
(function foo(a, _b) {
  return a + 5;
})(5);
      `,
      options: [
        {
          args: 'all',
          argsIgnorePattern: '^_',
          reportUsedIgnorePattern: true,
        },
      ],
    },
    {
      code: `
const [a, _b, c] = items;
console.log(a + c);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      options: [
        {
          destructuredArrayIgnorePattern: '^_',
          reportUsedIgnorePattern: true,
        },
      ],
    },
  ],
});
