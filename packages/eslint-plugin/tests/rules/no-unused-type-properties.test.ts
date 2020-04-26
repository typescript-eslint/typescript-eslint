import rule from '../../src/rules/no-unused-type-properties';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-unused-type-properties', rule, {
  valid: [
    'function f({ a }) {}', // no type
    'function f({ a }: () => any) {}', // non property type
    'function f({ a }: { [key: string]: string}) {}', //non TSPropertySignature
    'function f({ a }: { ["a"+"b"]: string}) {}', //unamed key
    // type not found in the tree
    `
type T2 = { a: string; b: { c: string; d: string } };
function f({ a, b: { c, d } }: T) {}
    `,
    //interface is not a type literal
    `
interface T { a: string };
function f({ a, b }: T) {}
    `,
    `
type T = { a: string; b: { c: string; d: string } };
function f({ a, b }: T) {}
    `,

    `
type T = { a: string; b: { c: string; d: string } };
function f({ a, ...rest }: T) {}
    `,

    `
type T = { a: string; b: { c: string; d: string } };
function f({ a, b: { c, d } }: T) {}
    `,

    `
type T = { a: string; b: { c: string; d: string } };
function f(arg: T) {}
    `,
  ],

  invalid: [
    {
      code: 'function f({ a }: { a: string; b: string }) {}',
      errors: [
        {
          messageId: 'unusedProperties',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: `
type T = { a: string; b: { c: string; d: string } };
function f({ a }: T) {}
      `,
      errors: [
        {
          messageId: 'unusedProperties',
          line: 3,
          column: 12,
        },
      ],
    },
    //recursivity  : here { c } is the problem
    {
      code: `
type T = { a: string; b: { c: string; d: string } };
function f({ a, b: { c } }: T) {}
      `,
      errors: [
        {
          messageId: 'unusedProperties',
          line: 3,
          column: 20,
        },
      ],
    },
    //adding another type does not change anything
    {
      code: `
type T = { a: string; b: { c: string; d: string } };
type T2 = { a: string };
function f({ a, b: { c } }: T) {}
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
