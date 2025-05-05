import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/consistent-return';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('consistent-return', rule, {
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
          column: 16,
          data: { name: "Function 'foo'" },
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
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
          column: 11,
          data: { name: "Function 'foo'" },
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'missingReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
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
          column: 13,
          data: { name: "Function 'baz'" },
          endColumn: 30,
          endLine: 6,
          line: 6,
          messageId: 'unexpectedReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
        },
        {
          column: 11,
          data: { name: "Function 'bar'" },
          endColumn: 18,
          endLine: 9,
          line: 9,
          messageId: 'missingReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
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
          column: 16,
          data: { name: "Function 'foo'" },
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
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
          column: 16,
          data: { name: "Async function 'foo'" },
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'unexpectedReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
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
          column: 16,
          data: { name: "Async function 'foo'" },
          endColumn: 23,
          endLine: 4,
          line: 4,
          messageId: 'missingReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
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
          column: 11,
          data: { name: "Async function 'foo'" },
          endColumn: 20,
          endLine: 4,
          line: 4,
          messageId: 'unexpectedReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
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
          column: 16,
          data: { name: "Function 'foo'" },
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'unexpectedReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
        },
      ],
    },
    {
      code: `
        declare function bar(): Promise<void>;
        function foo(flag?: boolean): Promise<void> {
          if (flag) {
            return bar();
          }
          return;
        }
      `,
      errors: [
        {
          column: 11,
          data: { name: "Function 'foo'" },
          endColumn: 18,
          endLine: 7,
          line: 7,
          messageId: 'missingReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
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
      errors: [
        {
          column: 11,
          data: { name: "Function 'foo'" },
          endColumn: 23,
          endLine: 6,
          line: 6,
          messageId: 'unexpectedReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
        },
      ],
      options: [
        {
          treatUndefinedAsUnspecified: true,
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
      errors: [
        {
          column: 11,
          data: { name: "Function 'foo'" },
          endColumn: 29,
          endLine: 7,
          line: 7,
          messageId: 'unexpectedReturnValue',
          type: AST_NODE_TYPES.ReturnStatement,
        },
      ],
      options: [
        {
          treatUndefinedAsUnspecified: true,
        },
      ],
    },
  ],
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
      declare function bar(): Promise<void>;
      async function foo(flag?: boolean): Promise<ReturnType<typeof bar>> {
        if (flag) {
          return bar();
        }
        return;
      }
    `,
    `
      async function foo(flag?: boolean): Promise<Promise<void | undefined>> {
        if (flag) {
          return undefined;
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
});
