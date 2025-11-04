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
    // Default is valid when property type is optional
    `
      function Bar({ foo = '' }: { foo?: string }) {
        return foo;
      }
    `,
    // No default value used in destructuring
    `
      const { foo } = { foo: 'bar' };
    `,
    // Default is valid when array contains undefined
    `
      [1, 2, 3, undefined].map((a = 42) => a + 1);
    `,
    // Default is valid for optional parameter
    `
      function test(a?: number) {
        return a;
      }
    `,
    // Default is valid when destructuring optional property
    `
      const obj: { a?: string } = {};
      const { a = 'default' } = obj;
    `,
    // Default is valid when union type includes undefined
    `
      function test(a: string | undefined = 'default') {
        return a;
      }
    `,
    // Default on arrow function parameter is not checked
    `
      (a: string = 'default') => a;
    `,
    // Default on regular function parameter is not checked
    `
      function test(a: string = 'default') {
        return a;
      }
    `,
    // Default on class method parameter is not checked
    `
      class C {
        public test(a: string = 'default') {
          return a;
        }
      }
    `,
    // Default is valid when union type includes undefined
    `
      const obj: { a: string | undefined } = { a: undefined };
      const { a = 'default' } = obj;
    `,
    // Default is valid when union type includes undefined
    `
      function test(arr: number[] | undefined = []) {
        return arr;
      }
    `,
    // Default is valid for nested optional properties
    `
      function Bar({ nested: { foo = '' } = {} }: { nested?: { foo?: string } }) {
        return foo;
      }
    `,
    // Default is valid for any type
    `
      function test(a: any = 'default') {
        return a;
      }
    `,
    // Default is valid for unknown type
    `
      function test(a: unknown = 'default') {
        return a;
      }
    `,
    // Default on parameter without type annotation is not checked
    `
      function test(a = 5) {
        return a;
      }
    `,
    // Default on callback parameter without type annotation is not checked
    `
      function createValidator(): () => void {
        return (param = 5) => {};
      }
    `,
    // Default is valid when property type is any
    `
      function Bar({ foo = '' }: { foo: any }) {
        return foo;
      }
    `,
    // Default is valid when property type is unknown
    `
      function Bar({ foo = '' }: { foo: unknown }) {
        return foo;
      }
    `,
  ],
  invalid: [
    // Default is useless when property type is required
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
    // Default is useless when destructured property type is required
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
    // Default is useless when destructuring required property with literal key
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
    // Default is useless when array elements cannot be undefined
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
