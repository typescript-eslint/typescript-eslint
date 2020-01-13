import rule from '../../src/rules/default-param-last';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('default-param-last', rule, {
  valid: [
    'function foo() {}',
    'function foo(a: number) {}',
    'function foo(a = 1) {}',
    'function foo(a?: number) {}',
    'function foo(a: number, b: number) {}',
    'function foo(a: number, b: number, c?: number) {}',
    'function foo(a: number, b = 1) {}',
    'function foo(a: number, b = 1, c = 1) {}',
    'function foo(a: number, b = 1, c?: number) {}',
    'function foo(a: number, b?: number, c = 1) {}',
    'function foo(a: number, b = 1, ...c) {}',

    'const foo = function () {}',
    'const foo = function (a: number) {}',
    'const foo = function (a = 1) {}',
    'const foo = function (a?: number) {}',
    'const foo = function (a: number, b: number) {}',
    'const foo = function (a: number, b: number, c?: number) {}',
    'const foo = function (a: number, b = 1) {}',
    'const foo = function (a: number, b = 1, c = 1) {}',
    'const foo = function (a: number, b = 1, c?: number) {}',
    'const foo = function (a: number, b?: number, c = 1) {}',
    'const foo = function (a: number, b = 1, ...c) {}',

    'const foo = () => {}',
    'const foo = (a: number) => {}',
    'const foo = (a = 1) => {}',
    'const foo = (a?: number) => {}',
    'const foo = (a: number, b: number) => {}',
    'const foo = (a: number, b: number, c?: number) => {}',
    'const foo = (a: number, b = 1) => {}',
    'const foo = (a: number, b = 1, c = 1) => {}',
    'const foo = (a: number, b = 1, c?: number) => {}',
    'const foo = (a: number, b?: number, c = 1) => {}',
    'const foo = (a: number, b = 1, ...c) => {}',
  ],
  invalid: [
    {
      code: 'function foo(a = 1, b: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'function foo(a = 1, b = 2, c: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 21,
          endColumn: 26,
        },
      ],
    },
    {
      code: 'function foo(a = 1, b: number, c = 2, d: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 32,
          endColumn: 37,
        },
      ],
    },
    {
      code: 'function foo(a = 1, b: number, c = 2) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'function foo(a = 1, b: number, ...c) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'function foo(a?: number, b: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 24,
        },
      ],
    },
    {
      code: 'function foo(a: number, b?: number, c: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 25,
          endColumn: 35,
        },
      ],
    },
    {
      code: 'function foo(a = 1, b?: number, c: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 21,
          endColumn: 31,
        },
      ],
    },
    {
      code: 'function foo(a = 1, { b }) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'function foo({ a } = {}, b) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 24,
        },
      ],
    },
    {
      code: 'function foo({ a, b } = { a: 1, b: 2 }, c) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 39,
        },
      ],
    },
    {
      code: 'function foo([a] = [], b) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'function foo([a, b] = [1, 2], c) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 29,
        },
      ],
    },
    {
      code: 'const foo = function(a = 1, b: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 27,
        },
      ],
    },
    {
      code: 'const foo = function(a = 1, b = 2, c: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 27,
        },
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 29,
          endColumn: 34,
        },
      ],
    },
    {
      code: 'const foo = function(a = 1, b: number, c = 2, d: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 27,
        },
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 40,
          endColumn: 45,
        },
      ],
    },
    {
      code: 'const foo = function(a = 1, b: number, c = 2) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 27,
        },
      ],
    },
    {
      code: 'const foo = function(a = 1, b: number, ...c) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 27,
        },
      ],
    },
    {
      code: 'const foo = function(a?: number, b: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 32,
        },
      ],
    },
    {
      code: 'const foo = function(a: number, b?: number, c: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 33,
          endColumn: 43,
        },
      ],
    },
    {
      code: 'const foo = function(a = 1, b?: number, c: number) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 27,
        },
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 29,
          endColumn: 39,
        },
      ],
    },
    {
      code: 'const foo = function(a = 1, { b }) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 27,
        },
      ],
    },
    {
      code: 'const foo = function({ a } = {}, b) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 32,
        },
      ],
    },
    {
      code: 'const foo = function({ a, b } = { a: 1, b: 2 }, c) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 47,
        },
      ],
    },
    {
      code: 'const foo = function([a] = [], b) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 30,
        },
      ],
    },
    {
      code: 'const foo = function([a, b] = [1, 2], c) {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 22,
          endColumn: 37,
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b: number) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b = 2, c: number) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 21,
          endColumn: 26,
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b: number, c = 2, d: number) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 32,
          endColumn: 37,
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b: number, c = 2) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b: number, ...c) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'const foo = (a?: number, b: number) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 24,
        },
      ],
    },
    {
      code: 'const foo = (a: number, b?: number, c: number) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 25,
          endColumn: 35,
        },
      ],
    },
    {
      code: 'const foo = (a = 1, b?: number, c: number) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 21,
          endColumn: 31,
        },
      ],
    },
    {
      code: 'const foo = (a = 1, { b }) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 19,
        },
      ],
    },
    {
      code: 'const foo = ({ a } = {}, b) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 24,
        },
      ],
    },
    {
      code: 'const foo = ({ a, b } = { a: 1, b: 2 }, c) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 39,
        },
      ],
    },
    {
      code: 'const foo = ([a] = [], b) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 22,
        },
      ],
    },
    {
      code: 'const foo = ([a, b] = [1, 2], c) => {}',
      errors: [
        {
          messageId: 'shouldBeLast',
          line: 1,
          column: 14,
          endColumn: 29,
        },
      ],
    },
  ],
});
