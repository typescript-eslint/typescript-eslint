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
    // React props destructuring with optional property
    `
      function Bar({ foo = '' }: { foo?: string }) {
        return foo;
      }
    `,
    // Destructuring assignment - no default needed when property exists
    `
      const { foo } = { foo: 'bar' };
    `,
    // Default parameter with undefined in union
    `
      [1, 2, 3, undefined].map((a = 42) => a + 1);
    `,
    // Default parameter with optional parameter type
    `
      function test(a?: number) {
        return a;
      }
    `,
    // Object destructuring with optional property
    `
      const obj: { a?: string } = {};
      const { a = 'default' } = obj;
    `,
    // Function parameter with union including undefined
    `
      function test(a: string | undefined = 'default') {
        return a;
      }
    `,
    // Destructuring with union type including undefined
    `
      const obj: { a: string | undefined } = { a: undefined };
      const { a = 'default' } = obj;
    `,
    // Array parameter that can be undefined
    `
      function test(arr: number[] | undefined = []) {
        return arr;
      }
    `,
    // Complex destructuring with optional
    `
      function Bar({ nested: { foo = '' } = {} }: { nested?: { foo?: string } }) {
        return foo;
      }
    `,
    // Default with any type (should not error)
    `
      function test(a: any = 'default') {
        return a;
      }
    `,
    // Default with unknown type (should not error)
    `
      function test(a: unknown = 'default') {
        return a;
      }
    `,
    // Function parameter without type annotation - default makes it optional
    `
      function test(a = 5) {
        return a;
      }
    `,
  ],
  invalid: [
    // React props destructuring - property is not optional
    {
      code: `
        function Bar({ foo = '' }: { foo: string }) {
          return foo;
        }
      `,
      errors: [
        {
          data: { type: 'property' },
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
    // Destructuring assignment - property is not optional
    {
      code: `
        const { foo = '' } = { foo: 'bar' };
      `,
      errors: [
        {
          data: { type: 'property' },
          line: 2,
          messageId: 'uselessDefaultAssignment',
          suggestions: [
            {
              messageId: 'suggestRemoveDefault',
              output: `
        const { foo } = { foo: 'bar' };
      `,
            },
          ],
        },
      ],
    },
    // Default parameter - array elements are never undefined
    {
      code: `
        [1, 2, 3].map((a = 42) => a + 1);
      `,
      errors: [
        {
          data: { type: 'parameter' },
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
