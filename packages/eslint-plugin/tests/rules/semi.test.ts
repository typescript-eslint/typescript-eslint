/* eslint-disable eslint-comments/no-use */
// this rule tests the semis, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule, { MessageIds, Options } from '../../src/rules/semi';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
});

const neverOption: Options = ['never'];
const neverOptionWithoutContinuationChars: Options = [
  'never',
  { beforeStatementContinuationChars: 'never' },
];

const missingSemicolon = {
  messageId: 'missingSemi' as const,
};

const extraSemicolon = {
  messageId: 'extraSemi' as const,
};

ruleTester.run('semi', rule, {
  valid: [
    { code: 'for (var i;;){}' },
    { code: 'for (var i;;){}', options: neverOption },

    {
      code: 'var foo = 0;export { foo };',
    },

    // https://github.com/eslint/eslint/issues/7782
    { code: 'var a = b;\n/foo/.test(c)', options: neverOption },
    {
      code: 'var a = b;\n`foo`',
      options: neverOption,
    },
    { code: 'var a = b;\n+ c', options: neverOption },

    {
      code: '(function bar() {})\n;(function foo(){})',
      options: neverOption,
    },
    { code: ";/foo/.test('bar')", options: neverOption },
    { code: ';+5', options: neverOption },
    { code: ';-foo()', options: neverOption },
    { code: 'a++\nb++', options: neverOption },
    { code: 'a++; b++', options: neverOption },

    // https://github.com/eslint/eslint/issues/9521
    {
      code: `
        do; while(a);
        [1,2,3].forEach(doSomething)
      `,
      options: ['never', { beforeStatementContinuationChars: 'any' }],
    },
    {
      code: `
        do; while(a)
        [1,2,3].forEach(doSomething)
      `,
      options: ['never', { beforeStatementContinuationChars: 'any' }],
    },
    {
      code: `
        import a from "a";
        [1,2,3].forEach(doSomething)
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
    },
    {
      code: `
        var a = 0; export {a};
        [a] = b
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
    },
    {
      code: `
        function wrap() {
          return;
          ({a} = b)
        }
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
      parserOptions: { ecmaVersion: 2015 },
    },
    {
      code: `
        while (true) {
          break;
          +i
        }
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
    },
    {
      code: `
        while (true) {
          continue;
          [1,2,3].forEach(doSomething)
        }
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
    },
    {
      code: `
        do; while(a);
        [1,2,3].forEach(doSomething)
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
    },
    {
      code: `
        const f = () => {};
        [1,2,3].forEach(doSomething)
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
      parserOptions: { ecmaVersion: 2015 },
    },
    {
      code: `
        import a from "a"
        [1,2,3].forEach(doSomething)
      `,
      options: neverOptionWithoutContinuationChars,
    },
    {
      code: `
        var a = 0; export {a}
        [a] = b
      `,
      options: neverOptionWithoutContinuationChars,
    },
    {
      code: `
        function wrap() {
          return
          ({a} = b)
        }
      `,
      options: neverOptionWithoutContinuationChars,
      parserOptions: { ecmaVersion: 2015 },
    },
    {
      code: `
        while (true) {
          break
          +i
        }
      `,
      options: neverOptionWithoutContinuationChars,
    },
    {
      code: `
        while (true) {
          continue
          [1,2,3].forEach(doSomething)
        }
      `,
      options: neverOptionWithoutContinuationChars,
    },
    {
      code: `
        do; while(a)
        [1,2,3].forEach(doSomething)
      `,
      options: neverOptionWithoutContinuationChars,
    },
    {
      code: `
        const f = () => {}
        [1,2,3].forEach(doSomething)
      `,
      options: neverOptionWithoutContinuationChars,
      parserOptions: { ecmaVersion: 2015 },
    },

    {
      code: 'if (foo) { bar(); }',
      options: ['always', { omitLastInOneLineBlock: false }],
    },
    {
      code: 'if (foo) { bar(); baz(); }',
      options: ['always', { omitLastInOneLineBlock: false }],
    },
    {
      code: 'if (foo) { bar() }',
      options: ['always', { omitLastInOneLineBlock: true }],
    },
    {
      code: 'if (foo) { bar(); baz() }',
      options: ['always', { omitLastInOneLineBlock: true }],
    },
    ...[
      // https://github.com/typescript-eslint/typescript-eslint/issues/366
      'export = Foo;',
      'import f = require("f");',
      'type Foo = {};',
      // https://github.com/typescript-eslint/typescript-eslint/issues/409
      `
class Class {
    prop: string;
}
    `,
      `
abstract class AbsClass {
    abstract prop: string;
    abstract meth(): string;
}
    `,
      `
class PanCamera extends FreeCamera {
  public invertY: boolean = false;
}
    `,
      // https://github.com/typescript-eslint/typescript-eslint/issues/123
      'export default interface test {}',
      `declare function declareFn(): string;`,
      // ESLint
      'var x = 5;',
      'var x =5, y;',
      'foo();',
      'x = foo();',
      'setTimeout(function() {foo = "bar"; });',
      'setTimeout(function() {foo = "bar";});',
      'for (var a in b){}',
      'if (true) {}\n;[global, extended].forEach(function(){});',
      "throw new Error('foo');",
      'debugger;',
      '++\nfoo;',
      'for (let thing of {}) {\n  console.log(thing);\n}',
      'do{}while(true);',

      // method definitions don't have a semicolon.
      'class A { a() {} b() {} }',
      'var A = class { a() {} b() {} };',
      "import theDefault, { named1, named2 } from 'src/mylib';",

      // exports, "always"
      "export * from 'foo';",
      "export { foo } from 'foo';",
      'export var foo;',
      'export function foo () { }',
      'export function* foo () { }',
      'export class Foo { }',
      'export let foo;',
      'export const FOO = 42;',
      'export default function() { }',
      'export default function* () { }',
      'export default class { }',
      'export default foo || bar;',
      'export default (foo) => foo.bar();',
      'export default foo = 42;',
      'export default foo += 42;',
    ].reduce<TSESLint.ValidTestCase<Options>[]>((acc, code) => {
      acc.push({
        code,
        options: ['always'],
      });
      acc.push({
        code: code.replace(/;/g, ''),
        options: ['never'],
      });

      return acc;
    }, []),
  ],
  invalid: [
    {
      code: 'if (foo) { bar() }',
      output: 'if (foo) { bar(); }',
      options: ['always', { omitLastInOneLineBlock: false }],
      errors: [missingSemicolon],
    },
    {
      code: 'if (foo) { bar(); baz() }',
      output: 'if (foo) { bar(); baz(); }',
      options: ['always', { omitLastInOneLineBlock: false }],
      errors: [missingSemicolon],
    },
    {
      code: 'if (foo) { bar(); }',
      output: 'if (foo) { bar() }',
      options: ['always', { omitLastInOneLineBlock: true }],
      errors: [extraSemicolon],
    },
    {
      code: 'if (foo) { bar(); baz(); }',
      output: 'if (foo) { bar(); baz() }',
      options: ['always', { omitLastInOneLineBlock: true }],
      errors: [extraSemicolon],
    },

    {
      code: `
        import a from "a"
        (function() {
            // ...
        })()
      `,
      output: `
        import a from "a";
        (function() {
            // ...
        })()
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
      errors: [missingSemicolon],
    },
    {
      code: `
        import a from "a"
        ;(function() {
            // ...
        })()
      `,
      output: `
        import a from "a"
        (function() {
            // ...
        })()
      `,
      options: neverOptionWithoutContinuationChars,
      errors: [extraSemicolon],
    },

    {
      code: 'for (;;){var i;}',
      output: 'for (;;){var i}',
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: 'for (;;) var i; ',
      output: 'for (;;) var i ',
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: 'for (var j;;) {var i;}',
      output: 'for (var j;;) {var i}',
      options: neverOption,
      errors: [extraSemicolon],
    },

    {
      code: 'for (;;){var i}',
      output: 'for (;;){var i;}',
      errors: [missingSemicolon],
    },
    {
      code: 'for (;;) var i ',
      output: 'for (;;) var i; ',
      errors: [missingSemicolon],
    },
    {
      code: 'for (var j;;) {var i}',
      output: 'for (var j;;) {var i;}',
      errors: [missingSemicolon],
    },
    {
      code: 'var foo = {\n bar: baz\n}',
      output: 'var foo = {\n bar: baz\n};',
      errors: [missingSemicolon],
    },

    {
      code: 'if (foo) { bar()\n }',
      output: 'if (foo) { bar();\n }',
      options: ['always', { omitLastInOneLineBlock: true }],
      errors: [missingSemicolon],
    },
    {
      code: 'if (foo) {\n bar() }',
      output: 'if (foo) {\n bar(); }',
      options: ['always', { omitLastInOneLineBlock: true }],
      errors: [missingSemicolon],
    },
    {
      code: 'if (foo) {\n bar(); baz() }',
      output: 'if (foo) {\n bar(); baz(); }',
      options: ['always', { omitLastInOneLineBlock: true }],
      errors: [missingSemicolon],
    },

    // https://github.com/eslint/eslint/issues/9521
    {
      code: `
        import a from "a"
        [1,2,3].forEach(doSomething)
      `,
      output: `
        import a from "a";
        [1,2,3].forEach(doSomething)
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],

      errors: [missingSemicolon],
    },
    {
      code: `
        var a = 0; export {a}
        [a] = b
      `,
      output: `
        var a = 0; export {a};
        [a] = b
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],

      errors: [missingSemicolon],
    },
    {
      code: `
        function wrap() {
          return
          ({a} = b)
        }
      `,
      output: `
        function wrap() {
          return;
          ({a} = b)
        }
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
      parserOptions: { ecmaVersion: 2015 },
      errors: [missingSemicolon],
    },
    {
      code: `
        while (true) {
          break
          +i
        }
      `,
      output: `
        while (true) {
          break;
          +i
        }
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
      errors: [missingSemicolon],
    },
    {
      code: `
        while (true) {
          continue
          [1,2,3].forEach(doSomething)
        }
      `,
      output: `
        while (true) {
          continue;
          [1,2,3].forEach(doSomething)
        }
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
      errors: [missingSemicolon],
    },
    {
      code: `
        do; while(a)
        [1,2,3].forEach(doSomething)
      `,
      output: `
        do; while(a);
        [1,2,3].forEach(doSomething)
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
      errors: [missingSemicolon],
    },
    {
      code: `
        const f = () => {}
        [1,2,3].forEach(doSomething)
      `,
      output: `
        const f = () => {};
        [1,2,3].forEach(doSomething)
      `,
      options: ['never', { beforeStatementContinuationChars: 'always' }],
      parserOptions: { ecmaVersion: 2015 },
      errors: [missingSemicolon],
    },
    {
      code: `
        import a from "a";
        [1,2,3].forEach(doSomething)
      `,
      output: `
        import a from "a"
        [1,2,3].forEach(doSomething)
      `,
      options: neverOptionWithoutContinuationChars,

      errors: [extraSemicolon],
    },
    {
      code: `
        var a = 0; export {a};
        [a] = b
      `,
      output: `
        var a = 0; export {a}
        [a] = b
      `,
      options: neverOptionWithoutContinuationChars,

      errors: [extraSemicolon],
    },
    {
      code: `
        function wrap() {
          return;
          ({a} = b)
        }
      `,
      output: `
        function wrap() {
          return
          ({a} = b)
        }
      `,
      options: neverOptionWithoutContinuationChars,
      parserOptions: { ecmaVersion: 2015 },
      errors: [extraSemicolon],
    },
    {
      code: `
        while (true) {
          break;
          +i
        }
      `,
      output: `
        while (true) {
          break
          +i
        }
      `,
      options: neverOptionWithoutContinuationChars,
      errors: [extraSemicolon],
    },
    {
      code: `
        while (true) {
          continue;
          [1,2,3].forEach(doSomething)
        }
      `,
      output: `
        while (true) {
          continue
          [1,2,3].forEach(doSomething)
        }
      `,
      options: neverOptionWithoutContinuationChars,
      errors: [extraSemicolon],
    },
    {
      code: `
        do; while(a);
        [1,2,3].forEach(doSomething)
      `,
      output: `
        do; while(a)
        [1,2,3].forEach(doSomething)
      `,
      options: neverOptionWithoutContinuationChars,
      errors: [extraSemicolon],
    },
    {
      code: `
        const f = () => {};
        [1,2,3].forEach(doSomething)
      `,
      output: `
        const f = () => {}
        [1,2,3].forEach(doSomething)
      `,
      options: neverOptionWithoutContinuationChars,
      parserOptions: { ecmaVersion: 2015 },
      errors: [extraSemicolon],
    },
    {
      code: `
        import a from "a"
        ;[1,2,3].forEach(doSomething)
      `,
      output: `
        import a from "a"
        [1,2,3].forEach(doSomething)
      `,
      options: neverOptionWithoutContinuationChars,

      errors: [extraSemicolon],
    },
    {
      code: `
        var a = 0; export {a}
        ;[1,2,3].forEach(doSomething)
      `,
      output: `
        var a = 0; export {a}
        [1,2,3].forEach(doSomething)
      `,
      options: neverOptionWithoutContinuationChars,

      errors: [extraSemicolon],
    },
    {
      code: `
        function wrap() {
          return
          ;[1,2,3].forEach(doSomething)
        }
      `,
      output: `
        function wrap() {
          return
          [1,2,3].forEach(doSomething)
        }
      `,
      options: neverOptionWithoutContinuationChars,
      errors: [extraSemicolon],
    },
    {
      code: `
        while (true) {
          break
          ;[1,2,3].forEach(doSomething)
        }
      `,
      output: `
        while (true) {
          break
          [1,2,3].forEach(doSomething)
        }
      `,
      options: neverOptionWithoutContinuationChars,
      errors: [extraSemicolon],
    },
    {
      code: `
        while (true) {
          continue
          ;[1,2,3].forEach(doSomething)
        }
      `,
      output: `
        while (true) {
          continue
          [1,2,3].forEach(doSomething)
        }
      `,
      options: neverOptionWithoutContinuationChars,
      errors: [extraSemicolon],
    },
    {
      code: `
        do; while(a)
        ;[1,2,3].forEach(doSomething)
      `,
      output: `
        do; while(a)
        [1,2,3].forEach(doSomething)
      `,
      options: neverOptionWithoutContinuationChars,
      errors: [extraSemicolon],
    },
    {
      code: `
        const f = () => {}
        ;[1,2,3].forEach(doSomething)
      `,
      output: `
        const f = () => {}
        [1,2,3].forEach(doSomething)
      `,
      options: neverOptionWithoutContinuationChars,
      parserOptions: { ecmaVersion: 2015 },
      errors: [extraSemicolon],
    },

    ...[
      {
        code: `declare function declareFn(): string;`,
        errors: [
          {
            line: 1,
          },
        ],
      },

      // https://github.com/typescript-eslint/typescript-eslint/issues/366
      {
        code: 'export = Foo;',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'import f = require("f");',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'type Foo = {};',
        errors: [
          {
            line: 1,
          },
        ],
      },

      // https://github.com/typescript-eslint/typescript-eslint/issues/409
      {
        code: `
class Class {
    prop: string;
}
      `,
        errors: [
          {
            line: 3,
          },
        ],
      },
      {
        code: `
abstract class AbsClass {
    abstract prop: string;
    abstract meth(): string;
}
      `,
        errors: [
          {
            line: 3,
          },
          {
            line: 4,
          },
        ],
      },
      {
        code: `
class PanCamera extends FreeCamera {
  public invertY: boolean = false;
}
    `,
        errors: [
          {
            line: 3,
          },
        ],
      },

      //     // ESLint
      {
        code: "throw new Error('foo');",
        output: "throw new Error('foo')",
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'function foo() { return []; }',
        output: 'function foo() { return [] }',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'while(true) { break; }',
        output: 'while(true) { break }',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'while(true) { continue; }',
        output: 'while(true) { continue }',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'let x = 5;',
        output: 'let x = 5',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'var x = 5;',
        output: 'var x = 5',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'var x = 5, y;',
        output: 'var x = 5, y',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'debugger;',
        output: 'debugger',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'foo();',
        output: 'foo()',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'for (var a in b) var i; ',
        output: 'for (var a in b) var i ',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'var foo = {\n bar: baz\n};',
        output: 'var foo = {\n bar: baz\n}',
        errors: [
          {
            line: 3,
          },
        ],
      },
      {
        code: "import theDefault, { named1, named2 } from 'src/mylib';",
        output: "import theDefault, { named1, named2 } from 'src/mylib'",
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'do{}while(true);',
        output: 'do{}while(true)',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: "import * as utils from './utils';",
        output: "import * as utils from './utils'",
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: "import { square, diag } from 'lib';",
        output: "import { square, diag } from 'lib'",
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: "import { default as foo } from 'lib';",
        output: "import { default as foo } from 'lib'",
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: "import 'src/mylib';",
        output: "import 'src/mylib'",
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'var foo;\nvar bar;',
        output: 'var foo\nvar bar',
        errors: [
          {
            line: 1,
          },
          {
            line: 2,
          },
        ],
      },

      // exports, "never"
      {
        code: "export * from 'foo';",
        output: "export * from 'foo'",
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: "export { foo } from 'foo';",
        output: "export { foo } from 'foo'",
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'var foo = 0;\nexport { foo };',
        output: 'var foo = 0\nexport { foo }',
        errors: [
          {
            line: 1,
          },
          {
            line: 2,
          },
        ],
      },
      {
        code: 'export var foo;',
        output: 'export var foo',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'export let foo;',
        output: 'export let foo',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'export const FOO = 42;',
        output: 'export const FOO = 42',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'export default foo || bar;',
        output: 'export default foo || bar',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'export default (foo) => foo.bar();',
        output: 'export default (foo) => foo.bar()',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'export default foo = 42;',
        output: 'export default foo = 42',
        errors: [
          {
            line: 1,
          },
        ],
      },
      {
        code: 'a;\n++b;',
        output: 'a\n++b;',
        errors: [
          {
            line: 1,
          },
          {
            line: 2,
          },
        ],
      },
    ].reduce<TSESLint.InvalidTestCase<MessageIds, Options>[]>((acc, test) => {
      acc.push({
        code: test.code.replace(/;/g, ''),
        output: test.code,
        options: ['always'],
        errors: test.errors.map(e => ({
          ...e,
          ...missingSemicolon,
        })),
      });
      acc.push({
        code: test.code,
        output: test.output ?? test.code.replace(/;/g, ''),
        options: ['never'],
        errors: test.errors.map(e => ({
          ...e,
          ...extraSemicolon,
        })),
      });

      return acc;
    }, []),
  ],
});
