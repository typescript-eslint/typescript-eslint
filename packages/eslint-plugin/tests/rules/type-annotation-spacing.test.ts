/* eslint-disable eslint-comments/no-use */
// this rule tests the spacing, which prettier will want to fix and break the tests
/* eslint "@typescript-eslint/internal/plugin-test-formatting": ["error", { formatWithPrettier: false }] */
/* eslint-enable eslint-comments/no-use */

import { TSESLint } from '@typescript-eslint/experimental-utils';
import { RuleTester } from '../RuleTester';
import rule from '../../src/rules/type-annotation-spacing';
import {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../src/util';

type MessageIds = InferMessageIdsTypeFromRule<typeof rule>;
type Options = InferOptionsTypeFromRule<typeof rule>;

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('type-annotation-spacing', rule, {
  valid: [
    `
interface resolve {
    resolver: (() => PromiseLike<T>) | PromiseLike<T>;
}
    `,
    'const foo = {} as Foo;',
    'let foo: string;',
    'function foo(): void {}',
    'function foo(a: string) {}',
    `
class Foo {
    name: string;
}
    `,
    `
class Foo {
    constructor(message: string);
}
    `,
    `
class Foo {
    greet(): string { return "hello"; }
}
    `,
    `
class Foo {
    greet(name: string): string { return name; }
}
    `,
    `
interface Foo {
    name: string;
}
    `,
    `
interface Foo {
    greet(): string;
}
    `,
    `
interface Foo {
    greet(name: string): string;
}
    `,
    `
interface Foo {
    thing: { [key in string]: number };
}
    `,
    `
type Foo = {
    name: string;
}
    `,
    `
type Foo = {
    greet(): string;
}
    `,
    `
type Foo = {
    greet(name: string): string;
}
    `,
    'type Foo = (name: string) => string;',
    `
type Foo = {
    greet: (name: string) => string;
}
    `,
    `
const isString = (): x is string => {
}
    `,
    {
      code: 'let foo: string;',
      options: [{ after: true }],
    },
    {
      code: 'function foo(): string {}',
      options: [{ after: true }],
    },
    {
      code: 'function foo(a: string) {}',
      options: [{ after: true }],
    },
    {
      code: `
class Foo {
    name: string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
class Foo {
    constructor(message: string);
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
class Foo {
    greet(): string { return "hello"; }
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
class Foo {
    greet(name: string): string { return name; }
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
interface Foo {
    name: string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
interface Foo {
    greet(): string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
interface Foo {
    greet(name: string): string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
type Foo = {
    name: string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
type Foo = {
    greet(): string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
type Foo = {
    greet(name: string): string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: 'type Foo = (name: string) => string;',
      options: [{ after: true }],
    },
    {
      code: `
type Foo = {
    greet: (name: string) => string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: 'let foo: string;',
      options: [{ after: true, before: false }],
    },
    {
      code: 'function foo(): string {}',
      options: [{ after: true, before: false }],
    },
    {
      code: 'function foo(a: string) {}',
      options: [{ after: true, before: false }],
    },
    {
      code: `
class Foo {
    name: string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
class Foo {
    constructor(message: string);
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
class Foo {
    greet(): string { return "hello"; }
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
class Foo {
    greet(name: string): string { return name; }
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
interface Foo {
    name: string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
interface Foo {
    greet(): string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
interface Foo {
    greet(name: string): string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
type Foo = {
    name: string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
type Foo = {
    greet(): string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
type Foo = {
    greet(name: string): string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: 'type Foo = (name: string)=> string;',
      options: [{ after: true, before: false }],
    },
    {
      code: `
type Foo = {
    greet: (name: string)=> string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: 'let foo : string;',
      options: [{ after: true, before: true }],
    },
    {
      code: 'function foo() : string {}',
      options: [{ after: true, before: true }],
    },
    {
      code: 'function foo(a : string) {}',
      options: [{ after: true, before: true }],
    },
    {
      code: `
class Foo {
    name : string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
class Foo {
    constructor(message : string);
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
class Foo {
    greet() : string { return "hello"; }
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
class Foo {
    greet(name : string) : string { return name; }
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
interface Foo {
    name : string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
interface Foo {
    greet() : string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
interface Foo {
    greet(name : string) : string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
type Foo = {
    name : string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
type Foo = {
    greet() : string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
type Foo = {
    greet(name : string) : string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: 'type Foo = (name : string) => string;',
      options: [{ after: true, before: true }],
    },
    {
      code: `
type Foo = {
    greet : (name : string) => string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: 'let foo :string;',
      options: [{ after: false, before: true }],
    },
    {
      code: 'function foo() :string {}',
      options: [{ after: false, before: true }],
    },
    {
      code: 'function foo(a :string) {}',
      options: [{ after: false, before: true }],
    },
    {
      code: `
class Foo {
    name :string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
class Foo {
    constructor(message :string);
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
class Foo {
    greet() :string { return "hello"; }
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
class Foo {
    greet(name :string) :string { return name; }
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
interface Foo {
    name :string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
interface Foo {
    greet() :string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
interface Foo {
    greet(name :string) :string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
type Foo = {
    name :string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
type Foo = {
    greet() :string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
type Foo = {
    greet(name :string) :string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: 'type Foo = (name :string) =>string;',
      options: [{ after: false, before: true }],
    },
    {
      code: `
type Foo = {
    greet :(name :string) =>string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: 'let foo : string;',
      options: [{ before: true }],
    },
    {
      code: 'function foo() : string {}',
      options: [{ before: true }],
    },
    {
      code: 'function foo(a : string) {}',
      options: [{ before: true }],
    },
    {
      code: `
class Foo {
    name : string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
class Foo {
    constructor(message : string);
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
class Foo {
    greet() : string { return "hello"; }
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
class Foo {
    greet(name : string) : string { return name; }
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
interface Foo {
    name : string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
interface Foo {
    greet() : string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
interface Foo {
    greet(name : string) : string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
type Foo = {
    name : string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
type Foo = {
    greet() : string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
type Foo = {
    greet(name : string) : string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: 'type Foo = (name : string) => string;',
      options: [{ before: true }],
    },
    {
      code: `
type Foo = {
    greet : (name : string) => string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: 'let foo : string;',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: 'function foo() : string {}',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: 'function foo(a : string) {}',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
class Foo {
    name : string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message : string);
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
class Foo {
    greet() : string { return "hello"; }
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name : string) : string { return name; }
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
interface Foo {
    name : string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
interface Foo {
    greet() : string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name : string) : string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
type Foo = {
    name : string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
type Foo = {
    greet() : string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name : string) : string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: 'type Foo = (name : string)=>string;',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
type Foo = {
    greet : (name : string)=>string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: 'type Foo = (name : string) => string;',
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
              after: true,
            },
          },
        },
      ],
    },
    {
      code: `
type Foo = {
    greet : (name : string) => string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
              after: true,
            },
          },
        },
      ],
    },
    {
      code: 'type Foo = (name : string) =>string;',
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
            },
          },
        },
      ],
    },
    {
      code: `
type Foo = {
    greet : (name : string) =>string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
            },
          },
        },
      ],
    },
    {
      code: `
interface Foo {
    thing: { [key in string]: number };
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
interface Foo {
    thing: { [key in string]: number };
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
interface Foo {
    thing : { [key in string] : number };
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
interface Foo {
    thing :{ [key in string] :number };
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
interface Foo {
    thing : { [key in string] : number };
}
      `,
      options: [{ before: true }],
    },
    `
type Foo = {
    thing: { [key in string]: number };
}
    `,
    {
      code: `
type Foo = {
    thing: { [key in string]: number };
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
type Foo = {
    thing: { [key in string]: number };
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
type Foo = {
    thing : { [key in string] : number };
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
type Foo = {
    thing :{ [key in string] :number };
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
type Foo = {
    thing : { [key in string] : number };
}
      `,
      options: [{ before: true }],
    },
    `
class Foo {
    greet: (name: string) => void = {}
}
    `,
    {
      code: `
class Foo {
    greet: (name: string) => void = {}
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
class Foo {
    greet: (name: string)=> void = {}
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
class Foo {
    greet : (name : string) => void = {}
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
class Foo {
    greet :(name :string) =>void = {}
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
class Foo {
    greet : (name : string) => void = {}
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
interface Foo { a: string }
type Bar = Record<keyof Foo, string>
      `,
      options: [
        {
          after: true,
          before: false,
          overrides: {
            arrow: {
              after: true,
              before: true,
            },
          },
        },
      ],
    },
    'let resolver: (() => PromiseLike<T>) | PromiseLike<T>;',
    {
      code: 'const foo:string;',
      options: [
        {
          overrides: {
            colon: {
              after: false,
              before: true,
            },
            variable: {
              before: false,
            },
          },
        },
      ],
    },
    {
      code: 'const foo:string;',
      options: [
        {
          before: true,
          overrides: {
            colon: {
              after: true,
              before: false,
            },
            variable: {
              after: false,
            },
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  greet():string;
}
      `,
      options: [
        {
          overrides: {
            colon: {
              after: false,
              before: true,
            },
            property: {
              before: false,
            },
          },
        },
      ],
    },
    {
      code: `
interface Foo {
  name:string;
}
      `,
      options: [
        {
          before: true,
          overrides: {
            colon: {
              after: true,
              before: false,
            },
            property: {
              after: false,
            },
          },
        },
      ],
    },
    {
      code: 'function foo(name:string) {}',
      options: [
        {
          overrides: {
            colon: {
              after: false,
              before: true,
            },
            parameter: {
              before: false,
            },
          },
        },
      ],
    },
    {
      code: 'function foo(name:string) {}',
      options: [
        {
          before: true,
          overrides: {
            colon: {
              after: true,
              before: false,
            },
            parameter: {
              after: false,
            },
          },
        },
      ],
    },
    {
      code: 'function foo():string {}',
      options: [
        {
          overrides: {
            colon: {
              after: false,
              before: true,
            },
            returnType: {
              before: false,
            },
          },
        },
      ],
    },
    {
      code: 'function foo():string {}',
      options: [
        {
          before: true,
          overrides: {
            colon: {
              after: true,
              before: false,
            },
            returnType: {
              after: false,
            },
          },
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/1663
    'type ConstructorFn = new (...args: any[]) => any;',
  ],
  invalid: [
    {
      code: 'let foo : string;',
      output: 'let foo: string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 9,
        },
      ],
    },
    {
      code: 'function foo() : string {}',
      output: 'function foo(): string {}',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'function foo(a : string) {}',
      output: 'function foo(a: string) {}',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: `
class Foo {
    name : string;
}
      `,
      output: `
class Foo {
    name: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message : string);
}
      `,
      output: `
class Foo {
    constructor(message: string);
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 25,
        },
      ],
    },
    {
      code: `
class Foo {
    greet() : string { return "hello"; }
}
      `,
      output: `
class Foo {
    greet(): string { return "hello"; }
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name : string) : string { return name; }
}
      `,
      output: `
class Foo {
    greet(name: string): string { return name; }
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 26,
        },
      ],
    },
    {
      code: `
interface Foo {
    name : string;
}
      `,
      output: `
interface Foo {
    name: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet() : string;
}
      `,
      output: `
interface Foo {
    greet(): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name : string) : string;
}
      `,
      output: `
interface Foo {
    greet(name: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 26,
        },
      ],
    },
    {
      code: `
type Foo = {
    name : string;
}
      `,
      output: `
type Foo = {
    name: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet() : string;
}
      `,
      output: `
type Foo = {
    greet(): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name : string) : string;
}
      `,
      output: `
type Foo = {
    greet(name: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 26,
        },
      ],
    },
    {
      code: 'type Foo = (name : string) => string;',
      output: 'type Foo = (name: string) => string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: 'type Foo = (name : string)=> string;',
      output: 'type Foo = (name: string) => string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name : string) => string;
}
      `,
      output: `
type Foo = {
    greet: (name: string) => string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name : string)=> string;
}
      `,
      output: `
type Foo = {
    greet: (name: string) => string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: 'let foo : string;',
      options: [{ after: true }],
      output: 'let foo: string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 9,
        },
      ],
    },
    {
      code: 'function foo() : string {}',
      options: [{ after: true }],
      output: 'function foo(): string {}',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'function foo(a : string) {}',
      options: [{ after: true }],
      output: 'function foo(a: string) {}',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: `
class Foo {
    name : string;
}
      `,
      options: [{ after: true }],
      output: `
class Foo {
    name: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message : string);
}
      `,
      options: [{ after: true }],
      output: `
class Foo {
    constructor(message: string);
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 25,
        },
      ],
    },
    {
      code: `
class Foo {
    greet() : string { return "hello"; }
}
      `,
      options: [{ after: true }],
      output: `
class Foo {
    greet(): string { return "hello"; }
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name : string) : string { return name; }
}
      `,
      options: [{ after: true }],
      output: `
class Foo {
    greet(name: string): string { return name; }
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 26,
        },
      ],
    },
    {
      code: `
interface Foo {
    name : string;
}
      `,
      options: [{ after: true }],
      output: `
interface Foo {
    name: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet() : string;
}
      `,
      options: [{ after: true }],
      output: `
interface Foo {
    greet(): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name : string) : string;
}
      `,
      options: [{ after: true }],
      output: `
interface Foo {
    greet(name: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 26,
        },
      ],
    },
    {
      code: `
type Foo = {
    name : string;
}
      `,
      options: [{ after: true }],
      output: `
type Foo = {
    name: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet() : string;
}
      `,
      options: [{ after: true }],
      output: `
type Foo = {
    greet(): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name : string) : string;
}
      `,
      options: [{ after: true }],
      output: `
type Foo = {
    greet(name: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 26,
        },
      ],
    },
    {
      code: 'type Foo = (name : string) => string;',
      options: [{ after: true }],
      output: 'type Foo = (name: string) => string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: 'type Foo = (name : string)=> string;',
      options: [{ after: true }],
      output: 'type Foo = (name: string) => string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name : string) => string;
}
      `,
      options: [{ after: true }],
      output: `
type Foo = {
    greet: (name: string) => string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name : string)=> string;
}
      `,
      options: [{ after: true }],
      output: `
type Foo = {
    greet: (name: string) => string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: 'let foo : string;',
      options: [{ after: true, before: false }],
      output: 'let foo: string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 9,
        },
      ],
    },
    {
      code: 'function foo() : string {}',
      options: [{ after: true, before: false }],
      output: 'function foo(): string {}',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'function foo(a : string) {}',
      options: [{ after: true, before: false }],
      output: 'function foo(a: string) {}',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: `
class Foo {
    name : string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
class Foo {
    name: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message : string);
}
      `,
      options: [{ after: true, before: false }],
      output: `
class Foo {
    constructor(message: string);
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 25,
        },
      ],
    },
    {
      code: `
class Foo {
    greet() : string { return "hello"; }
}
      `,
      options: [{ after: true, before: false }],
      output: `
class Foo {
    greet(): string { return "hello"; }
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name : string) : string { return name; }
}
      `,
      options: [{ after: true, before: false }],
      output: `
class Foo {
    greet(name: string): string { return name; }
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 26,
        },
      ],
    },
    {
      code: `
interface Foo {
    name : string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
interface Foo {
    name: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet() : string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
interface Foo {
    greet(): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name : string) : string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
interface Foo {
    greet(name: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 26,
        },
      ],
    },
    {
      code: `
type Foo = {
    name : string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
type Foo = {
    name: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet() : string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
type Foo = {
    greet(): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 13,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name : string) : string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
type Foo = {
    greet(name: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 26,
        },
      ],
    },
    {
      code: 'type Foo = (name : string) => string;',
      options: [{ after: true, before: false }],
      output: 'type Foo = (name: string)=> string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 18,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 28,
        },
      ],
    },
    {
      code: 'type Foo = (name : string)=> string;',
      options: [{ after: true, before: false }],
      output: 'type Foo = (name: string)=> string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name : string) => string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
type Foo = {
    greet: (name: string)=> string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 18,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 28,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name : string)=> string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
type Foo = {
    greet: (name: string)=> string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: 'let foo:string;',
      options: [{ after: true, before: true }],
      output: 'let foo : string;',
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 1,
          column: 8,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'function foo():string {}',
      options: [{ after: true, before: true }],
      output: 'function foo() : string {}',
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: 'function foo(a:string) {}',
      options: [{ after: true, before: true }],
      output: 'function foo(a : string) {}',
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
    name:string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
class Foo {
    name : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message:string);
}
      `,
      options: [{ after: true, before: true }],
      output: `
class Foo {
    constructor(message : string);
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: `
class Foo {
    greet():string { return "hello"; }
}
      `,
      options: [{ after: true, before: true }],
      output: `
class Foo {
    greet() : string { return "hello"; }
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name:string):string { return name; }
}
      `,
      options: [{ after: true, before: true }],
      output: `
class Foo {
    greet(name : string) : string { return name; }
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
      ],
    },
    {
      code: `
interface Foo {
    name:string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
interface Foo {
    name : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet():string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
interface Foo {
    greet() : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name:string):string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
interface Foo {
    greet(name : string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
      ],
    },
    {
      code: `
type Foo = {
    name:string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
type Foo = {
    name : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet():string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
type Foo = {
    greet() : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name:string):string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
type Foo = {
    greet(name : string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
      ],
    },
    {
      code: 'type Foo = (name: string)=> string;',
      options: [{ after: true, before: true }],
      output: 'type Foo = (name : string) => string;',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 17,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 26,
        },
      ],
    },
    {
      code: 'type Foo = (name : string)=> string;',
      options: [{ after: true, before: true }],
      output: 'type Foo = (name : string) => string;',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name: string)=> string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
type Foo = {
    greet : (name : string) => string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 10,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 17,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 26,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet : (name : string)=> string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
type Foo = {
    greet : (name : string) => string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 28,
        },
      ],
    },
    {
      code: 'let foo:string;',
      options: [{ before: true }],
      output: 'let foo : string;',
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 1,
          column: 8,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'function foo():string {}',
      options: [{ before: true }],
      output: 'function foo() : string {}',
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: 'function foo(a:string) {}',
      options: [{ before: true }],
      output: 'function foo(a : string) {}',
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
    name:string;
}
      `,
      options: [{ before: true }],
      output: `
class Foo {
    name : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message:string);
}
      `,
      options: [{ before: true }],
      output: `
class Foo {
    constructor(message : string);
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: `
class Foo {
    greet():string { return "hello"; }
}
      `,
      options: [{ before: true }],
      output: `
class Foo {
    greet() : string { return "hello"; }
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name:string):string { return name; }
}
      `,
      options: [{ before: true }],
      output: `
class Foo {
    greet(name : string) : string { return name; }
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
      ],
    },
    {
      code: `
interface Foo {
    name:string;
}
      `,
      options: [{ before: true }],
      output: `
interface Foo {
    name : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet():string;
}
      `,
      options: [{ before: true }],
      output: `
interface Foo {
    greet() : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name:string):string;
}
      `,
      options: [{ before: true }],
      output: `
interface Foo {
    greet(name : string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
      ],
    },
    {
      code: `
type Foo = {
    name:string;
}
      `,
      options: [{ before: true }],
      output: `
type Foo = {
    name : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet():string;
}
      `,
      options: [{ before: true }],
      output: `
type Foo = {
    greet() : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name:string):string;
}
      `,
      options: [{ before: true }],
      output: `
type Foo = {
    greet(name : string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
      ],
    },
    {
      code: 'type Foo = (name: string)=> string;',
      options: [{ before: true }],
      output: 'type Foo = (name : string) => string;',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 17,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 26,
        },
      ],
    },
    {
      code: 'type Foo = (name : string)=> string;',
      options: [{ before: true }],
      output: 'type Foo = (name : string) => string;',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name: string)=> string;
}
      `,
      options: [{ before: true }],
      output: `
type Foo = {
    greet : (name : string) => string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 10,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 17,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 26,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet : (name : string)=> string;
}
      `,
      options: [{ before: true }],
      output: `
type Foo = {
    greet : (name : string) => string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 28,
        },
      ],
    },
    {
      code: 'let foo:string;',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: 'let foo : string;',
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 1,
          column: 8,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'function foo():string {}',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: 'function foo() : string {}',
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: 'function foo(a:string) {}',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: 'function foo(a : string) {}',
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: `
class Foo {
    name:string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
class Foo {
    name : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message:string);
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
class Foo {
    constructor(message : string);
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: `
class Foo {
    greet():string { return "hello"; }
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
class Foo {
    greet() : string { return "hello"; }
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name:string):string { return name; }
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
class Foo {
    greet(name : string) : string { return name; }
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
      ],
    },
    {
      code: `
interface Foo {
    name:string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
interface Foo {
    name : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet():string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
interface Foo {
    greet() : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name:string):string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
interface Foo {
    greet(name : string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
      ],
    },
    {
      code: `
type Foo = {
    name:string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
type Foo = {
    name : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 9,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet():string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
type Foo = {
    greet() : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 12,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name:string):string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
type Foo = {
    greet(name : string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 23,
        },
      ],
    },
    {
      code: 'type Foo = (name:string)=>string;',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: 'type Foo = (name : string)=>string;',
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 1,
          column: 17,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet : (name:string)=>string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
type Foo = {
    greet : (name : string)=>string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: 'type Foo = (name:string)=>string;',
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
              after: true,
            },
          },
        },
      ],
      output: 'type Foo = (name : string) => string;',
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 1,
          column: 17,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 1,
          column: 17,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '=>' },
          line: 1,
          column: 25,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 25,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet : (name:string)=>string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
              after: true,
            },
          },
        },
      ],
      output: `
type Foo = {
    greet : (name : string) => string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 18,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '=>' },
          line: 3,
          column: 26,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 26,
        },
      ],
    },
    // https://github.com/bradzacher/eslint-plugin-typescript/issues/152
    {
      code: `
        class Some {
            a : {some: string, other: {more: number}};
            someMethod : (args : {some: string, other: {more: number}}) => void;
            doSomething(args : {some: string, other: {more: number}}) : void {}
        }
      `,
      options: [{ after: true, before: true }],
      output: `
        class Some {
            a : {some : string, other : {more : number}};
            someMethod : (args : {some : string, other : {more : number}}) => void;
            doSomething(args : {some : string, other : {more : number}}) : void {}
        }
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: {
            type: ':',
          },
          line: 3,
          column: 22,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: {
            type: ':',
          },
          line: 3,
          column: 37,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: {
            type: ':',
          },
          line: 3,
          column: 44,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: {
            type: ':',
          },
          line: 4,
          column: 39,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: {
            type: ':',
          },
          line: 4,
          column: 54,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: {
            type: ':',
          },
          line: 4,
          column: 61,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: {
            type: ':',
          },
          line: 5,
          column: 37,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: {
            type: ':',
          },
          line: 5,
          column: 52,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: {
            type: ':',
          },
          line: 5,
          column: 59,
        },
      ],
    },
  ],
});

//------------------------------------------------------------------------------
// Optional Annotation Tests
//------------------------------------------------------------------------------

ruleTester.run('type-annotation-spacing', rule, {
  valid: [
    `
interface resolve {
    resolver?: (() => PromiseLike<T>) | PromiseLike<T>;
}
    `,
    'function foo(a?: string) {}',
    `
class Foo {
    name?: string;
}
    `,
    `
class Foo {
    constructor(message?: string);
}
    `,
    `
class Foo {
    greet(name?: string): string { return name; }
}
    `,
    `
interface Foo {
    name?: string;
}
    `,
    `
interface Foo {
    greet(name?: string): string;
}
    `,
    `
interface Foo {
    thing?: { [key in string]?: number };
}
    `,
    `
type Foo = {
    name?: string;
}
    `,
    `
type Foo = {
    greet(name?: string): string;
}
    `,
    'type Foo = (name?: string) => string;',
    `
type Foo = {
    greet?: (name?: string) => string;
}
    `,
    {
      code: 'function foo(a?: string) {}',
      options: [{ after: true }],
    },
    {
      code: `
class Foo {
    name?: string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
class Foo {
    constructor(message?: string);
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
class Foo {
    greet(name?: string): string { return name; }
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
interface Foo {
    name?: string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
interface Foo {
    greet(name?: string): string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
type Foo = {
    name?: string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
type Foo = {
    greet(name?: string): string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: 'type Foo = (name?: string) => string;',
      options: [{ after: true }],
    },
    {
      code: `
type Foo = {
    greet?: (name?: string) => string;
}
      `,
      options: [{ after: true }],
    },
    {
      code: 'function foo(a?: string) {}',
      options: [{ after: true, before: false }],
    },
    {
      code: `
class Foo {
    name?: string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
class Foo {
    constructor(message?: string);
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
class Foo {
    greet(name?: string): string { return name; }
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
interface Foo {
    name?: string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
interface Foo {
    greet(name?: string): string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
type Foo = {
    name?: string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
type Foo = {
    greet(name?: string): string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: 'type Foo = (name?: string)=> string;',
      options: [{ after: true, before: false }],
    },
    {
      code: `
type Foo = {
    greet?: (name?: string)=> string;
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: 'function foo(a ?: string) {}',
      options: [{ after: true, before: true }],
    },
    {
      code: `
class Foo {
    name ?: string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
class Foo {
    constructor(message ?: string);
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
interface Foo {
    name ?: string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
interface Foo {
    greet(name ?: string) : string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
type Foo = {
    name ?: string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
type Foo = {
    greet(name ?: string) : string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: 'type Foo = (name ?: string) => string;',
      options: [{ after: true, before: true }],
    },
    {
      code: `
type Foo = {
    greet ?: (name : string) => string;
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: 'function foo(a ?:string) {}',
      options: [{ after: false, before: true }],
    },
    {
      code: `
class Foo {
    name ?:string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
class Foo {
    constructor(message ?:string);
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
class Foo {
    greet(name ?:string) :string { return name; }
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
interface Foo {
    name ?:string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
interface Foo {
    greet(name ?:string) :string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
type Foo = {
    name ?:string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
type Foo = {
    greet(name ?:string) :string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: 'type Foo = (name ?:string) =>string;',
      options: [{ after: false, before: true }],
    },
    {
      code: `
type Foo = {
    greet :(name ?:string) =>string;
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: 'function foo(a ?: string) {}',
      options: [{ before: true }],
    },
    {
      code: `
class Foo {
    name ?: string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
class Foo {
    constructor(message ?: string);
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
interface Foo {
    name ?: string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
interface Foo {
    greet(name ?: string) : string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
type Foo = {
    name ?: string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
type Foo = {
    greet(name ?: string) : string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: 'type Foo = (name ?: string) => string;',
      options: [{ before: true }],
    },
    {
      code: `
type Foo = {
    greet : (name ?: string) => string;
}
      `,
      options: [{ before: true }],
    },
    {
      code: 'function foo(a ?: string) {}',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
class Foo {
    name ?: string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message ?: string);
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
interface Foo {
    name ?: string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name ?: string) : string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
type Foo = {
    name ?: string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name ?: string) : string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: 'type Foo = (name ?: string)=>string;',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: `
type Foo = {
    greet ?: (name ?: string)=>string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
    },
    {
      code: 'type Foo = (name ?: string) => string;',
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
              after: true,
            },
          },
        },
      ],
    },
    {
      code: `
type Foo = {
    greet ?: (name ?: string) => string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
              after: true,
            },
          },
        },
      ],
    },
    {
      code: 'type Foo = (name ?: string) =>string;',
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
            },
          },
        },
      ],
    },
    {
      code: `
type Foo = {
    greet : (name ?: string) =>string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
            },
          },
        },
      ],
    },
    {
      code: `
interface Foo {
    thing?: { [key in string]?: number };
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
interface Foo {
    thing?: { [key in string]?: number };
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
interface Foo {
    thing ?: { [key in string] ?: number };
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
interface Foo {
    thing ?:{ [key in string] ?:number };
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
interface Foo {
    thing ?: { [key in string] ?: number };
}
      `,
      options: [{ before: true }],
    },
    `
type Foo = {
    thing?: { [key in string]?: number };
}
    `,
    {
      code: `
type Foo = {
    thing?: { [key in string]?: number };
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
type Foo = {
    thing?: { [key in string]?: number };
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
type Foo = {
    thing ?: { [key in string] ?: number };
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
type Foo = {
    thing ?:{ [key in string] ?:number };
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
type Foo = {
    thing ?: { [key in string] ?: number };
}
      `,
      options: [{ before: true }],
    },
    `
class Foo {
    greet: (name?: string) => void = {}
}
    `,
    {
      code: `
class Foo {
    greet: (name?: string) => void = {}
}
      `,
      options: [{ after: true }],
    },
    {
      code: `
class Foo {
    greet: (name?: string)=> void = {}
}
      `,
      options: [{ after: true, before: false }],
    },
    {
      code: `
class Foo {
    greet : (name ?: string) => void = {}
}
      `,
      options: [{ after: true, before: true }],
    },
    {
      code: `
class Foo {
    greet :(name ?:string) =>void = {}
}
      `,
      options: [{ after: false, before: true }],
    },
    {
      code: `
class Foo {
    greet : (name ?: string) => void = {}
}
      `,
      options: [{ before: true }],
    },
    {
      code: `
interface Foo { a?: string }
type Bar = Record<keyof Foo, string>
      `,
      options: [
        {
          after: true,
          before: false,
          overrides: {
            arrow: {
              after: true,
              before: true,
            },
          },
        },
      ],
    },
  ],
  invalid: [
    {
      code: 'function foo(a ?: string) {}',
      output: 'function foo(a?: string) {}',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: `
class Foo {
    name ?: string;
}
      `,
      output: `
class Foo {
    name?: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message ?: string);
}
      `,
      output: `
class Foo {
    constructor(message?: string);
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 25,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
      `,
      output: `
class Foo {
    greet(name?: string): string { return name; }
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: `
interface Foo {
    name ?: string;
}
      `,
      output: `
interface Foo {
    name?: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name ?: string) : string;
}
      `,
      output: `
interface Foo {
    greet(name?: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: `
type Foo = {
    name ?: string;
}
      `,
      output: `
type Foo = {
    name?: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name ?: string) : string;
}
      `,
      output: `
type Foo = {
    greet(name?: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: 'type Foo = (name ?: string) => string;',
      output: 'type Foo = (name?: string) => string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: 'type Foo = (name ?: string)=> string;',
      output: 'type Foo = (name?: string) => string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 28,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name ?: string) => string;
}
      `,
      output: `
type Foo = {
    greet: (name?: string) => string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name ?: string)=> string;
}
      `,
      output: `
type Foo = {
    greet: (name?: string) => string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 28,
        },
      ],
    },
    {
      code: 'function foo(a ?: string) {}',
      options: [{ after: true }],
      output: 'function foo(a?: string) {}',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: `
class Foo {
    name ?: string;
}
      `,
      options: [{ after: true }],
      output: `
class Foo {
    name?: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message ?: string);
}
      `,
      options: [{ after: true }],
      output: `
class Foo {
    constructor(message?: string);
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 25,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
      `,
      options: [{ after: true }],
      output: `
class Foo {
    greet(name?: string): string { return name; }
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: `
interface Foo {
    name ?: string;
}
      `,
      options: [{ after: true }],
      output: `
interface Foo {
    name?: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name ?: string) : string;
}
      `,
      options: [{ after: true }],
      output: `
interface Foo {
    greet(name?: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: `
type Foo = {
    name ?: string;
}
      `,
      options: [{ after: true }],
      output: `
type Foo = {
    name?: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name ?: string) : string;
}
      `,
      options: [{ after: true }],
      output: `
type Foo = {
    greet(name?: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: 'type Foo = (name ?: string) => string;',
      options: [{ after: true }],
      output: 'type Foo = (name?: string) => string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: 'type Foo = (name ?: string)=> string;',
      options: [{ after: true }],
      output: 'type Foo = (name?: string) => string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 28,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name ?: string) => string;
}
      `,
      options: [{ after: true }],
      output: `
type Foo = {
    greet: (name?: string) => string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name ?: string)=> string;
}
      `,
      options: [{ after: true }],
      output: `
type Foo = {
    greet: (name?: string) => string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 28,
        },
      ],
    },
    {
      code: 'function foo(a ?: string) {}',
      options: [{ after: true, before: false }],
      output: 'function foo(a?: string) {}',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: `
class Foo {
    name ?: string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
class Foo {
    name?: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message ?: string);
}
      `,
      options: [{ after: true, before: false }],
      output: `
class Foo {
    constructor(message?: string);
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 25,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name ?: string) : string { return name; }
}
      `,
      options: [{ after: true, before: false }],
      output: `
class Foo {
    greet(name?: string): string { return name; }
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: `
interface Foo {
    name ?: string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
interface Foo {
    name?: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name ?: string) : string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
interface Foo {
    greet(name?: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: `
type Foo = {
    name ?: string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
type Foo = {
    name?: string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name ?: string) : string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
type Foo = {
    greet(name?: string): string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      code: 'type Foo = (name ?: string) => string;',
      options: [{ after: true, before: false }],
      output: 'type Foo = (name?: string)=> string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 18,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 29,
        },
      ],
    },
    {
      code: 'type Foo = (name ?: string)=> string;',
      options: [{ after: true, before: false }],
      output: 'type Foo = (name?: string)=> string;',
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name ?: string) => string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
type Foo = {
    greet: (name?: string)=> string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 18,
        },
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 29,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet: (name ?: string)=> string;
}
      `,
      options: [{ after: true, before: false }],
      output: `
type Foo = {
    greet: (name?: string)=> string;
}
      `,
      errors: [
        {
          messageId: 'unexpectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 18,
        },
      ],
    },
    {
      code: 'function foo(a?:string) {}',
      options: [{ after: true, before: true }],
      output: 'function foo(a ?: string) {}',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: `
class Foo {
    name?:string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
class Foo {
    name ?: string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message?:string);
}
      `,
      options: [{ after: true, before: true }],
      output: `
class Foo {
    constructor(message ?: string);
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 25,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name?:string):string { return name; }
}
      `,
      options: [{ after: true, before: true }],
      output: `
class Foo {
    greet(name ?: string) : string { return name; }
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: `
interface Foo {
    name?:string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
interface Foo {
    name ?: string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name?:string):string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
interface Foo {
    greet(name ?: string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: `
type Foo = {
    name?:string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
type Foo = {
    name ?: string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name?:string):string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
type Foo = {
    greet(name ?: string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: 'type Foo = (name?: string)=> string;',
      options: [{ after: true, before: true }],
      output: 'type Foo = (name ?: string) => string;',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 17,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: 'type Foo = (name ?: string)=> string;',
      options: [{ after: true, before: true }],
      output: 'type Foo = (name ?: string) => string;',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 28,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet?: (name?: string)=> string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
type Foo = {
    greet ?: (name ?: string) => string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 28,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet ?: (name ?: string)=> string;
}
      `,
      options: [{ after: true, before: true }],
      output: `
type Foo = {
    greet ?: (name ?: string) => string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 30,
        },
      ],
    },
    {
      code: 'function foo(a?:string) {}',
      options: [{ before: true }],
      output: 'function foo(a ?: string) {}',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: `
class Foo {
    name?:string;
}
      `,
      options: [{ before: true }],
      output: `
class Foo {
    name ?: string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message?:string);
}
      `,
      options: [{ before: true }],
      output: `
class Foo {
    constructor(message ?: string);
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 25,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name?:string):string { return name; }
}
      `,
      options: [{ before: true }],
      output: `
class Foo {
    greet(name ?: string) : string { return name; }
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: `
interface Foo {
    name?:string;
}
      `,
      options: [{ before: true }],
      output: `
interface Foo {
    name ?: string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name?:string):string;
}
      `,
      options: [{ before: true }],
      output: `
interface Foo {
    greet(name ?: string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: `
type Foo = {
    name?:string;
}
      `,
      options: [{ before: true }],
      output: `
type Foo = {
    name ?: string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name?:string):string;
}
      `,
      options: [{ before: true }],
      output: `
type Foo = {
    greet(name ?: string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: 'type Foo = (name?: string)=> string;',
      options: [{ before: true }],
      output: 'type Foo = (name ?: string) => string;',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 17,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: 'type Foo = (name : string)=> string;',
      options: [{ before: true }],
      output: 'type Foo = (name : string) => string;',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 27,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet?: (name?: string)=> string;
}
      `,
      options: [{ before: true }],
      output: `
type Foo = {
    greet ?: (name ?: string) => string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 18,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 28,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet ?: (name ?: string)=> string;
}
      `,
      options: [{ before: true }],
      output: `
type Foo = {
    greet ?: (name ?: string) => string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 30,
        },
      ],
    },
    {
      code: 'function foo(a?:string) {}',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: 'function foo(a ?: string) {}',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: `
class Foo {
    name?:string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
class Foo {
    name ?: string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
class Foo {
    constructor(message?:string);
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
class Foo {
    constructor(message ?: string);
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 25,
        },
      ],
    },
    {
      code: `
class Foo {
    greet(name?:string):string { return name; }
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
class Foo {
    greet(name ?: string) : string { return name; }
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: `
interface Foo {
    name?:string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
interface Foo {
    name ?: string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
interface Foo {
    greet(name?:string):string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
interface Foo {
    greet(name ?: string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: `
type Foo = {
    name?:string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
type Foo = {
    name ?: string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 9,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet(name?:string):string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
type Foo = {
    greet(name ?: string) : string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 15,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 16,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: ':' },
          line: 3,
          column: 24,
        },
      ],
    },
    {
      code: 'type Foo = (name?:string)=>string;',
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: 'type Foo = (name ?: string)=>string;',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 17,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 1,
          column: 18,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet ?: (name?:string)=>string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: { colon: { before: true, after: true } },
        },
      ],
      output: `
type Foo = {
    greet ?: (name ?: string)=>string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 19,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 20,
        },
      ],
    },
    {
      code: 'type Foo = (name?:string)=>string;',
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
              after: true,
            },
          },
        },
      ],
      output: 'type Foo = (name ?: string) => string;',
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 1,
          column: 17,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 1,
          column: 18,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '=>' },
          line: 1,
          column: 26,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 1,
          column: 26,
        },
      ],
    },
    {
      code: `
type Foo = {
    greet ?: (name?:string)=>string;
}
      `,
      options: [
        {
          before: false,
          after: false,
          overrides: {
            colon: {
              before: true,
              after: true,
            },
            arrow: {
              before: true,
              after: true,
            },
          },
        },
      ],
      output: `
type Foo = {
    greet ?: (name ?: string) => string;
}
      `,
      errors: [
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '?:' },
          line: 3,
          column: 19,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '?:' },
          line: 3,
          column: 20,
        },
        {
          messageId: 'expectedSpaceAfter',
          data: { type: '=>' },
          line: 3,
          column: 28,
        },
        {
          messageId: 'expectedSpaceBefore',
          data: { type: '=>' },
          line: 3,
          column: 28,
        },
      ],
    },
  ],
});

//------------------------------------------------------------------------------
// Optional w/Addition/Removal Annotation Tests
//------------------------------------------------------------------------------

const operators = ['+?:', '-?:'];

ruleTester.run('type-annotation-spacing', rule, {
  valid: operators.reduce<TSESLint.ValidTestCase<Options>[]>(
    (validCases, operator) =>
      validCases.concat([
        {
          code: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          options: [],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          options: [{ after: true }],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          options: [{ before: false }],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          options: [{ after: true, before: false }],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator}T[P] }`,
          options: [{ after: false, before: true }],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          options: [{ before: true }],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          options: [{ after: true, before: true }],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator}T[P] }`,
          options: [{ after: false }],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator}T[P] }`,
          options: [{ after: false, before: false }],
        },
      ]),
    [],
  ),
  invalid: operators.reduce<TSESLint.InvalidTestCase<MessageIds, Options>[]>(
    (invalidCases, operator) =>
      invalidCases.concat([
        // space before + after cases
        {
          code: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          options: [{ after: true }],
          output: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          errors: [
            {
              messageId: 'unexpectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 32,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          options: [{ before: false }],
          output: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          errors: [
            {
              messageId: 'unexpectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 32,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          options: [{ after: true, before: false }],
          output: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          errors: [
            {
              messageId: 'unexpectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 32,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          options: [{ after: false }],
          output: `type Foo<T> = { [P in keyof T]${operator}T[P] }`,
          errors: [
            {
              messageId: 'unexpectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 32,
            },
            {
              messageId: 'unexpectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 34,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          options: [{ after: false, before: false }],
          output: `type Foo<T> = { [P in keyof T]${operator}T[P] }`,
          errors: [
            {
              messageId: 'unexpectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 32,
            },
            {
              messageId: 'unexpectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 34,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          options: [{ after: false, before: true }],
          output: `type Foo<T> = { [P in keyof T] ${operator}T[P] }`,
          errors: [
            {
              messageId: 'unexpectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 34,
            },
          ],
        },
        // no space cases
        {
          code: `type Foo<T> = { [P in keyof T]${operator}T[P] }`,
          options: [{ after: true }],
          output: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          errors: [
            {
              messageId: 'expectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 33,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator}T[P] }`,
          options: [{ before: true }],
          output: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          errors: [
            {
              messageId: 'expectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 31,
            },
            {
              messageId: 'expectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 33,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator}T[P] }`,
          options: [{ after: true, before: true }],
          output: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          errors: [
            {
              messageId: 'expectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 31,
            },
            {
              messageId: 'expectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 33,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator}T[P] }`,
          options: [{ after: true, before: false }],
          output: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          errors: [
            {
              messageId: 'expectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 33,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator}T[P] }`,
          options: [{ after: false, before: true }],
          output: `type Foo<T> = { [P in keyof T] ${operator}T[P] }`,
          errors: [
            {
              messageId: 'expectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 31,
            },
          ],
        },
        // space before cases
        {
          code: `type Foo<T> = { [P in keyof T] ${operator}T[P] }`,
          options: [],
          output: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          errors: [
            {
              messageId: 'unexpectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 32,
            },
            {
              messageId: 'expectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 34,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator}T[P] }`,
          options: [{ after: true }],
          output: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          errors: [
            {
              messageId: 'unexpectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 32,
            },
            {
              messageId: 'expectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 34,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator}T[P] }`,
          options: [{ before: true }],
          output: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          errors: [
            {
              messageId: 'expectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 34,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator}T[P] }`,
          options: [{ after: true, before: false }],
          output: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          errors: [
            {
              messageId: 'unexpectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 32,
            },
            {
              messageId: 'expectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 34,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T] ${operator}T[P] }`,
          options: [{ after: true, before: true }],
          output: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          errors: [
            {
              messageId: 'expectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 34,
            },
          ],
        },
        // space after cases
        {
          code: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          options: [{ after: false }],
          output: `type Foo<T> = { [P in keyof T]${operator}T[P] }`,
          errors: [
            {
              messageId: 'unexpectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 33,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          options: [{ before: true }],
          output: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          errors: [
            {
              messageId: 'expectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 31,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          options: [{ after: true, before: true }],
          output: `type Foo<T> = { [P in keyof T] ${operator} T[P] }`,
          errors: [
            {
              messageId: 'expectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 31,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          options: [{ after: false, before: true }],
          output: `type Foo<T> = { [P in keyof T] ${operator}T[P] }`,
          errors: [
            {
              messageId: 'expectedSpaceBefore',
              data: {
                type: operator,
              },
              line: 1,
              column: 31,
            },
            {
              messageId: 'unexpectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 33,
            },
          ],
        },
        {
          code: `type Foo<T> = { [P in keyof T]${operator} T[P] }`,
          options: [{ after: false, before: false }],
          output: `type Foo<T> = { [P in keyof T]${operator}T[P] }`,
          errors: [
            {
              messageId: 'unexpectedSpaceAfter',
              data: {
                type: operator,
              },
              line: 1,
              column: 33,
            },
          ],
        },
      ]),
    [],
  ),
});
