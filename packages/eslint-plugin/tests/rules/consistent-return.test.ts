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
    `
      function foo(flag: boolean): number {
        if (flag) {
          return 1;
        } else {
          return 2;
        }
      }
    `,
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
      declare function bar(): void;
      async function foo(flag?: boolean): PromiseVoidNumber {
        if (flag) {
          return bar();
        }
        return;
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
      class Foo {
        baz(): void {}
        async bar(flag: boolean): Promise<void> {
          if (flag) return baz();
          return;
        }
      }
    `,
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
  ],
});
