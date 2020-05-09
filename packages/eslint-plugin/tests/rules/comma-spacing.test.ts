/* eslint-disable eslint-comments/no-use */
// this rule tests the spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import rule from '../../src/rules/comma-spacing';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('comma-spacing', rule, {
  valid: [
    "foo(1, true/* comment */, 'text');",
    "foo(1, true /* comment */, 'text');",
    "foo(1, true/* comment *//* comment */, 'text');",
    "foo(1, true/* comment */ /* comment */, 'text');",
    "foo(1, true, /* comment */ 'text');",
    "foo(1, // comment\n true, /* comment */ 'text');",
    {
      code: "foo(1, // comment\n true,/* comment */ 'text');",
      options: [{ before: false, after: false }],
    },
    'const a = 1, b = 2;',
    'const foo = [, ];',
    'const foo = [1, ];',
    'const foo = [, 2];',
    'const foo = [1, 2];',
    'const foo = [, , ];',
    'const foo = [1, , ];',
    'const foo = [, 2, ];',
    'const foo = [, , 3];',
    'const foo = [1, 2, ];',
    'const foo = [, 2, 3];',
    'const foo = [1, , 3];',
    'const foo = [1, 2, 3];',
    "const foo = {'foo':'foo', 'baz':'baz'};",
    "const foo = {'foo':'foo', 'baz':\n'baz'};",
    "const foo = {'foo':\n'foo', 'baz':\n'baz'};",
    'function foo(a, b){}',
    'function foo(a, b = 1){}',
    'function foo(a = 1, b, c){}',
    'const foo = (a, b) => {}',
    'const foo = (a=1, b) => {}',
    'const foo = a => a + 2',
    'a, b',
    'const a = (1 + 2, 2)',
    'a(b, c)',
    'new A(b, c)',
    'foo((a), b)',
    'const b = ((1 + 2), 2)',
    'parseInt((a + b), 10)',
    'go.boom((a + b), 10)',
    'go.boom((a + b), 10, (4))',
    'const x = [ (a + c), (b + b) ]',
    "['  ,  ']",
    '[`  ,  `]',
    '`${[1, 2]}`',
    'fn(a, b,)',
    'const fn = (a, b,) => {}',
    'const fn = function (a, b,) {}',
    "foo(/,/, 'a')",
    "const x = ',,,,,';",
    "const code = 'var foo = 1, bar = 3;'",
    "['apples', \n 'oranges'];",
    "{x: 'var x,y,z'}",
    {
      code: "const foo = {'foo':\n'bar' ,'baz':\n'qur'};",
      options: [{ before: true, after: false }],
    },
    {
      code: 'const a = 1 ,b = 2;',
      options: [{ before: true, after: false }],
    },
    {
      code: 'function foo(a ,b){}',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [,];',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [1 ,];',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [ ,2];',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [1 ,2];',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [,,];',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [1 , ,];',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [ ,2 ,];',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [ , ,3];',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [1 ,2 ,];',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [ ,2 ,3];',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [1 , ,3];',
      options: [{ before: true, after: false }],
    },
    {
      code: 'const arr = [1 ,2 ,3];',
      options: [{ before: true, after: false }],
    },
    {
      code: "const obj = {'foo':'bar' , 'baz':'qur'};",
      options: [{ before: true, after: true }],
    },
    {
      code: 'const a = 1 , b = 2;',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [, ];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [1 , ];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [ , 2];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [1 , 2];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [, , ];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [1 , , ];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [ , 2 , ];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [ , , 3];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [1 , 2 , ];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [, 2 , 3];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [1 , , 3];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [1 , 2 , 3];',
      options: [{ before: true, after: true }],
    },
    {
      code: 'a , b',
      options: [{ before: true, after: true }],
    },
    {
      code: 'const arr = [,];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [ ,];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [1,];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [,2];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [ ,2];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [1,2];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [,,];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [ ,,];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [1,,];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [,2,];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [ ,2,];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [,,3];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [1,2,];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [,2,3];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [1,,3];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const arr = [1,2,3];',
      options: [{ before: false, after: false }],
    },
    {
      code: 'const a = (1 + 2,2)',
      options: [{ before: false, after: false }],
    },
    'const a; console.log(`${a}`, "a");',
    'const [a, b] = [1, 2];',
    'const [a, b, ] = [1, 2];',
    'const [a, , b] = [1, 2, 3];',
    'const [ , b] = a;',
    'const [, b] = a;',
    {
      code: '<a>,</a>',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    {
      code: '<a>  ,  </a>',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    {
      code: '<a>Hello, world</a>',
      options: [{ before: true, after: false }],
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    'const Foo = <T,>(foo: T) => {}',
    'function foo<T,>() {}',
    'class Foo<T, T1> {}',
    'interface Foo<T, T1,>{}',
  ],

  invalid: [
    {
      code: 'a(b,c)',
      output: 'a(b , c)',
      options: [{ before: true, after: true }],
      errors: [
        {
          messageId: 'missing',
          column: 4,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 4,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'new A(b,c)',
      output: 'new A(b , c)',
      options: [{ before: true, after: true }],
      errors: [
        {
          messageId: 'missing',
          column: 8,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 8,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const a = 1 ,b = 2;',
      output: 'const a = 1, b = 2;',
      errors: [
        {
          messageId: 'unexpected',
          column: 13,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 13,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const arr = [1 , 2];',
      output: 'const arr = [1, 2];',
      errors: [
        {
          messageId: 'unexpected',
          column: 16,
          line: 1,
          data: { loc: 'before' },
        },
      ],
    },
    {
      code: 'const arr = [1 , ];',
      output: 'const arr = [1, ];',
      errors: [
        {
          messageId: 'unexpected',
          column: 16,
          line: 1,
          data: { loc: 'before' },
        },
      ],
    },
    {
      code: 'const arr = [1 , ];',
      output: 'const arr = [1 ,];',
      options: [{ before: true, after: false }],
      errors: [
        {
          messageId: 'unexpected',
          column: 16,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const arr = [1 ,2];',
      output: 'const arr = [1, 2];',
      errors: [
        {
          messageId: 'unexpected',
          column: 16,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: `missing`,
          column: 16,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const arr = [(1) , 2];',
      output: 'const arr = [(1), 2];',
      errors: [
        {
          messageId: 'unexpected',
          column: 18,
          line: 1,
          data: { loc: 'before' },
        },
      ],
    },
    {
      code: 'const arr = [1, 2];',
      output: 'const arr = [1 ,2];',
      options: [{ before: true, after: false }],
      errors: [
        {
          messageId: 'missing',
          column: 15,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'unexpected',
          column: 15,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const arr = [1\n  , 2];',
      output: 'const arr = [1\n  ,2];',
      options: [{ before: false, after: false }],
      errors: [
        {
          messageId: 'unexpected',
          column: 3,
          line: 2,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const arr = [1,\n  2];',
      output: 'const arr = [1 ,\n  2];',
      options: [{ before: true, after: false }],
      errors: [
        {
          messageId: 'missing',
          column: 15,
          line: 1,
          data: { loc: 'before' },
        },
      ],
    },
    {
      code: "const obj = {'foo':\n'bar', 'baz':\n'qur'};",
      output: "const obj = {'foo':\n'bar' ,'baz':\n'qur'};",
      options: [{ before: true, after: false }],
      errors: [
        {
          messageId: 'missing',
          column: 6,
          line: 2,
          data: { loc: 'before' },
        },
        {
          messageId: 'unexpected',
          column: 6,
          line: 2,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const obj = {a: 1\n  ,b: 2};',
      output: 'const obj = {a: 1\n  , b: 2};',
      options: [{ before: false, after: true }],
      errors: [
        {
          messageId: 'missing',
          column: 3,
          line: 2,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const obj = {a: 1 ,\n  b: 2};',
      output: 'const obj = {a: 1,\n  b: 2};',
      options: [{ before: false, after: false }],
      errors: [
        {
          messageId: 'unexpected',
          column: 19,
          line: 1,
          data: { loc: 'before' },
        },
      ],
    },
    {
      code: 'const arr = [1 ,2];',
      output: 'const arr = [1 , 2];',
      options: [{ before: true, after: true }],
      errors: [
        {
          messageId: 'missing',
          column: 16,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const arr = [1,2];',
      output: 'const arr = [1 , 2];',
      options: [{ before: true, after: true }],
      errors: [
        {
          messageId: 'missing',
          column: 15,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 15,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: "const obj = {'foo':\n'bar','baz':\n'qur'};",
      output: "const obj = {'foo':\n'bar' , 'baz':\n'qur'};",
      options: [{ before: true, after: true }],
      errors: [
        {
          messageId: 'missing',
          column: 6,
          line: 2,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 6,
          line: 2,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const arr = [1 , 2];',
      output: 'const arr = [1,2];',
      options: [{ before: false, after: false }],
      errors: [
        {
          messageId: 'unexpected',
          column: 16,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'unexpected',
          column: 16,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'a ,b',
      output: 'a, b',
      options: [{ before: false, after: true }],
      errors: [
        {
          messageId: 'unexpected',
          column: 3,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 3,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'function foo(a,b){}',
      output: 'function foo(a , b){}',
      options: [{ before: true, after: true }],
      errors: [
        {
          messageId: 'missing',
          column: 15,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 15,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const foo = (a,b) => {}',
      output: 'const foo = (a , b) => {}',
      options: [{ before: true, after: true }],
      errors: [
        {
          messageId: 'missing',
          column: 15,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 15,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'const foo = (a = 1,b) => {}',
      output: 'const foo = (a = 1 , b) => {}',
      options: [{ before: true, after: true }],
      errors: [
        {
          messageId: 'missing',
          column: 19,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 19,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'function foo(a = 1 ,b = 2) {}',
      output: 'function foo(a = 1, b = 2) {}',
      options: [{ before: false, after: true }],
      errors: [
        {
          messageId: 'unexpected',
          column: 20,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 20,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: '<a>{foo(1 ,2)}</a>',
      output: '<a>{foo(1, 2)}</a>',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      errors: [
        {
          messageId: 'unexpected',
          column: 11,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 11,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: "foo(1, true/* comment */ , 'foo');",
      output: "foo(1, true/* comment */, 'foo');",
      errors: [
        {
          messageId: 'unexpected',
          column: 26,
          line: 1,
          data: { loc: 'before' },
        },
      ],
    },
    {
      code: "foo(1, true,/* comment */ 'foo');",
      output: "foo(1, true, /* comment */ 'foo');",
      errors: [
        {
          messageId: 'missing',
          column: 12,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: "foo(404,// comment\n true, 'hello');",
      output: "foo(404, // comment\n true, 'hello');",
      errors: [
        {
          messageId: 'missing',
          column: 8,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'function Foo<T,T1>() {}',
      output: 'function Foo<T, T1>() {}',
      errors: [
        {
          messageId: 'missing',
          column: 15,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'function Foo<T , T1>() {}',
      output: 'function Foo<T, T1>() {}',
      errors: [
        {
          messageId: 'unexpected',
          column: 16,
          line: 1,
          data: { loc: 'before' },
        },
      ],
    },
    {
      code: 'function Foo<T ,T1>() {}',
      output: 'function Foo<T, T1>() {}',
      errors: [
        {
          messageId: 'unexpected',
          column: 16,
          line: 1,
          data: { loc: 'before' },
        },
        {
          messageId: 'missing',
          column: 16,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'function Foo<T, T1>() {}',
      output: 'function Foo<T,T1>() {}',
      options: [{ before: false, after: false }],
      errors: [
        {
          messageId: 'unexpected',
          column: 15,
          line: 1,
          data: { loc: 'after' },
        },
      ],
    },
    {
      code: 'function Foo<T,T1>() {}',
      output: 'function Foo<T ,T1>() {}',
      options: [{ before: true, after: false }],
      errors: [
        {
          messageId: 'missing',
          column: 15,
          line: 1,
          data: { loc: 'before' },
        },
      ],
    },
  ],
});
