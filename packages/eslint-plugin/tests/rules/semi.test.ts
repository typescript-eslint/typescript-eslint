import rule from '../../src/rules/semi';
import { RuleTester } from '../RuleTester';
import {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../src/util';

type MessageIds = InferMessageIdsTypeFromRule<typeof rule>;
type Options = InferOptionsTypeFromRule<typeof rule>;

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

const neverOption: Options = ['never'];
const neverOptionWithoutContinuationChars: Options = [
  'never',
  { beforeStatementContinuationChars: 'never' },
];

// the base rule doesn't use a message id...
const missingSemicolon: any = {
  message: 'Missing semicolon.',
};

const extraSemicolon: any = {
  message: 'Extra semicolon.',
};

ruleTester.run<MessageIds, Options>('semi', rule, {
  valid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/366
    { code: 'type Foo = {}', options: neverOption },
    'type Foo = {};',
    // https://github.com/typescript-eslint/typescript-eslint/issues/409
    {
      code: `
    class PanCamera extends FreeCamera {
      public invertY: boolean = false;
    }
    `,
    },
    {
      code: `
    class PanCamera extends FreeCamera {
      public invertY: boolean = false
    }
    `,
      options: neverOption,
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/123
    'export default interface test {}',
    // ESLint
    'var x = 5;',
    'var x =5, y;',
    'foo();',
    'x = foo();',
    'setTimeout(function() {foo = "bar"; });',
    'setTimeout(function() {foo = "bar";});',
    'for (var a in b){}',
    'for (var i;;){}',
    'if (true) {}\n;[global, extended].forEach(function(){});',
    "throw new Error('foo');",
    { code: "throw new Error('foo')", options: neverOption },
    { code: 'var x = 5', options: neverOption },
    { code: 'var x =5, y', options: neverOption },
    { code: 'foo()', options: neverOption },
    { code: 'debugger', options: neverOption },
    { code: 'for (var a in b){}', options: neverOption },
    { code: 'for (var i;;){}', options: neverOption },
    { code: 'x = foo()', options: neverOption },
    {
      code: 'if (true) {}\n;[global, extended].forEach(function(){})',
      options: neverOption,
    },
    { code: '(function bar() {})\n;(function foo(){})', options: neverOption },
    { code: ";/foo/.test('bar')", options: neverOption },
    { code: ';+5', options: neverOption },
    { code: ';-foo()', options: neverOption },
    { code: 'a++\nb++', options: neverOption },
    { code: 'a++; b++', options: neverOption },
    {
      code: 'for (let thing of {}) {\n  console.log(thing);\n}',
    },
    { code: 'do{}while(true)', options: neverOption },
    { code: 'do{}while(true);', options: ['always'] },

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

    // method definitions don't have a semicolon.
    { code: 'class A { a() {} b() {} }' },
    {
      code: 'var A = class { a() {} b() {} };',
    },

    {
      code: "import theDefault, { named1, named2 } from 'src/mylib';",
    },
    {
      code: "import theDefault, { named1, named2 } from 'src/mylib'",
      options: neverOption,
    },

    // exports, "always"
    { code: "export * from 'foo';" },
    {
      code: "export { foo } from 'foo';",
    },
    {
      code: 'var foo = 0;export { foo };',
    },
    { code: 'export var foo;' },
    {
      code: 'export function foo () { }',
    },
    {
      code: 'export function* foo () { }',
    },
    { code: 'export class Foo { }' },
    { code: 'export let foo;' },
    { code: 'export const FOO = 42;' },
    {
      code: 'export default function() { }',
    },
    {
      code: 'export default function* () { }',
    },
    {
      code: 'export default class { }',
    },
    {
      code: 'export default foo || bar;',
    },
    {
      code: 'export default (foo) => foo.bar();',
    },
    {
      code: 'export default foo = 42;',
    },
    {
      code: 'export default foo += 42;',
    },

    // exports, "never"
    {
      code: "export * from 'foo'",
      options: neverOption,
    },
    {
      code: "export { foo } from 'foo'",
      options: neverOption,
    },
    {
      code: 'var foo = 0; export { foo }',
      options: neverOption,
    },
    {
      code: 'export var foo',
      options: neverOption,
    },
    {
      code: 'export function foo () { }',
      options: neverOption,
    },
    {
      code: 'export function* foo () { }',
      options: neverOption,
    },
    {
      code: 'export class Foo { }',
      options: neverOption,
    },
    {
      code: 'export let foo',
      options: neverOption,
    },
    {
      code: 'export const FOO = 42',
      options: neverOption,
    },
    {
      code: 'export default function() { }',
      options: neverOption,
    },
    {
      code: 'export default function* () { }',
      options: neverOption,
    },
    {
      code: 'export default class { }',
      options: neverOption,
    },
    {
      code: 'export default foo || bar',
      options: neverOption,
    },
    {
      code: 'export default (foo) => foo.bar()',
      options: neverOption,
    },
    {
      code: 'export default foo = 42',
      options: neverOption,
    },
    {
      code: 'export default foo += 42',
      options: neverOption,
    },
    { code: '++\nfoo;', options: ['always'] },
    { code: 'var a = b;\n+ c', options: neverOption },

    // https://github.com/eslint/eslint/issues/7782
    { code: 'var a = b;\n/foo/.test(c)', options: neverOption },
    {
      code: 'var a = b;\n`foo`',
      options: neverOption,
    },

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
  ],
  invalid: [
    // https://github.com/typescript-eslint/typescript-eslint/issues/366
    {
      code: 'type Foo = {};',
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: 'type Foo = {}',
      errors: [missingSemicolon],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/409
    {
      code: `
    class PanCamera extends FreeCamera {
      public invertY: boolean = false
    }
    `,
      errors: [missingSemicolon],
    },
    {
      code: `
    class PanCamera extends FreeCamera {
      public invertY: boolean = false;
    }
    `,
      options: neverOption,
      errors: [extraSemicolon],
    },
    // ESLint
    {
      code: 'if (foo) { bar() }',
      options: ['always', { omitLastInOneLineBlock: false }] as Options,
      errors: [missingSemicolon],
    },
    {
      code: 'if (foo) { bar(); baz() }',
      options: ['always', { omitLastInOneLineBlock: false }] as Options,
      errors: [missingSemicolon],
    },
    {
      code: 'if (foo) { bar(); }',
      options: ['always', { omitLastInOneLineBlock: true }] as Options,
      errors: [extraSemicolon],
    },
    {
      code: 'if (foo) { bar(); baz(); }',
      options: ['always', { omitLastInOneLineBlock: true }] as Options,
      errors: [extraSemicolon],
    },
    {
      code: `
import a from "a"

(function() {
    // ...
})()
`,
      options: [
        'never',
        { beforeStatementContinuationChars: 'always' },
      ] as Options,
      errors: [missingSemicolon],
    },
    {
      code: `
import a from "a"

;(function() {
    // ...
})()
`,
      options: neverOptionWithoutContinuationChars,
      errors: [extraSemicolon],
    },
    {
      code: "import * as utils from './utils'",
      output: "import * as utils from './utils';",

      errors: [missingSemicolon],
    },
    {
      code: "import { square, diag } from 'lib'",
      output: "import { square, diag } from 'lib';",

      errors: [missingSemicolon],
    },
    {
      code: "import { default as foo } from 'lib'",
      output: "import { default as foo } from 'lib';",

      errors: [missingSemicolon],
    },
    {
      code: "import 'src/mylib'",
      output: "import 'src/mylib';",

      errors: [missingSemicolon],
    },
    {
      code: "import theDefault, { named1, named2 } from 'src/mylib'",
      output: "import theDefault, { named1, named2 } from 'src/mylib';",

      errors: [missingSemicolon],
    },
    {
      code: 'function foo() { return [] }',
      output: 'function foo() { return []; }',
      errors: [missingSemicolon],
    },
    {
      code: 'while(true) { break }',
      output: 'while(true) { break; }',
      errors: [missingSemicolon],
    },
    {
      code: 'while(true) { continue }',
      output: 'while(true) { continue; }',
      errors: [missingSemicolon],
    },
    {
      code: 'let x = 5',
      output: 'let x = 5;',

      errors: [missingSemicolon],
    },
    {
      code: 'var x = 5',
      output: 'var x = 5;',
      errors: [missingSemicolon],
    },
    {
      code: 'var x = 5, y',
      output: 'var x = 5, y;',
      errors: [missingSemicolon],
    },
    {
      code: 'debugger',
      output: 'debugger;',
      errors: [missingSemicolon],
    },
    {
      code: 'foo()',
      output: 'foo();',
      errors: [missingSemicolon],
    },
    {
      code: 'for (var a in b) var i ',
      output: 'for (var a in b) var i; ',
      errors: [missingSemicolon],
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
      code: 'var foo\nvar bar;',
      output: 'var foo;\nvar bar;',
      errors: [missingSemicolon],
    },
    {
      code: "throw new Error('foo')",
      output: "throw new Error('foo');",
      errors: [missingSemicolon],
    },
    {
      code: 'do{}while(true)',
      output: 'do{}while(true);',
      errors: [missingSemicolon],
    },

    {
      code: "throw new Error('foo');",
      output: "throw new Error('foo')",
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: 'function foo() { return []; }',
      output: 'function foo() { return [] }',
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: 'while(true) { break; }',
      output: 'while(true) { break }',
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: 'while(true) { continue; }',
      output: 'while(true) { continue }',
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: 'let x = 5;',
      output: 'let x = 5',
      options: neverOption,

      errors: [extraSemicolon],
    },
    {
      code: 'var x = 5;',
      output: 'var x = 5',
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: 'var x = 5, y;',
      output: 'var x = 5, y',
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: 'debugger;',
      output: 'debugger',
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: 'foo();',
      output: 'foo()',
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: 'for (var a in b) var i; ',
      output: 'for (var a in b) var i ',
      options: neverOption,
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
      code: 'var foo = {\n bar: baz\n};',
      output: 'var foo = {\n bar: baz\n}',
      options: neverOption,
      errors: [extraSemicolon],
    },
    {
      code: "import theDefault, { named1, named2 } from 'src/mylib';",
      output: "import theDefault, { named1, named2 } from 'src/mylib'",
      options: neverOption,

      errors: [extraSemicolon],
    },
    {
      code: 'do{}while(true);',
      output: 'do{}while(true)',
      options: neverOption,
      errors: [extraSemicolon],
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
    {
      code: 'if (foo) { bar(); }',
      output: 'if (foo) { bar() }',
      options: ['always', { omitLastInOneLineBlock: true }],
      errors: [{ message: 'Extra semicolon.' }],
    },

    // exports, "always"
    {
      code: "export * from 'foo'",
      output: "export * from 'foo';",

      errors: [missingSemicolon],
    },
    {
      code: "export { foo } from 'foo'",
      output: "export { foo } from 'foo';",

      errors: [missingSemicolon],
    },
    {
      code: 'var foo = 0;export { foo }',
      output: 'var foo = 0;export { foo };',

      errors: [missingSemicolon],
    },
    {
      code: 'export var foo',
      output: 'export var foo;',

      errors: [missingSemicolon],
    },
    {
      code: 'export let foo',
      output: 'export let foo;',

      errors: [missingSemicolon],
    },
    {
      code: 'export const FOO = 42',
      output: 'export const FOO = 42;',

      errors: [missingSemicolon],
    },
    {
      code: 'export default foo || bar',
      output: 'export default foo || bar;',

      errors: [missingSemicolon],
    },
    {
      code: 'export default (foo) => foo.bar()',
      output: 'export default (foo) => foo.bar();',

      errors: [missingSemicolon],
    },
    {
      code: 'export default foo = 42',
      output: 'export default foo = 42;',

      errors: [missingSemicolon],
    },
    {
      code: 'export default foo += 42',
      output: 'export default foo += 42;',

      errors: [missingSemicolon],
    },

    // exports, "never"
    {
      code: "export * from 'foo';",
      output: "export * from 'foo'",
      options: neverOption,

      errors: [extraSemicolon],
    },
    {
      code: "export { foo } from 'foo';",
      output: "export { foo } from 'foo'",
      options: neverOption,

      errors: [{ message: 'Extra semicolon.', type: 'ExportNamedDeclaration' }],
    },
    {
      code: 'var foo = 0;export { foo };',
      output: 'var foo = 0;export { foo }',
      options: neverOption,

      errors: [{ message: 'Extra semicolon.', type: 'ExportNamedDeclaration' }],
    },
    {
      code: 'export var foo;',
      output: 'export var foo',
      options: neverOption,

      errors: [{ message: 'Extra semicolon.', type: 'VariableDeclaration' }],
    },
    {
      code: 'export let foo;',
      output: 'export let foo',
      options: neverOption,

      errors: [{ message: 'Extra semicolon.', type: 'VariableDeclaration' }],
    },
    {
      code: 'export const FOO = 42;',
      output: 'export const FOO = 42',
      options: neverOption,

      errors: [{ message: 'Extra semicolon.', type: 'VariableDeclaration' }],
    },
    {
      code: 'export default foo || bar;',
      output: 'export default foo || bar',
      options: neverOption,

      errors: [
        { message: 'Extra semicolon.', type: 'ExportDefaultDeclaration' },
      ],
    },
    {
      code: 'export default (foo) => foo.bar();',
      output: 'export default (foo) => foo.bar()',
      options: neverOption,

      errors: [
        { message: 'Extra semicolon.', type: 'ExportDefaultDeclaration' },
      ],
    },
    {
      code: 'export default foo = 42;',
      output: 'export default foo = 42',
      options: neverOption,

      errors: [
        { message: 'Extra semicolon.', type: 'ExportDefaultDeclaration' },
      ],
    },
    {
      code: 'export default foo += 42;',
      output: 'export default foo += 42',
      options: neverOption,

      errors: [
        { message: 'Extra semicolon.', type: 'ExportDefaultDeclaration' },
      ],
    },
    {
      code: 'a;\n++b',
      output: 'a\n++b',
      options: neverOption,
      errors: [{ message: 'Extra semicolon.' }],
    },

    // https://github.com/eslint/eslint/issues/7928
    {
      code: [
        '/*eslint no-extra-semi: error */',
        'foo();',
        ';[0,1,2].forEach(bar)',
      ].join('\n'),
      output: [
        '/*eslint no-extra-semi: error */',
        'foo()',
        ';[0,1,2].forEach(bar)',
      ].join('\n'),
      options: neverOption,
      errors: ['Extra semicolon.', 'Unnecessary semicolon.'],
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

      errors: ['Missing semicolon.'],
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

      errors: ['Missing semicolon.'],
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
      errors: ['Missing semicolon.'],
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
      errors: ['Missing semicolon.'],
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
      errors: ['Missing semicolon.'],
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
      errors: ['Missing semicolon.'],
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
      errors: ['Missing semicolon.'],
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
  ],
});
