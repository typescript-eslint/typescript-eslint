/* eslint-disable eslint-comments/no-use */
// this rule tests extra parens, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-extra-parens';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-extra-parens', rule, {
  valid: [
    'async function f(arg: any) { await (arg as Promise<void>); }',
    'async function f(arg: Promise<any>) { await arg; }',
    '(0).toString();',
    '(function(){}) ? a() : b();',
    '(/^a$/).test(x);',
    'for (a of (b, c));',
    'for (a of b);',
    'for (a in b, c);',
    'for (a in b);',
    "a<import('')>(1);",
    "new a<import('')>(1);",
    'a<A>(1);',
    {
      code: `
while ((foo = bar())) {}
      `,
      options: ['all', { conditionalAssign: false }],
    },
    {
      code: `
if ((foo = bar())) {}
      `,
      options: ['all', { conditionalAssign: false }],
    },
    {
      code: `
do; while ((foo = bar()))
      `,
      options: ['all', { conditionalAssign: false }],
    },
    {
      code: `
for (;(a = b););
      `,
      options: ['all', { conditionalAssign: false }],
    },
    {
      code: `
        function a(b) {
          return (b = 1);
        }
      `,
      options: ['all', { returnAssign: false }],
    },
    {
      code: `
        function a(b) {
          return b ? (c = d) : (c = e);
        }
      `,
      options: ['all', { returnAssign: false }],
    },
    {
      code: 'b => (b = 1);',
      options: ['all', { returnAssign: false }],
    },
    {
      code: 'b => b ? (c = d) : (c = e);',
      options: ['all', { returnAssign: false }],
    },
    {
      code: `
x = a || (b && c);
      `,
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: `
x = a + (b * c);
      `,
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: `
x = (a * b) / c;
      `,
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: `
const Component = (<div />)
const Component = (
    <div
        prop={true}
    />
)
      `,
      options: ['all', { ignoreJSX: 'all' }],
    },
    {
      code: `
const Component = (
    <div>
        <p />
    </div>
)
const Component = (
    <div
        prop={true}
    />
)
      `,
      options: ['all', { ignoreJSX: 'multi-line' }],
    },
    {
      code: `
const Component = (<div />)
      `,
      options: ['all', { ignoreJSX: 'single-line' }],
    },
    {
      code: `
const Component = (<div><p /></div>)
      `,
      options: ['all', { ignoreJSX: 'single-line' }],
    },
    {
      code: `
const b = a => 1 ? 2 : 3;
      `,
      options: ['all', { enforceForArrowConditionals: false }],
    },
    {
      code: `
const d = c => (1 ? 2 : 3);
      `,
      options: ['all', { enforceForArrowConditionals: false }],
    },
    {
      code: `
(0).toString();
      `,
      options: ['functions'],
    },
    {
      code: `
(Object.prototype.toString.call());
      `,
      options: ['functions'],
    },
    {
      code: `
({}.toString.call());
      `,
      options: ['functions'],
    },
    {
      code: `
(function(){} ? a() : b());
      `,
      options: ['functions'],
    },
    {
      code: `
(/^a$/).test(x);
      `,
      options: ['functions'],
    },
    {
      code: `
a = (b * c);
      `,
      options: ['functions'],
    },
    {
      code: `
(a * b) + c;
      `,
      options: ['functions'],
    },
    {
      code: `
typeof (a);
      `,
      options: ['functions'],
    },
    {
      code: 'const x = (1 as 1) | (1 as 1);',
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: 'const x = (<1>1) | (<1>1);',
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: 'const x = (1 as 1) | 2;',
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: 'const x = (1 as 1) + 2 + 2;',
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: 'const x = 1 + 1 + (2 as 2);',
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: 'const x = 1 | (2 as 2);',
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: 'const x = (<1>1) | 2;',
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: 'const x = 1 | (<2>2);',
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: "t.true((me.get as SinonStub).calledWithExactly('/foo', other));",
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: "t.true((<SinonStub>me.get).calledWithExactly('/foo', other));",
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: "(requestInit.headers as Headers).get('Cookie');",
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: "(<Headers> requestInit.headers).get('Cookie');",
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    { code: 'class Foo {}', parserOptions: { ecmaFeatures: { jsx: false } } },
    {
      code: 'class Foo extends (Bar as any) {}',
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: 'const foo = class {};',
      parserOptions: { ecmaFeatures: { jsx: false } },
    },
    {
      code: 'const foo = class extends (Bar as any) {}',
      parserOptions: { ecmaFeatures: { jsx: false } },
    },

    { code: '[a as b];', options: ['all', { nestedBinaryExpressions: false }] },
    {
      code: '() => (1 as 1);',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'x = a as b;',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = (1 as 1) | 2;',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = 1 | (2 as 2);',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = await (foo as Promise<void>);',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const res2 = (fn as foo)();',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: '(x as boolean) ? 1 : 0;',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'x ? (1 as 1) : 2;',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'x ? 1 : (2 as 2);',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'while (foo as boolean) {};',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'do {} while (foo as boolean);',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'for (let i of ([] as Foo)) {}',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'for (let i in ({} as Foo)) {}',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'for ((1 as 1);;) {}',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'for (;(1 as 1);) {}',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'for (;;(1 as 1)) {}',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'if (1 as 1) {}',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = (1 as 1).toString();',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'new (1 as 1)();',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = { ...(1 as 1), ...{} };',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'throw (1 as 1);',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    { code: 'throw 1;', options: ['all', { nestedBinaryExpressions: false }] },
    {
      code: 'const x = !(1 as 1);',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = (1 as 1)++;',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'function *x() { yield (1 as 1); yield 1; }',
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'switch (foo) { case 1: case (2 as 2): break; default: break; }',
      options: ['all', { nestedBinaryExpressions: false }],
    },

    {
      code: '[<b>a];',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: '() => (<1>1);',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'x = <b>a;',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = (<1>1) | 2;',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = 1 | (<2>2);',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = await (<Promise<void>>foo);',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const res2 = (<foo>fn)();',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: '(<boolean>x) ? 1 : 0;',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'x ? (<1>1) : 2;',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'x ? 1 : (<2>2);',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'while (<boolean>foo) {};',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'do {} while (<boolean>foo);',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'for (let i of (<Foo>[])) {}',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'for (let i in (<Foo>{})) {}',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'for ((<1>1);;) {}',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'for (;(<1>1);) {}',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'for (;;(<1>1)) {}',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'if (<1>1) {}',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = (<1>1).toString();',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'new (<1>1)();',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = { ...(<1>1), ...{} };',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'throw (<1>1);',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'throw 1;',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = !(<1>1);',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'const x = (<1>1)++;',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'function *x() { yield (<1>1); yield 1; }',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },
    {
      code: 'switch (foo) { case 1: case (<2>2): break; default: break; }',
      parserOptions: { ecmaFeatures: { jsx: false } },
      options: ['all', { nestedBinaryExpressions: false }],
    },

    {
      code: `
declare const f: <T>(x: T) => any
      `,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: `
f<(number | string)[]>(['a', 1])
      `,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  ],

  invalid: [
    {
      code: 'a = (b * c);',
      output: 'a = b * c;',
      errors: [
        {
          messageId: 'unexpected',
          column: 5,
        },
      ],
    },
    {
      code: '(a * b) + c;',
      output: 'a * b + c;',
      errors: [
        {
          messageId: 'unexpected',
          column: 1,
        },
      ],
    },
    {
      code: 'for (a in (b, c));',
      output: 'for (a in b, c);',
      errors: [
        {
          messageId: 'unexpected',
          column: 11,
        },
      ],
    },
    {
      code: 'for (a in (b));',
      output: 'for (a in b);',
      errors: [
        {
          messageId: 'unexpected',
          column: 11,
        },
      ],
    },
    {
      code: 'for (a of (b));',
      output: 'for (a of b);',
      errors: [
        {
          messageId: 'unexpected',
          column: 11,
        },
      ],
    },
    {
      code: 'typeof (a);',
      output: 'typeof a;',
      errors: [
        {
          messageId: 'unexpected',
          column: 8,
        },
      ],
    },
    {
      code: "a<import('')>((1));",
      output: "a<import('')>(1);",
      errors: [
        {
          messageId: 'unexpected',
          column: 15,
        },
      ],
    },
    {
      code: "new a<import('')>((1));",
      output: "new a<import('')>(1);",
      errors: [
        {
          messageId: 'unexpected',
          column: 19,
        },
      ],
    },
    {
      code: 'a<(A)>((1));',
      output: 'a<(A)>(1);',
      errors: [
        {
          messageId: 'unexpected',
          column: 8,
        },
      ],
    },
    {
      code: 'async function f(arg: Promise<any>) { await (arg); }',
      output: 'async function f(arg: Promise<any>) { await arg; }',
      errors: [
        {
          messageId: 'unexpected',
          column: 45,
        },
      ],
    },
    {
      code: 'async function f(arg: any) { await ((arg as Promise<void>)); }',
      output: 'async function f(arg: any) { await (arg as Promise<void>); }',
      errors: [
        {
          messageId: 'unexpected',
          column: 37,
        },
      ],
    },
    {
      code: 'class Foo extends ((Bar as any)) {}',
      output: 'class Foo extends (Bar as any) {}',
      errors: [
        {
          messageId: 'unexpected',
          column: 20,
        },
      ],
    },
    {
      code: 'class Foo extends (Bar) {}',
      output: 'class Foo extends Bar {}',
      errors: [
        {
          messageId: 'unexpected',
          column: 19,
        },
      ],
    },
    {
      code: 'const foo = class extends ((Bar as any)) {}',
      output: 'const foo = class extends (Bar as any) {}',
      errors: [
        {
          messageId: 'unexpected',
          column: 28,
        },
      ],
    },
    {
      code: 'const foo = class extends (Bar) {}',
      output: 'const foo = class extends Bar {}',
      errors: [
        {
          messageId: 'unexpected',
          column: 27,
        },
      ],
    },

    {
      code: `
        const Component = (<div />)
      `,
      output: `
        const Component = <div />
      `,
      options: ['all', { ignoreJSX: 'multi-line' }],
      errors: [
        {
          messageId: 'unexpected',
          column: 27,
        },
      ],
    },
    {
      code: `
        const Component = (<div><p /></div>)
      `,
      output: `
        const Component = <div><p /></div>
      `,
      options: ['all', { ignoreJSX: 'multi-line' }],
      errors: [
        {
          messageId: 'unexpected',
          column: 27,
        },
      ],
    },

    {
      code: `
const Component = (
    <div>
        <p />
    </div>
)
const Component = (
    <div
        prop={true}
    />
)
      `,
      output: `
const Component =${' '}
    <div>
        <p />
    </div>

const Component =${' '}
    <div
        prop={true}
    />

      `,
      options: ['all', { ignoreJSX: 'single-line' }],
      errors: [
        {
          messageId: 'unexpected',
          line: 2,
          column: 19,
        },
        {
          messageId: 'unexpected',
          line: 7,
          column: 19,
        },
      ],
    },
    {
      code: `
((function foo() {}))();
      `,
      output: `
(function foo() {})();
      `,
      options: ['functions'],
      errors: [
        {
          messageId: 'unexpected',
          column: 2,
        },
      ],
    },
    {
      code: `
var y = (function () {return 1;});
      `,
      output: `
var y = function () {return 1;};
      `,
      options: ['functions'],
      errors: [
        {
          messageId: 'unexpected',
          column: 9,
        },
      ],
    },
  ],
});
