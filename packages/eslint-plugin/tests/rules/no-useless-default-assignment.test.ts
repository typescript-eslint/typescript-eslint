import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-useless-default-assignment';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('no-useless-default-assignment', rule, {
  valid: [
    `
      function Bar({ foo = '' }: { foo?: string }) {
        return foo;
      }
    `,
    `
      const { foo } = { foo: 'bar' };
    `,
    `
      [1, 2, 3, undefined].map((a = 42) => a + 1);
    `,
    `
      function test(a?: number) {
        return a;
      }
    `,
    `
      const obj: { a?: string } = {};
      const { a = 'default' } = obj;
    `,
    `
      function test(a: string | undefined = 'default') {
        return a;
      }
    `,
    `
      (a: string = 'default') => a;
    `,
    `
      function test(a: string = 'default') {
        return a;
      }
    `,
    `
      class C {
        public test(a: string = 'default') {
          return a;
        }
      }
    `,
    `
      const obj: { a: string | undefined } = { a: undefined };
      const { a = 'default' } = obj;
    `,
    `
      function test(arr: number[] | undefined = []) {
        return arr;
      }
    `,
    `
      function Bar({ nested: { foo = '' } = {} }: { nested?: { foo?: string } }) {
        return foo;
      }
    `,
    `
      function test(a: any = 'default') {
        return a;
      }
    `,
    `
      function test(a: unknown = 'default') {
        return a;
      }
    `,
    `
      function test(a = 5) {
        return a;
      }
    `,
    `
      function createValidator(): () => void {
        return (param = 5) => {};
      }
    `,
    `
      function Bar({ foo = '' }: { foo: any }) {
        return foo;
      }
    `,
    `
      function Bar({ foo = '' }: { foo: unknown }) {
        return foo;
      }
    `,
  ],
  invalid: [
    {
      code: `
        function Bar({ foo = '' }: { foo: string }) {
          return foo;
        }
      `,
      errors: [
        {
          column: 30,
          data: { type: 'property' },
          endColumn: 32,
          line: 2,
          messageId: 'uselessDefaultAssignment',
          suggestions: [
            {
              messageId: 'suggestRemoveDefault',
              output: `
        function Bar({ foo }: { foo: string }) {
          return foo;
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        class C {
          public method({ foo = '' }: { foo: string }) {
            return foo;
          }
        }
      `,
      errors: [
        {
          column: 33,
          data: { type: 'property' },
          endColumn: 35,
          line: 3,
          messageId: 'uselessDefaultAssignment',
          suggestions: [
            {
              messageId: 'suggestRemoveDefault',
              output: `
        class C {
          public method({ foo }: { foo: string }) {
            return foo;
          }
        }
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        const { 'literal-key': literalKey = 'default' } = { 'literal-key': 'value' };
      `,
      errors: [
        {
          column: 45,
          data: { type: 'property' },
          endColumn: 54,
          line: 2,
          messageId: 'uselessDefaultAssignment',
          suggestions: [
            {
              messageId: 'suggestRemoveDefault',
              output: `
        const { 'literal-key': literalKey } = { 'literal-key': 'value' };
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
        [1, 2, 3].map((a = 42) => a + 1);
      `,
      errors: [
        {
          column: 28,
          data: { type: 'parameter' },
          endColumn: 30,
          line: 2,
          messageId: 'uselessDefaultAssignment',
          suggestions: [
            {
              messageId: 'suggestRemoveDefault',
              output: `
        [1, 2, 3].map((a) => a + 1);
      `,
            },
          ],
        },
      ],
    },
  ],
});
