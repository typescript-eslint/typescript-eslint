import rule from '../../src/rules/no-angle-bracket-type-assertion';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-angle-bracket-type-assertion', rule, {
  valid: [
    `
interface Foo {
    bar : number;
    bas : string;
}

class Generic<T> implements Foo {}

const foo = {} as Foo<int>;
const bar = new Generic<int>() as Foo;
        `,
    'const array : Array<string> = [];',
    `
class A {}
class B extends A {}

const b : B = new B();
const a : A = b as A;
        `,
    `
type A = {
    num: number
};

const b = {
    num: 5
};

const a: A = b as A;
        `,
    'const a : number = 5 as number',
    `
const a : number = 5;
const b : number = a as number;
        `,
    'const a : Array<number> = [1] as Array<number>;',
  ],
  invalid: [
    {
      code: `
interface Foo {
    bar : number;
    bas : string;
}

class Generic<T> implements Foo {}

const foo = <Foo>{};
const bar = <Foo>new Generic<int>();
            `,
      errors: [
        {
          messageId: 'preferAs',
          data: {
            cast: 'Foo',
          },
          line: 9,
          column: 13,
        },
        {
          messageId: 'preferAs',
          data: {
            cast: 'Foo',
          },
          line: 10,
          column: 13,
        },
      ],
    },
    {
      code: 'const a : number = <number>5',
      errors: [
        {
          messageId: 'preferAs',
          data: {
            cast: 'number',
          },
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: `
const a : number = 5;
const b : number = <number>a;
            `,
      errors: [
        {
          messageId: 'preferAs',
          data: {
            cast: 'number',
          },
          line: 3,
          column: 20,
        },
      ],
    },
    {
      code: 'const a : Array<number> = <Array<number>>[1];',
      errors: [
        {
          messageId: 'preferAs',
          data: {
            cast: 'Array<number>',
          },
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: `
class A {}
class B extends A {}

const b : B = new B();
const a : A = <A>b;
            `,
      errors: [
        {
          messageId: 'preferAs',
          data: {
            cast: 'A',
          },
          line: 6,
          column: 15,
        },
      ],
    },
    {
      code: `
type A = {
    num: number
};

const b = {
    num: 5
};

const a: A = <A>b;
            `,
      errors: [
        {
          messageId: 'preferAs',
          data: {
            cast: 'A',
          },
          line: 10,
          column: 14,
        },
      ],
    },
  ],
});
