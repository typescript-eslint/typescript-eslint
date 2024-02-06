import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/consistent-return';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
});

ruleTester.run('consistent-return', rule, {
  valid: [
    // base rule
    `
      function foo() {
        return;
      }
    `,
    `
      const foo = (flag: boolean) => {
        if (flag) return true;
        return false;
      };
    `,
    `
      class A {
        foo() {
          if (a) return true;
          return false;
        }
      }
    `,
    {
      code: `
        const foo = (flag: boolean) => {
          if (flag) return;
          else return undefined;
        };
      `,
      options: [{ treatUndefinedAsUnspecified: true }],
    },
    // void
    `
      declare function bar(): void;
      function foo(flag: boolean): void {
        if (flag) {
          return bar();
        }
        return;
      }
    `,
    `
      declare function bar(): void;
      const foo = (flag: boolean): void => {
        if (flag) {
          return;
        }
        return bar();
      };
    `,
    `
      function foo(flag?: boolean): number | void {
        if (flag) {
          return 42;
        }
        return;
      }
    `,
    `
      function foo(): boolean;
      function foo(flag: boolean): void;
      function foo(flag?: boolean): boolean | void {
        if (flag) {
          return;
        }
        return true;
      }
    `,
    `
      class Foo {
        baz(): void {}
        bar(flag: boolean): void {
          if (flag) return baz();
          return;
        }
      }
    `,
    `
      declare function bar(): void;
      function foo(flag: boolean): void {
        function fn(): string {
          return '1';
        }
        if (flag) {
          return bar();
        }
        return;
      }
    `,
    `
      class Foo {
        foo(flag: boolean): void {
          const bar = (): void => {
            if (flag) return;
            return this.foo();
          };
          if (flag) {
            return this.bar();
          }
          return;
        }
      }
    `,
    // async
    `
      declare function bar(): void;
      async function foo(flag?: boolean): Promise<void> {
        if (flag) {
          return bar();
        }
        return;
      }
    `,
    `
      type PromiseVoidNumber = Promise<void | number>;
      async function foo(flag?: boolean): PromiseVoidNumber {
        if (flag) {
          return 42;
        }
        return;
      }
    `,
    `
      class Foo {
        baz(): void {}
        async bar(flag: boolean): Promise<void> {
          if (flag) return baz();
          return;
        }
      }
    `,
    {
      code: `
        declare const undef: undefined;
        function foo(flag: boolean) {
          if (flag) {
            return undef;
          }
          return 'foo';
        }
      `,
      options: [
        {
          treatUndefinedAsUnspecified: false,
        },
      ],
    },
    {
      code: `
        function foo(flag: boolean): undefined {
          if (flag) {
            return undefined;
          }
          return;
        }
      `,
      options: [
        {
          treatUndefinedAsUnspecified: true,
        },
      ],
    },
    {
      code: `
        declare const undef: undefined;
        function foo(flag: boolean): undefined {
          if (flag) {
            return undef;
          }
          return;
        }
      `,
      options: [
        {
          treatUndefinedAsUnspecified: true,
        },
      ],
    },
  ],
  invalid: [
    {
      code: `
        function foo(flag: boolean): any {
          if (flag) return true;
          else return;
        }
      `,
      errors: [
        {
          messageId: 'missingReturnValue',
          data: { name: "Function 'foo'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 4,
          column: 16,
          endLine: 4,
          endColumn: 23,
        },
      ],
    },
    {
      code: `
        function bar(): undefined {}
        function foo(flag: boolean): undefined {
          if (flag) return bar();
          return;
        }
      `,
      errors: [
        {
          messageId: 'missingReturnValue',
          data: { name: "Function 'foo'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 5,
          column: 11,
          endLine: 5,
          endColumn: 18,
        },
      ],
    },
    {
      code: `
        declare function foo(): void;
        function bar(flag: boolean): undefined {
          function baz(): undefined {
            if (flag) return;
            return undefined;
          }
          if (flag) return baz();
          return;
        }
      `,
      errors: [
        {
          messageId: 'unexpectedReturnValue',
          data: { name: "Function 'baz'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 6,
          column: 13,
          endLine: 6,
          endColumn: 30,
        },
        {
          messageId: 'missingReturnValue',
          data: { name: "Function 'bar'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 9,
          column: 11,
          endLine: 9,
          endColumn: 18,
        },
      ],
    },
    {
      code: `
        function foo(flag: boolean): Promise<void> {
          if (flag) return Promise.resolve(void 0);
          else return;
        }
      `,
      errors: [
        {
          messageId: 'missingReturnValue',
          data: { name: "Function 'foo'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 4,
          column: 16,
          endLine: 4,
          endColumn: 23,
        },
      ],
    },
    {
      code: `
        async function foo(flag: boolean): Promise<string> {
          if (flag) return;
          else return 'value';
        }
      `,
      errors: [
        {
          messageId: 'unexpectedReturnValue',
          data: { name: "Async function 'foo'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 4,
          column: 16,
          endLine: 4,
          endColumn: 31,
        },
      ],
    },
    {
      code: `
        async function foo(flag: boolean): Promise<string | undefined> {
          if (flag) return 'value';
          else return;
        }
      `,
      errors: [
        {
          messageId: 'missingReturnValue',
          data: { name: "Async function 'foo'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 4,
          column: 16,
          endLine: 4,
          endColumn: 23,
        },
      ],
    },
    {
      code: `
        async function foo(flag: boolean) {
          if (flag) return;
          return 1;
        }
      `,
      errors: [
        {
          messageId: 'unexpectedReturnValue',
          data: { name: "Async function 'foo'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 4,
          column: 11,
          endLine: 4,
          endColumn: 20,
        },
      ],
    },
    {
      code: `
        function foo(flag: boolean): Promise<string | undefined> {
          if (flag) return;
          else return 'value';
        }
      `,
      errors: [
        {
          messageId: 'unexpectedReturnValue',
          data: { name: "Function 'foo'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 4,
          column: 16,
          endLine: 4,
          endColumn: 31,
        },
      ],
    },
    {
      code: `
        declare async function bar(): Promise<void>;
        function foo(flag?: boolean): Promise<void> {
          if (flag) {
            return bar();
          }
          return;
        }
      `,
      errors: [
        {
          messageId: 'missingReturnValue',
          data: { name: "Function 'foo'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 7,
          column: 11,
          endLine: 7,
          endColumn: 18,
        },
      ],
    },
    {
      code: `
        function foo(flag: boolean): undefined | boolean {
          if (flag) {
            return undefined;
          }
          return true;
        }
      `,
      options: [
        {
          treatUndefinedAsUnspecified: true,
        },
      ],
      errors: [
        {
          messageId: 'unexpectedReturnValue',
          data: { name: "Function 'foo'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 6,
          column: 11,
          endLine: 6,
          endColumn: 23,
        },
      ],
    },
    {
      code: `
        declare const undefOrNum: undefined | number;
        function foo(flag: boolean) {
          if (flag) {
            return;
          }
          return undefOrNum;
        }
      `,
      options: [
        {
          treatUndefinedAsUnspecified: true,
        },
      ],
      errors: [
        {
          messageId: 'unexpectedReturnValue',
          data: { name: "Function 'foo'" },
          type: AST_NODE_TYPES.ReturnStatement,
          line: 7,
          column: 11,
          endLine: 7,
          endColumn: 29,
        },
      ],
    },
  ],
});
