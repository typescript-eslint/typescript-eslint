// The following tests are adapted from the tests in eslint.
// Original Code: https://github.com/eslint/eslint/blob/eb76282e0a2db8aa10a3d5659f5f9237d9729121/tests/lib/rules/no-unused-vars.js
// License      : https://github.com/eslint/eslint/blob/eb76282e0a2db8aa10a3d5659f5f9237d9729121/LICENSE

import type { TestCaseError } from '@typescript-eslint/rule-tester';
import { RuleTester } from '@typescript-eslint/rule-tester';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

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
      VariableDeclaration: useA,
      ReturnStatement: useA,
    };
  },
  defaultOptions: [],
  meta: {
    messages: {},
    type: 'problem',
    schema: [],
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
    messageId: 'unusedVar',
    data: {
      varName,
      action: 'defined',
      additional,
    },
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
    messageId: 'unusedVar',
    data: {
      varName,
      action: 'assigned a value',
      additional,
    },
  };
}

/**
 * Returns an expected error for used-but-ignored variables.
 * @param varName The name of the variable
 * @param [additional] The additional text for the message data
 * @param [type] The node type (defaults to "Identifier")
 * @returns An expected error object
 */
function usedIgnoredError(
  varName: string,
  additional = '',
  type = AST_NODE_TYPES.Identifier,
): TestCaseError<MessageIds> {
  return {
    messageId: 'usedIgnoredVar',
    data: {
      varName,
      additional,
    },
    type,
  };
}

ruleTester.run('no-unused-vars', rule, {
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
      options: [{ vars: 'all', args: 'after-used' }],
    },
    {
      code: `
function g(bar, baz) {
  return bar;
}
g();
      `,
      options: [{ vars: 'all', args: 'none' }],
    },
    {
      code: `
function g(bar, baz) {
  return 2;
}
g();
      `,
      options: [{ vars: 'all', args: 'none' }],
    },
    {
      code: `
function g(bar, baz) {
  return bar + baz;
}
g();
      `,
      options: [{ vars: 'local', args: 'all' }],
    },
    {
      code: `
var g = function (bar, baz) {
  return 2;
};
g();
      `,
      options: [{ vars: 'all', args: 'none' }],
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
      options: [{ vars: 'all', varsIgnorePattern: '[iI]gnored' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const [a, _b, c] = items;
console.log(a + c);
      `,
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const [[a, _b, c]] = items;
console.log(a + c);
      `,
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
const {
  x: [_a, foo],
} = bar;
console.log(foo);
      `,
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function baz([_b, foo]) {
  foo;
}
baz();
      `,
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
function baz({ x: [_b, foo] }) {
  foo;
}
baz();
      `,
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
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
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let _a, b;
foo.forEach(item => {
  [_a, b] = item;
  doSomething(b);
});
      `,
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
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
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
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
      options: [
        { destructuredArrayIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
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
      options: [{ caughtErrors: 'none', vars: 'all', args: 'all' }],
    },

    // Using object rest for variable omission
    {
      code: `
const data = { type: 'coords', x: 1, y: 2 };
const { type, ...coords } = data;
console.log(coords);
      `,
      options: [{ ignoreRestSiblings: true }],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
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
      options: [{ argsIgnorePattern: 'c' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function (a, b, { c, d }) {
  c;
});
      `,
      options: [{ argsIgnorePattern: 'd' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
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
      options: [{ argsIgnorePattern: '[cd]' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
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
      options: [{ args: 'all', ignoreRestSiblings: true }],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
    },

    // https://github.com/eslint/eslint/issues/14163
    {
      code: `
let foo, rest;
({ foo, ...rest } = something);
console.log(rest);
      `,
      options: [{ ignoreRestSiblings: true }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
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
      options: [{ ignoreClassWithStaticInitBlock: true }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: `
class Foo {
  static {}
}
      `,
      options: [
        { ignoreClassWithStaticInitBlock: true, varsIgnorePattern: '^_' },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },
    {
      code: `
class Foo {
  static {}
}
      `,
      options: [
        { ignoreClassWithStaticInitBlock: false, varsIgnorePattern: '^Foo' },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
    },

    // https://github.com/eslint/eslint/issues/17568
    {
      code: `
const a = 5;
const _c = a + 5;
      `,
      options: [
        { args: 'all', varsIgnorePattern: '^_', reportUsedIgnorePattern: true },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
(function foo(a, _b) {
  return a + 5;
})(5);
      `,
      options: [
        { args: 'all', argsIgnorePattern: '^_', reportUsedIgnorePattern: true },
      ],
    },
    {
      code: `
const [a, _b, c] = items;
console.log(a + c);
      `,
      options: [
        { destructuredArrayIgnorePattern: '^_', reportUsedIgnorePattern: true },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
  ],
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
      options: ['all'],
      errors: [assignedError('a')],
    },
    {
      code: `
var a = 10;
a = 20;
      `,
      options: ['all'],
      errors: [assignedError('a')],
    },
    {
      code: `
var a = 10;
(function () {
  var a = 1;
  alert(a);
})();
      `,
      options: ['all'],
      errors: [assignedError('a')],
    },
    {
      code: `
var a = 10,
  b = 0,
  c = null;
alert(a + b);
      `,
      options: ['all'],
      errors: [assignedError('c')],
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
      options: ['all'],
      errors: [assignedError('b')],
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
      options: ['all'],
      errors: [assignedError('b'), assignedError('c')],
    },
    {
      code: `
function f() {
  var a = [];
  return a.map(function () {});
}
      `,
      options: ['all'],
      errors: [definedError('f')],
    },
    {
      code: `
function f() {
  var a = [];
  return a.map(function g() {});
}
      `,
      options: ['all'],
      errors: [definedError('f')],
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
          messageId: 'unusedVar',
          data: { varName: 'foo', action: 'defined', additional: '' },
          line: 2,
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
      options: ['all'],
      errors: [definedError('f'), definedError('a'), definedError('b')],
    },
    {
      code: `
function f(a) {}
f();
      `,
      options: ['all'],
      errors: [definedError('a')],
    },
    {
      code: `
function a(x, y, z) {
  return y;
}
a();
      `,
      options: ['all'],
      errors: [definedError('z')],
    },
    {
      code: 'var min = Math.min;',
      options: ['all'],
      errors: [assignedError('min')],
    },
    {
      code: 'var min = { min: 1 };',
      options: ['all'],
      errors: [assignedError('min')],
    },
    {
      code: `
Foo.bar = function (baz) {
  return 1;
};
      `,
      options: ['all'],
      errors: [definedError('baz')],
    },
    {
      code: 'var min = { min: 1 };',
      options: [{ vars: 'all' }],
      errors: [assignedError('min')],
    },
    {
      code: `
function gg(baz, bar) {
  return baz;
}
gg();
      `,
      options: [{ vars: 'all' }],
      errors: [definedError('bar')],
    },
    {
      code: `
(function (foo, baz, bar) {
  return baz;
})();
      `,
      options: [{ vars: 'all', args: 'after-used' }],
      errors: [definedError('bar')],
    },
    {
      code: `
(function (foo, baz, bar) {
  return baz;
})();
      `,
      options: [{ vars: 'all', args: 'all' }],
      errors: [definedError('foo'), definedError('bar')],
    },
    {
      code: `
(function z(foo) {
  var bar = 33;
})();
      `,
      options: [{ vars: 'all', args: 'all' }],
      errors: [definedError('foo'), assignedError('bar')],
    },
    {
      code: `
(function z(foo) {
  z();
})();
      `,
      options: [{}],
      errors: [definedError('foo')],
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
      options: [{}],
      errors: [definedError('f'), assignedError('a')],
    },
    {
      code: "import x from 'y';",
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      errors: [definedError('x')],
    },
    {
      code: `
export function fn2({ x, y }) {
  console.log(x);
}
      `,
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      errors: [definedError('y')],
    },
    {
      code: `
export function fn2(x, y) {
  console.log(x);
}
      `,
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      errors: [definedError('y')],
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [assignedError('y')],
    },

    // ignore pattern
    {
      code: `
var _a;
var b;
      `,
      options: [{ vars: 'all', varsIgnorePattern: '^_' }],
      errors: [
        {
          line: 3,
          column: 5,
          messageId: 'unusedVar',
          data: {
            varName: 'b',
            action: 'defined',
            additional: '. Allowed unused vars must match /^_/u',
          },
        },
      ],
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
      options: [{ vars: 'local', varsIgnorePattern: '^_' }],
      errors: [
        {
          line: 5,
          column: 7,
          messageId: 'unusedVar',
          data: {
            varName: 'c_',
            action: 'defined',
            additional: '. Allowed unused vars must match /^_/u',
          },
        },
      ],
    },
    {
      code: `
function foo(a, _b) {}
foo();
      `,
      options: [{ args: 'all', argsIgnorePattern: '^_' }],
      errors: [
        {
          line: 2,
          column: 14,
          messageId: 'unusedVar',
          data: {
            varName: 'a',
            action: 'defined',
            additional: '. Allowed unused args must match /^_/u',
          },
        },
      ],
    },
    {
      code: `
function foo(a, _b, c) {
  return a;
}
foo();
      `,
      options: [{ args: 'after-used', argsIgnorePattern: '^_' }],
      errors: [
        {
          line: 2,
          column: 21,
          messageId: 'unusedVar',
          data: {
            varName: 'c',
            action: 'defined',
            additional: '. Allowed unused args must match /^_/u',
          },
        },
      ],
    },
    {
      code: `
function foo(_a) {}
foo();
      `,
      options: [{ args: 'all', argsIgnorePattern: '[iI]gnored' }],
      errors: [
        {
          line: 2,
          column: 14,
          messageId: 'unusedVar',
          data: {
            varName: '_a',
            action: 'defined',
            additional: '. Allowed unused args must match /[iI]gnored/u',
          },
        },
      ],
    },
    {
      code: 'var [firstItemIgnored, secondItem] = items;',
      options: [{ vars: 'all', varsIgnorePattern: '[iI]gnored' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          line: 1,
          column: 24,
          messageId: 'unusedVar',
          data: {
            varName: 'secondItem',
            action: 'assigned a value',
            additional: '. Allowed unused vars must match /[iI]gnored/u',
          },
        },
      ],
    },

    // https://github.com/eslint/eslint/issues/15611
    {
      code: `
const array = ['a', 'b', 'c'];
const [a, _b, c] = array;
const newArray = [a, c];
      `,
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [
        // should report only `newArray`
        { ...assignedError('newArray'), line: 4, column: 7 },
      ],
    },
    {
      code: `
const array = ['a', 'b', 'c', 'd', 'e'];
const [a, _b, c] = array;
      `,
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [
        {
          ...assignedError(
            'a',
            '. Allowed unused elements of array destructuring must match /^_/u',
          ),
          line: 3,
          column: 8,
        },
        {
          ...assignedError(
            'c',
            '. Allowed unused elements of array destructuring must match /^_/u',
          ),
          line: 3,
          column: 15,
        },
      ],
    },
    {
      code: `
const array = ['a', 'b', 'c'];
const [a, _b, c] = array;
const fooArray = ['foo'];
const barArray = ['bar'];
const ignoreArray = ['ignore'];
      `,
      options: [
        { destructuredArrayIgnorePattern: '^_', varsIgnorePattern: 'ignore' },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [
        {
          ...assignedError(
            'a',
            '. Allowed unused elements of array destructuring must match /^_/u',
          ),
          line: 3,
          column: 8,
        },
        {
          ...assignedError(
            'c',
            '. Allowed unused elements of array destructuring must match /^_/u',
          ),
          line: 3,
          column: 15,
        },
        {
          ...assignedError(
            'fooArray',
            '. Allowed unused vars must match /ignore/u',
          ),
          line: 4,
          column: 7,
        },
        {
          ...assignedError(
            'barArray',
            '. Allowed unused vars must match /ignore/u',
          ),
          line: 5,
          column: 7,
        },
      ],
    },
    {
      code: `
const array = [obj];
const [{ _a, foo }] = array;
console.log(foo);
      `,
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [
        {
          ...assignedError('_a'),
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
function foo([{ _a, bar }]) {
  bar;
}
foo();
      `,
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [
        {
          ...definedError('_a'),
          line: 2,
          column: 17,
        },
      ],
    },
    {
      code: `
let _a, b;

foo.forEach(item => {
  [a, b] = item;
});
      `,
      options: [{ destructuredArrayIgnorePattern: '^_' }],
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [
        {
          ...definedError('_a'),
          line: 2,
          column: 5,
        },
        {
          ...assignedError('b'),
          line: 2,
          column: 9,
        },
      ],
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
          line: 4,
          column: 8,
          messageId: 'unusedVar',
          data: {
            varName: 'name',
            action: 'assigned a value',
            additional: '',
          },
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
          line: 4,
          column: 8,
          messageId: 'unusedVar',
          data: {
            varName: 'name',
            action: 'assigned a value',
            additional: '',
          },
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
          line: 3,
          column: 12,
          messageId: 'unusedVar',
          data: {
            varName: 'name',
            action: 'assigned a value',
            additional: '',
          },
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
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          line: 4,
          column: 8,
          messageId: 'unusedVar',
          data: {
            varName: 'name',
            action: 'assigned a value',
            additional: '',
          },
        },
      ],
    },
    {
      code: `
(function (iter) {
  var name;
  for (name of iter) {
  }
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          line: 4,
          column: 8,
          messageId: 'unusedVar',
          data: {
            varName: 'name',
            action: 'assigned a value',
            additional: '',
          },
        },
      ],
    },
    {
      code: `
(function (iter) {
  for (var name of iter) {
  }
})({});
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          line: 3,
          column: 12,
          messageId: 'unusedVar',
          data: {
            varName: 'name',
            action: 'assigned a value',
            additional: '',
          },
        },
      ],
    },

    // https://github.com/eslint/eslint/issues/3617
    {
      code: `
/* global foobar, foo, bar */
foobar;
      `,
      errors: [
        {
          line: 2,
          endLine: 2,
          column: 19,
          endColumn: 22,
          messageId: 'unusedVar',
          data: {
            varName: 'foo',
            action: 'defined',
            additional: '',
          },
        },
        {
          line: 2,
          endLine: 2,
          column: 24,
          endColumn: 27,
          messageId: 'unusedVar',
          data: {
            varName: 'bar',
            action: 'defined',
            additional: '',
          },
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
          line: 3,
          column: 4,
          endLine: 3,
          endColumn: 7,
          messageId: 'unusedVar',
          data: {
            varName: 'foo',
            action: 'defined',
            additional: '',
          },
        },
        {
          line: 4,
          column: 4,
          endLine: 4,
          endColumn: 7,
          messageId: 'unusedVar',
          data: {
            varName: 'bar',
            action: 'defined',
            additional: '',
          },
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
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      errors: [
        {
          line: 3,
          column: 9,
          messageId: 'unusedVar',
          data: {
            varName: 'type',
            action: 'assigned a value',
            additional: '',
          },
        },
      ],
    },

    // Unused rest property with ignoreRestSiblings
    {
      code: `
const data = { type: 'coords', x: 2, y: 2 };
const { type, ...coords } = data;
console.log(type);
      `,
      options: [{ ignoreRestSiblings: true }],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      errors: [
        {
          line: 3,
          column: 18,
          messageId: 'unusedVar',
          data: {
            varName: 'coords',
            action: 'assigned a value',
            additional: '',
          },
        },
      ],
    },
    {
      code: `
let type, coords;
({ type, ...coords } = data);
console.log(type);
      `,
      options: [{ ignoreRestSiblings: true }],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      errors: [
        {
          line: 3,
          column: 13,
          messageId: 'unusedVar',
          data: {
            varName: 'coords',
            action: 'assigned a value',
            additional: '',
          },
        },
      ],
    },

    // Unused rest property without ignoreRestSiblings
    {
      code: `
const data = { type: 'coords', x: 3, y: 2 };
const { type, ...coords } = data;
console.log(type);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      errors: [
        {
          line: 3,
          column: 18,
          messageId: 'unusedVar',
          data: {
            varName: 'coords',
            action: 'assigned a value',
            additional: '',
          },
        },
      ],
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
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      errors: [
        {
          line: 4,
          column: 10,
          messageId: 'unusedVar',
          data: {
            varName: 'x',
            action: 'assigned a value',
            additional: '',
          },
        },
      ],
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
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      errors: [
        {
          line: 4,
          column: 15,
          messageId: 'unusedVar',
          data: {
            varName: 'x',
            action: 'assigned a value',
            additional: '',
          },
        },
      ],
    },

    // https://github.com/eslint/eslint/issues/8119
    {
      code: '({ a, ...rest }) => {};',
      options: [{ args: 'all', ignoreRestSiblings: true }],
      languageOptions: { parserOptions: { ecmaVersion: 2018 } },
      errors: [definedError('rest')],
    },

    // https://github.com/eslint/eslint/issues/3714
    {
      code: `
/* global a$fooz,$foo */
a$fooz;
      `,
      errors: [
        {
          line: 2,
          column: 18,
          endLine: 2,
          endColumn: 22,
          messageId: 'unusedVar',
          data: {
            varName: '$foo',
            action: 'defined',
            additional: '',
          },
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
          line: 2,
          column: 20,
          endLine: 2,
          endColumn: 21,
          messageId: 'unusedVar',
          data: {
            varName: '$',
            action: 'defined',
            additional: '',
          },
        },
      ],
    },
    {
      code: '/*globals $foo*/',
      errors: [
        {
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 15,
          messageId: 'unusedVar',
          data: {
            varName: '$foo',
            action: 'defined',
            additional: '',
          },
        },
      ],
    },
    {
      code: '/* global global*/',
      errors: [
        {
          line: 1,
          column: 11,
          endLine: 1,
          endColumn: 17,
          messageId: 'unusedVar',
          data: {
            varName: 'global',
            action: 'defined',
            additional: '',
          },
        },
      ],
    },
    {
      code: '/*global foo:true*/',
      errors: [
        {
          line: 1,
          column: 10,
          endLine: 1,
          endColumn: 13,
          messageId: 'unusedVar',
          data: {
            varName: 'foo',
            action: 'defined',
            additional: '',
          },
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
          line: 2,
          column: 14,
          endLine: 2,
          endColumn: 15,
          messageId: 'unusedVar',
          data: {
            varName: '数',
            action: 'defined',
            additional: '',
          },
        },
      ],
    },

    // surrogate pair.
    {
      code: `
/*global 𠮷𩸽, 𠮷*/
𠮷𩸽;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        {
          line: 2,
          column: 16,
          endLine: 2,
          endColumn: 18,
          messageId: 'unusedVar',
          data: {
            varName: '𠮷',
            action: 'defined',
            additional: '',
          },
        },
      ],
    },

    // https://github.com/eslint/eslint/issues/4047
    {
      code: 'export default function (a) {}',
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      errors: [definedError('a')],
    },
    {
      code: `
export default function (a, b) {
  console.log(a);
}
      `,
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      errors: [definedError('b')],
    },
    {
      code: 'export default (function (a) {});',
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      errors: [definedError('a')],
    },
    {
      code: `
export default (function (a, b) {
  console.log(a);
});
      `,
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      errors: [definedError('b')],
    },
    {
      code: 'export default a => {};',
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      errors: [definedError('a')],
    },
    {
      code: `
export default (a, b) => {
  console.log(a);
};
      `,
      languageOptions: {
        parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      },
      errors: [definedError('b')],
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
      options: [{ caughtErrors: 'all' }],
      errors: [definedError('err')],
    },
    {
      code: `
try {
} catch (err) {}
      `,
      options: [{ caughtErrors: 'all', caughtErrorsIgnorePattern: '^ignore' }],
      errors: [
        definedError(
          'err',
          '. Allowed unused caught errors must match /^ignore/u',
        ),
      ],
    },
    {
      code: `
try {
} catch (err) {}
      `,
      options: [{ caughtErrors: 'all', varsIgnorePattern: '^err' }],
      errors: [definedError('err')],
    },
    {
      code: `
try {
} catch (err) {}
      `,
      options: [{ caughtErrors: 'all', varsIgnorePattern: '^.' }],
      errors: [definedError('err')],
    },

    // multiple try catch with one success
    {
      code: `
try {
} catch (ignoreErr) {}
try {
} catch (err) {}
      `,
      options: [{ caughtErrors: 'all', caughtErrorsIgnorePattern: '^ignore' }],
      errors: [
        definedError(
          'err',
          '. Allowed unused caught errors must match /^ignore/u',
        ),
      ],
    },

    // multiple try catch both fail
    {
      code: `
try {
} catch (error) {}
try {
} catch (err) {}
      `,
      options: [{ caughtErrors: 'all', caughtErrorsIgnorePattern: '^ignore' }],
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
    },

    // caughtErrors with other configs
    {
      code: `
try {
} catch (err) {}
      `,
      options: [{ vars: 'all', args: 'all', caughtErrors: 'all' }],
      errors: [definedError('err')],
    },

    // no conflict in ignore patterns
    {
      code: `
try {
} catch (err) {}
      `,
      options: [
        {
          vars: 'all',
          args: 'all',
          caughtErrors: 'all',
          argsIgnorePattern: '^er',
        },
      ],
      errors: [definedError('err')],
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
      options: [{ argsIgnorePattern: 'c' }],
      errors: [
        definedError('a', '. Allowed unused args must match /c/u'),
        definedError('b', '. Allowed unused args must match /c/u'),
      ],
    },
    {
      code: '(function (a, b, { c, d }) {});',
      options: [{ argsIgnorePattern: '[cd]' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        definedError('a', '. Allowed unused args must match /[cd]/u'),
        definedError('b', '. Allowed unused args must match /[cd]/u'),
      ],
    },
    {
      code: '(function (a, b, { c, d }) {});',
      options: [{ argsIgnorePattern: 'c' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        definedError('a', '. Allowed unused args must match /c/u'),
        definedError('b', '. Allowed unused args must match /c/u'),
        definedError('d', '. Allowed unused args must match /c/u'),
      ],
    },
    {
      code: '(function (a, b, { c, d }) {});',
      options: [{ argsIgnorePattern: 'd' }],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        definedError('a', '. Allowed unused args must match /d/u'),
        definedError('b', '. Allowed unused args must match /d/u'),
        definedError('c', '. Allowed unused args must match /d/u'),
      ],
    },
    {
      code: `
/*global
foo*/
      `,
      errors: [
        {
          line: 3,
          column: 1,
          endLine: 3,
          endColumn: 4,
          messageId: 'unusedVar',
          data: {
            varName: 'foo',
            action: 'defined',
            additional: '',
          },
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
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [definedError('a')],
    },
    {
      code: `
(function ({ a }, { b, c }) {
  return b;
})();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [definedError('a'), definedError('c')],
    },

    // https://github.com/eslint/eslint/issues/14325
    {
      code: `
let x = 0;
x++, (x = 0);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 7 }],
    },
    {
      code: `
let x = 0;
x++, (x = 0);
x = 3;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 4, column: 1 }],
    },
    {
      code: `
let x = 0;
x++, 0;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 1 }],
    },
    {
      code: `
let x = 0;
0, x++;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 4 }],
    },
    {
      code: `
let x = 0;
0, (1, x++);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 8 }],
    },
    {
      code: `
let x = 0;
foo = (x++, 0);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 8 }],
    },
    {
      code: `
let x = 0;
foo = ((0, x++), 0);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 12 }],
    },
    {
      code: `
let x = 0;
(x += 1), 0;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 2 }],
    },
    {
      code: `
let x = 0;
0, (x += 1);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 5 }],
    },
    {
      code: `
let x = 0;
0, (1, (x += 1));
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 9 }],
    },
    {
      code: `
let x = 0;
foo = ((x += 1), 0);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 9 }],
    },
    {
      code: `
let x = 0;
foo = ((0, (x += 1)), 0);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 13 }],
    },

    // https://github.com/eslint/eslint/issues/14866
    {
      code: `
let z = 0;
(z = z + 1), (z = 2);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [{ ...assignedError('z'), line: 3, column: 15 }],
    },
    {
      code: `
let z = 0;
(z = z + 1), (z = 2);
z = 3;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [{ ...assignedError('z'), line: 4, column: 1 }],
    },
    {
      code: `
let z = 0;
(z = z + 1), (z = 2);
z = z + 3;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [{ ...assignedError('z'), line: 4, column: 1 }],
    },
    {
      code: `
let x = 0;
0, (x = x + 1);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [{ ...assignedError('x'), line: 3, column: 5 }],
    },
    {
      code: `
let x = 0;
(x = x + 1), 0;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [{ ...assignedError('x'), line: 3, column: 2 }],
    },
    {
      code: `
let x = 0;
foo = ((0, (x = x + 1)), 0);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [{ ...assignedError('x'), line: 3, column: 13 }],
    },
    {
      code: `
let x = 0;
foo = ((x = x + 1), 0);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [{ ...assignedError('x'), line: 3, column: 9 }],
    },
    {
      code: `
let x = 0;
0, (1, (x = x + 1));
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [{ ...assignedError('x'), line: 3, column: 9 }],
    },
    {
      code: `
(function ({ a, b }, { c }) {
  return b;
})();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [definedError('a'), definedError('c')],
    },
    {
      code: `
(function ([a], b) {
  return b;
})();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [definedError('a')],
    },
    {
      code: `
(function ([a], [b, c]) {
  return b;
})();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [definedError('a'), definedError('c')],
    },
    {
      code: `
(function ([a, b], [c]) {
  return b;
})();
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [definedError('a'), definedError('c')],
    },

    // https://github.com/eslint/eslint/issues/9774
    {
      code: '(function (_a) {})();',
      options: [{ args: 'all', varsIgnorePattern: '^_' }],
      errors: [definedError('_a')],
    },
    {
      code: '(function (_a) {})();',
      options: [{ args: 'all', caughtErrorsIgnorePattern: '^_' }],
      errors: [definedError('_a')],
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
      errors: [{ ...assignedError('a'), line: 2, column: 5 }],
    },
    {
      code: `
const a = () => () => {
  a();
};
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('a'), line: 2, column: 7 }],
    },
    {
      code: `
let myArray = [1, 2, 3, 4].filter(x => x == 0);
myArray = myArray.filter(x => x == 1);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('myArray'), line: 3, column: 1 }],
    },
    {
      code: `
const a = 1;
a += 1;
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('a'), line: 3, column: 1 }],
    },
    {
      code: `
const a = () => {
  a();
};
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('a'), line: 2, column: 7 }],
    },

    // https://github.com/eslint/eslint/issues/14324
    {
      code: `
let x = [];
x = x.concat(x);
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2015 } },
      errors: [{ ...assignedError('x'), line: 3, column: 1 }],
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
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [
        {
          ...assignedError('a'),
          line: 3,
          column: 1,
        },
        {
          ...definedError('foo'),
          line: 4,
          column: 10,
        },
      ],
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
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [{ ...assignedError('foo'), line: 4, column: 1 }],
    },
    {
      code: `
function foo(n) {
  if (n < 2) return 1;
  return n * foo(n - 1);
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [{ ...definedError('foo'), line: 2, column: 10 }],
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
      languageOptions: { parserOptions: { ecmaVersion: 2020 } },
      errors: [{ ...assignedError('c'), line: 11, column: 1 }],
    },

    // ignore class with static initialization block https://github.com/eslint/eslint/issues/17772
    {
      code: `
class Foo {
  static {}
}
      `,
      options: [{ ignoreClassWithStaticInitBlock: false }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [{ ...definedError('Foo'), line: 2, column: 7 }],
    },
    {
      code: `
class Foo {
  static {}
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [{ ...definedError('Foo'), line: 2, column: 7 }],
    },
    {
      code: `
class Foo {
  static {
    var bar;
  }
}
      `,
      options: [{ ignoreClassWithStaticInitBlock: true }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [{ ...definedError('bar'), line: 4, column: 9 }],
    },
    {
      code: 'class Foo {}',
      options: [{ ignoreClassWithStaticInitBlock: true }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [{ ...definedError('Foo'), line: 1, column: 7 }],
    },
    {
      code: `
class Foo {
  static bar;
}
      `,
      options: [{ ignoreClassWithStaticInitBlock: true }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [{ ...definedError('Foo'), line: 2, column: 7 }],
    },
    {
      code: `
class Foo {
  static bar() {}
}
      `,
      options: [{ ignoreClassWithStaticInitBlock: true }],
      languageOptions: { parserOptions: { ecmaVersion: 2022 } },
      errors: [{ ...definedError('Foo'), line: 2, column: 7 }],
    },

    // https://github.com/eslint/eslint/issues/17568
    {
      code: `
const _a = 5;
const _b = _a + 5;
      `,
      options: [
        { args: 'all', varsIgnorePattern: '^_', reportUsedIgnorePattern: true },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [usedIgnoredError('_a', '. Used vars must not match /^_/u')],
    },
    {
      code: `
const _a = 42;
foo(() => _a);
      `,
      options: [
        { args: 'all', varsIgnorePattern: '^_', reportUsedIgnorePattern: true },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [usedIgnoredError('_a', '. Used vars must not match /^_/u')],
    },
    {
      code: `
(function foo(_a) {
  return _a + 5;
})(5);
      `,
      options: [
        { args: 'all', argsIgnorePattern: '^_', reportUsedIgnorePattern: true },
      ],
      errors: [usedIgnoredError('_a', '. Used args must not match /^_/u')],
    },
    {
      code: `
const [a, _b] = items;
console.log(a + _b);
      `,
      options: [
        { destructuredArrayIgnorePattern: '^_', reportUsedIgnorePattern: true },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        usedIgnoredError(
          '_b',
          '. Used elements of array destructuring must not match /^_/u',
        ),
      ],
    },
    {
      code: `
let _x;
[_x] = arr;
foo(_x);
      `,
      options: [
        {
          destructuredArrayIgnorePattern: '^_',
          reportUsedIgnorePattern: true,
          varsIgnorePattern: '[iI]gnored',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        usedIgnoredError(
          '_x',
          '. Used elements of array destructuring must not match /^_/u',
        ),
      ],
    },
    {
      code: `
const [ignored] = arr;
foo(ignored);
      `,
      options: [
        {
          destructuredArrayIgnorePattern: '^_',
          reportUsedIgnorePattern: true,
          varsIgnorePattern: '[iI]gnored',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
      errors: [
        usedIgnoredError('ignored', '. Used vars must not match /[iI]gnored/u'),
      ],
    },
    {
      code: `
try {
} catch (_err) {
  console.error(_err);
}
      `,
      options: [
        {
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          reportUsedIgnorePattern: true,
        },
      ],
      errors: [
        usedIgnoredError('_err', '. Used caught errors must not match /^_/u'),
      ],
    },
    {
      code: `
try {
} catch (_) {
  _ = 'foo';
}
      `,
      options: [{ caughtErrorsIgnorePattern: 'foo' }],
      errors: [
        assignedError('_', '. Allowed unused caught errors must match /foo/u'),
      ],
    },
    {
      code: `
try {
} catch (_) {
  _ = 'foo';
}
      `,
      options: [
        {
          caughtErrorsIgnorePattern: 'ignored',
          varsIgnorePattern: '_',
        },
      ],
      errors: [
        assignedError(
          '_',
          '. Allowed unused caught errors must match /ignored/u',
        ),
      ],
    },
    {
      code: `
try {
} catch ({ message, errors: [firstError] }) {}
      `,
      options: [{ caughtErrorsIgnorePattern: 'foo' }],
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
    },
    {
      code: `
try {
} catch ({ stack: $ }) {
  $ = 'Something broke: ' + $;
}
      `,
      options: [{ caughtErrorsIgnorePattern: '\\w' }],
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
    },
    {
      code: `
_ => {
  _ = _ + 1;
};
      `,
      options: [
        {
          argsIgnorePattern: 'ignored',
          varsIgnorePattern: '_',
        },
      ],
      errors: [
        assignedError('_', '. Allowed unused args must match /ignored/u'),
      ],
    },
  ],
});
