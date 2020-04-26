import rule from '../../src/rules/no-unused-type-properties';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-unused-type-properties', rule, {
  valid: [
    `function f({ a, b: { c, d } }) {}`, // no type

    `type T2 = { a: string, b: { c: string, d: string } };
     function f({ a, b: { c, d } } : T) {}`, // type not found in the tree

    `type T = { a: string, b: { c: string, d: string } };
     function f({ a, b } : T) {}`,

    `type T = { a: string, b: { c: string, d: string } };
     function f({ a, ...rest } : T) {}`,

    `type T = { a: string, b: { c: string, d: string } };
     function f({ a, b: { c, d } } : T) {}`,

    `type T = { a: string, b: { c: string, d: string } };
     function f(arg : T) {}`,

    `type T = { a: string, b: { c: string, d: string } };
     function f({ a, b: { c, d } } : T) {}`,
  ],

  invalid: [
    {
      code: `
function f({ a } : {a: string, b: string}) {}
      `,
      errors: [
        {
          messageId: 'unusedProperties',
          line: 2,
          column: 12,
        },
      ],
    },
    {
      code: `
type T = { a: string, b: { c: string, d: string } };
function f({ a } : T) {}
      `,
      errors: [
        {
          messageId: 'unusedProperties',
          line: 3,
          column: 12,
        },
      ],
    },

    {
      code: `
type T = { a: string, b: { c: string, d: string } };
function f({ a, b: { c } } : T) {}
      `,
      errors: [
        {
          messageId: 'unusedProperties',
          line: 3,
          column: 20,
        },
      ],
    },
    {
      code: `
type T = { a: string, b: { c: string, d: string } };
type T2 = { a: string };
function f({ a, b: { c } } : T) {}
      `,
      errors: [
        {
          messageId: 'unusedProperties',
          line: 4,
          column: 20,
        },
      ],
    },
  ],
});
