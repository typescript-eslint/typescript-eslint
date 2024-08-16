import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unsafe-return';
import { getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.noImplicitThis.json',
      projectService: false,
      tsconfigRootDir: getFixturesRootDir(),
    },
  },
});

ruleTester.run('no-unsafe-return', rule, {
  valid: [
    `
function foo() {
  return;
}
    `,
    `
function foo() {
  return 1;
}
    `,
    `
function foo() {
  return '';
}
    `,
    `
function foo() {
  return true;
}
    `,
    // this actually types as `never[]`
    `
function foo() {
  return [];
}
    `,
    // explicit any return type is allowed, if you want to be unsafe like that
    `
function foo(): any {
  return {} as any;
}
    `,
    `
declare function foo(arg: () => any): void;
foo((): any => 'foo' as any);
    `,
    `
declare function foo(arg: null | (() => any)): void;
foo((): any => 'foo' as any);
    `,
    // explicit any array return type is allowed, if you want to be unsafe like that
    `
function foo(): any[] {
  return [] as any[];
}
    `,
    // explicit any generic return type is allowed, if you want to be unsafe like that
    `
function foo(): Set<any> {
  return new Set<any>();
}
    `,
    `
async function foo(): Promise<any> {
  return Promise.resolve({} as any);
}
    `,
    `
async function foo(): Promise<any> {
  return {} as any;
}
    `,
    `
function foo(): object {
  return Promise.resolve({} as any);
}
    `,
    // TODO - this should error, but it's hard to detect, as the type references are different
    `
function foo(): ReadonlySet<number> {
  return new Set<any>();
}
    `,
    `
function foo(): Set<number> {
  return new Set([1]);
}
    `,
    `
      type Foo<T = number> = { prop: T };
      function foo(): Foo {
        return { prop: 1 } as Foo<number>;
      }
    `,
    `
      type Foo = { prop: any };
      function foo(): Foo {
        return { prop: '' } as Foo;
      }
    `,
    // TS 3.9 changed this to be safe
    `
      function fn<T extends any>(x: T) {
        return x;
      }
    `,
    `
      function fn<T extends any>(x: T): unknown {
        return x as any;
      }
    `,
    `
      function fn<T extends any>(x: T): unknown[] {
        return x as any[];
      }
    `,
    `
      function fn<T extends any>(x: T): Set<unknown> {
        return x as Set<any>;
      }
    `,
    `
      async function fn<T extends any>(x: T): Promise<unknown> {
        return x as any;
      }
    `,
    `
      function fn<T extends any>(x: T): Promise<unknown> {
        return Promise.resolve(x as any);
      }
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/2109
    `
      function test(): Map<string, string> {
        return new Map();
      }
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/3549
    `
      function foo(): any {
        return [] as any[];
      }
    `,
    `
      function foo(): unknown {
        return [] as any[];
      }
    `,
    `
      declare const value: Promise<any>;
      function foo() {
        return value;
      }
    `,
    'const foo: (() => void) | undefined = () => 1;',
  ],
  invalid: [
    {
      code: `
function foo() {
  return 1 as any;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: '`any`',
          },
        },
      ],
    },
    {
      code: `
function foo() {
  return Object.create(null);
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: '`any`',
          },
        },
      ],
    },
    {
      code: `
const foo = () => {
  return 1 as any;
};
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: '`any`',
          },
        },
      ],
    },
    {
      code: 'const foo = () => Object.create(null);',
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: '`any`',
          },
        },
      ],
    },
    {
      code: `
function foo() {
  return [] as any[];
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: '`any[]`',
          },
        },
      ],
    },
    {
      code: `
function foo() {
  return [] as Array<any>;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: '`any[]`',
          },
        },
      ],
    },
    {
      code: `
function foo() {
  return [] as readonly any[];
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: '`any[]`',
          },
        },
      ],
    },
    {
      code: `
function foo() {
  return [] as Readonly<any[]>;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: '`any[]`',
          },
        },
      ],
    },
    {
      code: `
const foo = () => {
  return [] as any[];
};
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: '`any[]`',
          },
        },
      ],
    },
    {
      code: 'const foo = () => [] as any[];',
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: '`any[]`',
          },
        },
      ],
    },
    {
      code: `
function foo(): Set<string> {
  return new Set<any>();
}
      `,
      errors: [
        {
          messageId: 'unsafeReturnAssignment',
          data: {
            sender: 'Set<any>',
            receiver: 'Set<string>',
          },
        },
      ],
    },
    {
      code: `
function foo(): Map<string, string> {
  return new Map<string, any>();
}
      `,
      errors: [
        {
          messageId: 'unsafeReturnAssignment',
          data: {
            sender: 'Map<string, any>',
            receiver: 'Map<string, string>',
          },
        },
      ],
    },
    {
      code: `
function foo(): Set<string[]> {
  return new Set<any[]>();
}
      `,
      errors: [
        {
          messageId: 'unsafeReturnAssignment',
          data: {
            sender: 'Set<any[]>',
            receiver: 'Set<string[]>',
          },
        },
      ],
    },
    {
      code: `
function foo(): Set<Set<Set<string>>> {
  return new Set<Set<Set<any>>>();
}
      `,
      errors: [
        {
          messageId: 'unsafeReturnAssignment',
          data: {
            sender: 'Set<Set<Set<any>>>',
            receiver: 'Set<Set<Set<string>>>',
          },
        },
      ],
    },

    {
      code: `
type Fn = () => Set<string>;
const foo1: Fn = () => new Set<any>();
const foo2: Fn = function test() {
  return new Set<any>();
};
      `,
      errors: [
        {
          messageId: 'unsafeReturnAssignment',
          line: 3,
          data: {
            sender: 'Set<any>',
            receiver: 'Set<string>',
          },
        },
        {
          messageId: 'unsafeReturnAssignment',
          line: 5,
          data: {
            sender: 'Set<any>',
            receiver: 'Set<string>',
          },
        },
      ],
    },
    {
      code: `
type Fn = () => Set<string>;
function receiver(arg: Fn) {}
receiver(() => new Set<any>());
receiver(function test() {
  return new Set<any>();
});
      `,
      errors: [
        {
          messageId: 'unsafeReturnAssignment',
          line: 4,
          data: {
            sender: 'Set<any>',
            receiver: 'Set<string>',
          },
        },
        {
          messageId: 'unsafeReturnAssignment',
          line: 6,
          data: {
            sender: 'Set<any>',
            receiver: 'Set<string>',
          },
        },
      ],
    },
    {
      code: `
function foo() {
  return this;
}

function bar() {
  return () => this;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturnThis',
          line: 3,
          column: 3,
          endColumn: 15,
          data: {
            type: '`any`',
          },
        },
        {
          messageId: 'unsafeReturnThis',
          line: 7,
          column: 16,
          endColumn: 20,
          data: {
            type: '`any`',
          },
        },
      ],
    },
    {
      code: `
declare function foo(arg: null | (() => any)): void;
foo(() => 'foo' as any);
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 3,
          column: 11,
          endColumn: 23,
          data: {
            type: '`any`',
          },
        },
      ],
    },
    {
      code: `
let value: NotKnown;

function example() {
  return value;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 5,
          column: 3,
          endColumn: 16,
          data: {
            type: 'error',
          },
        },
      ],
    },
    {
      code: `
declare const value: any;
async function foo() {
  return value;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 4,
          column: 3,
          data: {
            type: '`any`',
          },
        },
      ],
    },
    {
      code: `
declare const value: Promise<any>;
async function foo(): Promise<number> {
  return value;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 4,
          column: 3,
          data: {
            type: '`Promise<any>`',
          },
        },
      ],
    },
    {
      code: `
async function foo(arg: number) {
  return arg as Promise<any>;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 3,
          column: 3,
          data: {
            type: '`Promise<any>`',
          },
        },
      ],
    },
    {
      code: `
function foo(): Promise<any> {
  return {} as any;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 3,
          column: 3,
          data: {
            type: '`any`',
          },
        },
      ],
    },
    {
      code: `
function foo(): Promise<object> {
  return {} as any;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 3,
          column: 3,
          data: {
            type: '`any`',
          },
        },
      ],
    },
    {
      code: `
async function foo(): Promise<object> {
  return Promise.resolve<any>({});
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 3,
          column: 3,
          data: {
            type: '`Promise<any>`',
          },
        },
      ],
    },
    {
      code: `
async function foo(): Promise<object> {
  return Promise.resolve<Promise<Promise<any>>>({} as Promise<any>);
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 3,
          column: 3,
          data: {
            type: '`Promise<any>`',
          },
        },
      ],
    },
    {
      code: `
async function foo(): Promise<object> {
  return {} as Promise<Promise<Promise<Promise<any>>>>;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 3,
          column: 3,
          data: {
            type: '`Promise<any>`',
          },
        },
      ],
    },
    {
      code: `
async function foo() {
  return {} as Promise<Promise<Promise<Promise<any>>>>;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 3,
          column: 3,
          data: {
            type: '`Promise<any>`',
          },
        },
      ],
    },
    {
      code: `
async function foo() {
  return {} as Promise<any> | Promise<object>;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 3,
          column: 3,
          data: {
            type: '`Promise<any>`',
          },
        },
      ],
    },
    {
      code: `
async function foo() {
  return {} as Promise<any | object>;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 3,
          column: 3,
          data: {
            type: '`Promise<any>`',
          },
        },
      ],
    },
    {
      code: `
async function foo() {
  return {} as Promise<any> & { __brand: 'any' };
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 3,
          column: 3,
          data: {
            type: '`Promise<any>`',
          },
        },
      ],
    },
    {
      code: `
interface Alias<T> extends Promise<any> {
  foo: 'bar';
}

declare const value: Alias<number>;
async function foo() {
  return value;
}
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          line: 8,
          column: 3,
          data: {
            type: '`Promise<any>`',
          },
        },
      ],
    },
  ],
});
