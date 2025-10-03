import rule from '../../src/rules/no-unsafe-argument';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-unsafe-argument', rule, {
  valid: [
    // unknown function should be ignored
    `
doesNotExist(1 as any);
    `,
    // non-function call should be ignored
    `
const foo = 1;
foo(1 as any);
    `,
    // too many arguments should be ignored as this is a TS error
    `
declare function foo(arg: number): void;
foo(1, 1 as any, 2 as any);
    `,
    `
declare function foo(arg: number, arg2: string): void;
foo(1, 'a');
    `,
    `
declare function foo(arg: any): void;
foo(1 as any);
    `,
    `
declare function foo(arg: unknown): void;
foo(1 as any);
    `,
    `
declare function foo(...arg: number[]): void;
foo(1, 2, 3);
    `,
    `
declare function foo(...arg: any[]): void;
foo(1, 2, 3, 4 as any);
    `,
    `
declare function foo(arg: number, arg2: number): void;
const x = [1, 2] as const;
foo(...x);
    `,
    `
declare function foo(arg: any, arg2: number): void;
const x = [1 as any, 2] as const;
foo(...x);
    `,
    `
declare function foo(arg1: string, arg2: string): void;
const x: string[] = [];
foo(...x);
    `,
    `
function foo(arg1: number, arg2: number) {}
foo(...([1, 1, 1] as [number, number, number]));
    `,
    `
declare function foo(arg1: Set<string>, arg2: Map<string, string>): void;

const x = [new Map<string, string>()] as const;
foo(new Set<string>(), ...x);
    `,
    `
declare function foo(arg1: unknown, arg2: Set<unknown>, arg3: unknown[]): void;
foo(1 as any, new Set<any>(), [] as any[]);
    `,
    `
declare function foo(...params: [number, string, any]): void;
foo(1, 'a', 1 as any);
    `,
    // Unfortunately - we cannot handle this case because TS infers `params` to be a tuple type
    // that tuple type is the same as the type of
    `
declare function foo<E extends string[]>(...params: E): void;

foo('a', 'b', 1 as any);
    `,
    `
declare function toHaveBeenCalledWith<E extends any[]>(...params: E): void;
toHaveBeenCalledWith(1 as any);
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2109
    `
declare function acceptsMap(arg: Map<string, string>): void;
acceptsMap(new Map());
    `,
    `
type T = [number, T[]];
declare function foo(t: T): void;
declare const t: T;

foo(t);
    `,
    `
type T = Array<T>;
declare function foo<T>(t: T): T;
const t: T = [];
foo(t);
    `,
    `
function foo(templates: TemplateStringsArray) {}
foo\`\`;
    `,
    `
function foo(templates: TemplateStringsArray, arg: any) {}
foo\`\${1 as any}\`;
    `,
  ],
  invalid: [
    {
      code: `
declare function foo(arg: number): void;
foo(1 as any);
      `,
      errors: [
        {
          column: 5,
          data: {
            receiver: '`number`',
            sender: '`any`',
          },
          endColumn: 13,
          line: 3,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
declare function foo(arg: number): void;
foo(error);
      `,
      errors: [
        {
          column: 5,
          data: {
            receiver: '`number`',
            sender: 'error typed',
          },
          endColumn: 10,
          line: 3,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
declare function foo(arg1: number, arg2: string): void;
foo(1, 1 as any);
      `,
      errors: [
        {
          column: 8,
          data: {
            receiver: '`string`',
            sender: '`any`',
          },
          endColumn: 16,
          line: 3,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
declare function foo(...arg: number[]): void;
foo(1, 2, 3, 1 as any);
      `,
      errors: [
        {
          column: 14,
          data: {
            receiver: '`number`',
            sender: '`any`',
          },
          endColumn: 22,
          line: 3,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
declare function foo(arg: string, ...arg: number[]): void;
foo(1 as any, 1 as any);
      `,
      errors: [
        {
          column: 5,
          data: {
            receiver: '`string`',
            sender: '`any`',
          },
          endColumn: 13,
          line: 3,
          messageId: 'unsafeArgument',
        },
        {
          column: 15,
          data: {
            receiver: '`number`',
            sender: '`any`',
          },
          endColumn: 23,
          line: 3,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
declare function foo(arg1: string, arg2: number): void;

foo(...(x as any));
      `,
      errors: [
        {
          column: 5,
          endColumn: 18,
          line: 4,
          messageId: 'unsafeSpread',
        },
      ],
    },
    {
      code: `
declare function foo(arg1: string, arg2: number): void;

foo(...(x as any[]));
      `,
      errors: [
        {
          column: 5,
          data: { sender: '`any[]`' },
          endColumn: 20,
          line: 4,
          messageId: 'unsafeArraySpread',
        },
      ],
    },
    {
      code: `
declare function foo(arg1: string, arg2: number): void;

declare const errors: error[];

foo(...errors);
      `,
      errors: [
        {
          column: 5,
          data: { sender: 'error' },
          endColumn: 14,
          line: 6,
          messageId: 'unsafeArraySpread',
        },
      ],
    },
    {
      code: `
declare function foo(arg1: string, arg2: number): void;

const x = ['a', 1 as any] as const;
foo(...x);
      `,
      errors: [
        {
          column: 5,
          data: {
            receiver: '`number`',
            sender: 'of type `any`',
          },
          endColumn: 9,
          line: 5,
          messageId: 'unsafeTupleSpread',
        },
      ],
    },
    {
      code: `
declare function foo(arg1: string, arg2: number): void;

const x = ['a', error] as const;
foo(...x);
      `,
      errors: [
        {
          column: 5,
          data: {
            receiver: '`number`',
            sender: 'error typed',
          },
          endColumn: 9,
          line: 5,
          messageId: 'unsafeTupleSpread',
        },
      ],
    },
    {
      code: `
declare function foo(arg1: string, arg2: number): void;
foo(...(['foo', 1, 2] as [string, any, number]));
      `,
      errors: [
        {
          column: 5,
          data: {
            receiver: '`number`',
            sender: 'of type `any`',
          },
          endColumn: 48,
          line: 3,
          messageId: 'unsafeTupleSpread',
        },
      ],
    },
    {
      code: `
declare function foo(arg1: string, arg2: number, arg2: string): void;

const x = [1] as const;
foo('a', ...x, 1 as any);
      `,
      errors: [
        {
          column: 16,
          data: {
            receiver: '`string`',
            sender: '`any`',
          },
          endColumn: 24,
          line: 5,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
declare function foo(arg1: string, arg2: number, ...rest: string[]): void;

const x = [1, 2] as [number, ...number[]];
foo('a', ...x, 1 as any);
      `,
      errors: [
        {
          column: 16,
          data: {
            receiver: '`string`',
            sender: '`any`',
          },
          endColumn: 24,
          line: 5,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
declare function foo(arg1: Set<string>, arg2: Map<string, string>): void;

const x = [new Map<any, string>()] as const;
foo(new Set<any>(), ...x);
      `,
      errors: [
        {
          column: 5,
          data: {
            receiver: '`Set<string>`',
            sender: '`Set<any>`',
          },
          endColumn: 19,
          line: 5,
          messageId: 'unsafeArgument',
        },
        {
          column: 21,
          data: {
            receiver: '`Map<string, string>`',
            sender: 'of type `Map<any, string>`',
          },
          endColumn: 25,
          line: 5,
          messageId: 'unsafeTupleSpread',
        },
      ],
    },
    {
      code: `
declare function foo(...params: [number, string, any]): void;
foo(1 as any, 'a' as any, 1 as any);
      `,
      errors: [
        {
          column: 5,
          data: {
            receiver: '`number`',
            sender: '`any`',
          },
          endColumn: 13,
          line: 3,
          messageId: 'unsafeArgument',
        },
        {
          column: 15,
          data: {
            receiver: '`string`',
            sender: '`any`',
          },
          endColumn: 25,
          line: 3,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
declare function foo(param1: string, ...params: [number, string, any]): void;
foo('a', 1 as any, 'a' as any, 1 as any);
      `,
      errors: [
        {
          column: 10,
          data: {
            receiver: '`number`',
            sender: '`any`',
          },
          endColumn: 18,
          line: 3,
          messageId: 'unsafeArgument',
        },
        {
          column: 20,
          data: {
            receiver: '`string`',
            sender: '`any`',
          },
          endColumn: 30,
          line: 3,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
type T = [number, T[]];
declare function foo(t: T): void;
declare const t: T;
foo(t as any);
      `,
      errors: [
        {
          column: 5,
          data: {
            receiver: '`T`',
            sender: '`any`',
          },
          endColumn: 13,
          line: 5,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
function foo(
  templates: TemplateStringsArray,
  arg1: number,
  arg2: any,
  arg3: string,
) {}
declare const arg: any;
foo<number>\`\${arg}\${arg}\${arg}\`;
      `,
      errors: [
        {
          column: 15,
          data: {
            receiver: '`number`',
            sender: '`any`',
          },
          endColumn: 18,
          line: 9,
          messageId: 'unsafeArgument',
        },
        {
          column: 27,
          data: {
            receiver: '`string`',
            sender: '`any`',
          },
          endColumn: 30,
          line: 9,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
function foo(templates: TemplateStringsArray, arg: number) {}
declare const arg: any;
foo\`\${arg}\`;
      `,
      errors: [
        {
          column: 7,
          data: {
            receiver: '`number`',
            sender: '`any`',
          },
          endColumn: 10,
          line: 4,
          messageId: 'unsafeArgument',
        },
      ],
    },
    {
      code: `
type T = [number, T[]];
function foo(templates: TemplateStringsArray, arg: T) {}
declare const arg: any;
foo\`\${arg}\`;
      `,
      errors: [
        {
          column: 7,
          data: {
            receiver: '`T`',
            sender: '`any`',
          },
          endColumn: 10,
          line: 5,
          messageId: 'unsafeArgument',
        },
      ],
    },
  ],
});
