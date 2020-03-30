import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/no-invalid-this';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

const error = {
  messageId: 'unexpectedThis',
};

ruleTester.run('no-invalid-this', rule, {
  valid: [
    `describe('foo', () => {
        it('does something', function(this: Mocha.Context) {
          this.timeout(100);
          // done
        });
      });`,
    `
      interface SomeType { prop: string }
      function foo(this: SomeType) {
        this.prop;
      }`,
    `function foo(this: prop){
        this.propMethod()
      }`,
    ' z(function(x,this: context ) { console.log(x, this) });',
    // https://github.com/eslint/eslint/issues/3287

    'function foo() { /** @this Obj*/ return function bar() { console.log(this); z(x => console.log(x, this)); }; }',

    // https://github.com/eslint/eslint/issues/6824

    'var Ctor = function() { console.log(this); z(x => console.log(x, this)); }',
    // Constructors.
    {
      code:
        'function Foo() { console.log(this); z(x => console.log(x, this)); }',
    },
    {
      code:
        'function Foo() { console.log(this); z(x => console.log(x, this)); }',

      options: [{}], // test the default value in schema
    },
    {
      code:
        'function Foo() { console.log(this); z(x => console.log(x, this)); }',

      options: [{ capIsConstructor: true }], // test explicitly set option to the default value
    },
    {
      code:
        'var Foo = function Foo() { console.log(this); z(x => console.log(x, this)); };',
    },
    {
      code:
        'class A {constructor() { console.log(this); z(x => console.log(x, this)); }};',
    },

    // On a property.
    {
      code:
        'var obj = {foo: function() { console.log(this); z(x => console.log(x, this)); }};',
    },
    {
      code:
        'var obj = {foo() { console.log(this); z(x => console.log(x, this)); }};',
    },
    {
      code:
        'var obj = {foo: foo || function() { console.log(this); z(x => console.log(x, this)); }};',
    },
    {
      code:
        'var obj = {foo: hasNative ? foo : function() { console.log(this); z(x => console.log(x, this)); }};',
    },
    {
      code:
        'var obj = {foo: (function() { return function() { console.log(this); z(x => console.log(x, this)); }; })()};',
    },
    {
      code:
        'Object.defineProperty(obj, "foo", {value: function() { console.log(this); z(x => console.log(x, this)); }})',
    },
    {
      code:
        'Object.defineProperties(obj, {foo: {value: function() { console.log(this); z(x => console.log(x, this)); }}})',
    },

    // Assigns to a property.
    {
      code:
        'obj.foo = function() { console.log(this); z(x => console.log(x, this)); };',
    },
    {
      code:
        'obj.foo = foo || function() { console.log(this); z(x => console.log(x, this)); };',
    },
    {
      code:
        'obj.foo = foo ? bar : function() { console.log(this); z(x => console.log(x, this)); };',
    },
    {
      code:
        'obj.foo = (function() { return function() { console.log(this); z(x => console.log(x, this)); }; })();',
    },
    {
      code:
        'obj.foo = (() => function() { console.log(this); z(x => console.log(x, this)); })();',
    },

    // Bind/Call/Apply
    '(function() { console.log(this); z(x => console.log(x, this)); }).call(obj);',
    'var foo = function() { console.log(this); z(x => console.log(x, this)); }.bind(obj);',
    'Reflect.apply(function() { console.log(this); z(x => console.log(x, this)); }, obj, []);',
    '(function() { console.log(this); z(x => console.log(x, this)); }).apply(obj);',

    // Class Instance Methods.
    'class A {foo() { console.log(this); z(x => console.log(x, this)); }};',

    // Array methods.

    'Array.from([], function() { console.log(this); z(x => console.log(x, this)); }, obj);',

    'foo.every(function() { console.log(this); z(x => console.log(x, this)); }, obj);',

    'foo.filter(function() { console.log(this); z(x => console.log(x, this)); }, obj);',

    'foo.find(function() { console.log(this); z(x => console.log(x, this)); }, obj);',

    'foo.findIndex(function() { console.log(this); z(x => console.log(x, this)); }, obj);',

    'foo.forEach(function() { console.log(this); z(x => console.log(x, this)); }, obj);',

    'foo.map(function() { console.log(this); z(x => console.log(x, this)); }, obj);',

    'foo.some(function() { console.log(this); z(x => console.log(x, this)); }, obj);',

    // @this tag.

    '/** @this Obj */ function foo() { console.log(this); z(x => console.log(x, this)); }',

    'foo(/* @this Obj */ function() { console.log(this); z(x => console.log(x, this)); });',

    '/**\n * @returns {void}\n * @this Obj\n */\nfunction foo() { console.log(this); z(x => console.log(x, this)); }',

    'Ctor = function() { console.log(this); z(x => console.log(x, this)); }',

    'function foo(Ctor = function() { console.log(this); z(x => console.log(x, this)); }) {}',

    '[obj.method = function() { console.log(this); z(x => console.log(x, this)); }] = a',

    // Static

    'class A {static foo() { console.log(this); z(x => console.log(x, this)); }};',
  ],

  invalid: [
    {
      code: `
      interface SomeType { prop: string }
      function foo() {
        this.prop;
      }`,
      errors: [error],
    },
    // Global.
    {
      code: 'console.log(this); z(x => console.log(x, this));',

      errors: [error, error],
    },
    {
      code: 'console.log(this); z(x => console.log(x, this));',
      parserOptions: {
        ecmaFeatures: { globalReturn: true },
      },
      errors: [error, error],
    },

    // IIFE.
    {
      code:
        '(function() { console.log(this); z(x => console.log(x, this)); })();',

      errors: [error, error],
    },

    // Just functions.
    {
      code:
        'function foo() { console.log(this); z(x => console.log(x, this)); }',

      errors: [error, error],
    },
    {
      code:
        'function foo() { console.log(this); z(x => console.log(x, this)); }',

      options: [{ capIsConstructor: false }], // test that the option doesn't reverse the logic and mistakenly allows lowercase functions
      errors: [error, error],
    },
    {
      code:
        'function Foo() { console.log(this); z(x => console.log(x, this)); }',

      options: [{ capIsConstructor: false }],
      errors: [error, error],
    },
    {
      code:
        'function foo() { "use strict"; console.log(this); z(x => console.log(x, this)); }',

      errors: [error, error],
    },
    {
      code:
        'function Foo() { "use strict"; console.log(this); z(x => console.log(x, this)); }',

      options: [{ capIsConstructor: false }],
      errors: [error, error],
    },
    {
      code:
        'return function() { console.log(this); z(x => console.log(x, this)); };',
      parserOptions: {
        ecmaFeatures: { globalReturn: true },
      },
      errors: [error, error],
    },
    {
      code:
        'var foo = (function() { console.log(this); z(x => console.log(x, this)); }).bar(obj);',

      errors: [error, error],
    },

    // Functions in methods.
    {
      code:
        'var obj = {foo: function() { function foo() { console.log(this); z(x => console.log(x, this)); } foo(); }};',

      errors: [error, error],
    },
    {
      code:
        'var obj = {foo() { function foo() { console.log(this); z(x => console.log(x, this)); } foo(); }};',

      errors: [error, error],
    },
    {
      code:
        'var obj = {foo: function() { return function() { console.log(this); z(x => console.log(x, this)); }; }};',

      errors: [error, error],
    },
    {
      code:
        'var obj = {foo: function() { "use strict"; return function() { console.log(this); z(x => console.log(x, this)); }; }};',

      errors: [error, error],
    },
    {
      code:
        'obj.foo = function() { return function() { console.log(this); z(x => console.log(x, this)); }; };',

      errors: [error, error],
    },
    {
      code:
        'obj.foo = function() { "use strict"; return function() { console.log(this); z(x => console.log(x, this)); }; };',

      errors: [error, error],
    },
    {
      code:
        'class A { foo() { return function() { console.log(this); z(x => console.log(x, this)); }; } }',

      errors: [error, error],
    },

    // Class Static methods.

    {
      code:
        'obj.foo = (function() { return () => { console.log(this); z(x => console.log(x, this)); }; })();',

      errors: [error, error],
    },
    {
      code:
        'obj.foo = (() => () => { console.log(this); z(x => console.log(x, this)); })();',

      errors: [error, error],
    },
    // Bind/Call/Apply

    {
      code:
        'var foo = function() { console.log(this); z(x => console.log(x, this)); }.bind(null);',

      errors: [error, error],
    },

    {
      code:
        '(function() { console.log(this); z(x => console.log(x, this)); }).call(undefined);',

      errors: [error, error],
    },

    {
      code:
        '(function() { console.log(this); z(x => console.log(x, this)); }).apply(void 0);',

      errors: [error, error],
    },

    // Array methods.
    {
      code:
        'Array.from([], function() { console.log(this); z(x => console.log(x, this)); });',

      errors: [error, error],
    },
    {
      code:
        'foo.every(function() { console.log(this); z(x => console.log(x, this)); });',

      errors: [error, error],
    },
    {
      code:
        'foo.filter(function() { console.log(this); z(x => console.log(x, this)); });',

      errors: [error, error],
    },
    {
      code:
        'foo.find(function() { console.log(this); z(x => console.log(x, this)); });',

      errors: [error, error],
    },
    {
      code:
        'foo.findIndex(function() { console.log(this); z(x => console.log(x, this)); });',

      errors: [error, error],
    },
    {
      code:
        'foo.forEach(function() { console.log(this); z(x => console.log(x, this)); });',

      errors: [error, error],
    },
    {
      code:
        'foo.map(function() { console.log(this); z(x => console.log(x, this)); });',

      errors: [error, error],
    },
    {
      code:
        'foo.some(function() { console.log(this); z(x => console.log(x, this)); });',

      errors: [error, error],
    },

    {
      code:
        'foo.forEach(function() { console.log(this); z(x => console.log(x, this)); }, null);',

      errors: [error, error],
    },

    // @this tag.

    {
      code:
        '/** @returns {void} */ function foo() { console.log(this); z(x => console.log(x, this)); }',

      errors: [error, error],
    },
    {
      code:
        '/** @this Obj */ foo(function() { console.log(this); z(x => console.log(x, this)); });',

      errors: [error, error],
    },

    // https://github.com/eslint/eslint/issues/3254
    {
      code:
        'function foo() { console.log(this); z(x => console.log(x, this)); }',

      errors: [error, error],
    },

    {
      code:
        'var Ctor = function() { console.log(this); z(x => console.log(x, this)); }',

      options: [{ capIsConstructor: false }],
      errors: [error, error],
    },
    {
      code:
        'var func = function() { console.log(this); z(x => console.log(x, this)); }',

      errors: [error, error],
    },
    {
      code:
        'var func = function() { console.log(this); z(x => console.log(x, this)); }',

      options: [{ capIsConstructor: false }],
      errors: [error, error],
    },

    {
      code:
        'Ctor = function() { console.log(this); z(x => console.log(x, this)); }',

      options: [{ capIsConstructor: false }],
      errors: [error, error],
    },
    {
      code:
        'func = function() { console.log(this); z(x => console.log(x, this)); }',

      errors: [error, error],
    },
    {
      code:
        'func = function() { console.log(this); z(x => console.log(x, this)); }',

      options: [{ capIsConstructor: false }],
      errors: [error, error],
    },

    {
      code:
        'function foo(func = function() { console.log(this); z(x => console.log(x, this)); }) {}',

      errors: [error, error],
    },

    {
      code:
        '[func = function() { console.log(this); z(x => console.log(x, this)); }] = a',

      errors: [error, error],
    },
  ],
});
