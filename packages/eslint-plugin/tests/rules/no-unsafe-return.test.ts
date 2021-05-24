import rule from '../../src/rules/no-unsafe-return';
import {
  RuleTester,
  batchedSingleLineTests,
  getFixturesRootDir,
  noFormat,
} from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.noImplicitThis.json',
    tsconfigRootDir: getFixturesRootDir(),
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
    // explicit any generic return type is allowed, if you want to be unsafe like that
    `
function foo(): Set<any> {
  return new Set<any>();
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
    // https://github.com/typescript-eslint/typescript-eslint/issues/2109
    `
      function test(): Map<string, string> {
        return new Map();
      }
    `,
  ],
  invalid: [
    ...batchedSingleLineTests({
      code: noFormat`
function foo() { return (1 as any); }
function foo() { return Object.create(null); }
const foo = () => { return (1 as any) };
const foo = () => Object.create(null);
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: 'any',
          },
          line: 2,
          column: 18,
        },
        {
          messageId: 'unsafeReturn',
          data: {
            type: 'any',
          },
          line: 3,
          column: 18,
        },
        {
          messageId: 'unsafeReturn',
          data: {
            type: 'any',
          },
          line: 4,
          column: 21,
        },
        {
          messageId: 'unsafeReturn',
          data: {
            type: 'any',
          },
          line: 5,
          column: 19,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: noFormat`
function foo() { return ([] as any[]); }
function foo() { return ([] as Array<any>); }
function foo() { return ([] as readonly any[]); }
function foo() { return ([] as Readonly<any[]>); }
const foo = () => { return ([] as any[]) };
const foo = () => ([] as any[]);
      `,
      errors: [
        {
          messageId: 'unsafeReturn',
          data: {
            type: 'any[]',
          },
          line: 2,
          column: 18,
        },
        {
          messageId: 'unsafeReturn',
          data: {
            type: 'any[]',
          },
          line: 3,
          column: 18,
        },
        {
          messageId: 'unsafeReturn',
          data: {
            type: 'any[]',
          },
          line: 4,
          column: 18,
        },
        {
          messageId: 'unsafeReturn',
          data: {
            type: 'any[]',
          },
          line: 5,
          column: 18,
        },
        {
          messageId: 'unsafeReturn',
          data: {
            type: 'any[]',
          },
          line: 6,
          column: 21,
        },
        {
          messageId: 'unsafeReturn',
          data: {
            type: 'any[]',
          },
          line: 7,
          column: 20,
        },
      ],
    }),
    ...batchedSingleLineTests({
      code: noFormat`
function foo(): Set<string> { return new Set<any>(); }
function foo(): Map<string, string> { return new Map<string, any>(); }
function foo(): Set<string[]> { return new Set<any[]>(); }
function foo(): Set<Set<Set<string>>> { return new Set<Set<Set<any>>>(); }
      `,
      errors: [
        {
          messageId: 'unsafeReturnAssignment',
          data: {
            sender: 'Set<any>',
            receiver: 'Set<string>',
          },
          line: 2,
        },
        {
          messageId: 'unsafeReturnAssignment',
          data: {
            sender: 'Map<string, any>',
            receiver: 'Map<string, string>',
          },
          line: 3,
        },
        {
          messageId: 'unsafeReturnAssignment',
          data: {
            sender: 'Set<any[]>',
            receiver: 'Set<string[]>',
          },
          line: 4,
        },
        {
          messageId: 'unsafeReturnAssignment',
          data: {
            sender: 'Set<Set<Set<any>>>',
            receiver: 'Set<Set<Set<string>>>',
          },
          line: 5,
        },
      ],
    }),
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
        },
        {
          messageId: 'unsafeReturnThis',
          line: 7,
          column: 16,
          endColumn: 20,
        },
      ],
    },
  ],
});
