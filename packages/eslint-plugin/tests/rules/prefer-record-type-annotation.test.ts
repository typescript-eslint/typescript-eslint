import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-record-type-annotation';

const ruleTester = new RuleTester();

ruleTester.run('prefer-record-type-annotation', rule, {
  valid: [
    // Already has type annotation
    'const obj: Record<string, string> = { a: "1", b: "2", c: "3" };',



    // Mixed value types (not supported)
    'const obj = { a: "string", b: 42, c: true };',

    // Complex properties (computed, methods, etc.)
    `const obj = {
      a: "1",
      b: "2",
      c: "3",
      ['computed']: "4"
    };`,

    // Object with methods
    `const obj = {
      a: "1",
      b: "2",
      c: "3",
      method() { return "4"; }
    };`,

    // Not a variable declaration
    `function test() {
      return { a: "1", b: "2", c: "3" };
    }`,

    // Destructuring assignment
    'const { a, b, c } = { a: "1", b: "2", c: "3" };',

    // Array assignment
    'const arr = ["a", "b", "c"];',

    // Non-object assignment
    'const str = "hello";',



    // Values that can't be typed (variables)
    `const value = "test";
     const obj = { a: value, b: value, c: value };`,
  ],
  invalid: [
    // 2 properties should now trigger
    {
      code: 'const config = { dev: "development", prod: "production" };',
      errors: [
        {
          messageId: 'preferRecordAnnotation',
          data: {
            keyType: "'dev' | 'prod'",
            valueType: 'string',
          },
        },
      ],
      output: "const config: Record<'dev' | 'prod', string> = { dev: \"development\", prod: \"production\" };",
    },

    // Basic case - 3 string properties
    {
      code: 'const statusMessages = { success: "OK", error: "Failed", pending: "Loading" };',
      errors: [
        {
          messageId: 'preferRecordAnnotation',
          data: {
            keyType: "'success' | 'error' | 'pending'",
            valueType: 'string',
          },
        },
      ],
      output: "const statusMessages: Record<'success' | 'error' | 'pending', string> = { success: \"OK\", error: \"Failed\", pending: \"Loading\" };",
    },

    // String properties with longer values
    {
      code: `const apiEndpoints = {
        users: "https://api.example.com/v1/users",
        posts: "https://api.example.com/v1/posts",
        comments: "https://api.example.com/v1/comments",
      };`,
      errors: [
        {
          messageId: 'preferRecordAnnotation',
        },
      ],
      output: `const apiEndpoints: Record<'users' | 'posts' | 'comments', string> = {
        users: "https://api.example.com/v1/users",
        posts: "https://api.example.com/v1/posts",
        comments: "https://api.example.com/v1/comments",
      };`,
    },

    // Number properties
    {
      code: 'const scores = { alice: 100, bob: 95, charlie: 87 };',
      errors: [
        {
          messageId: 'preferRecordAnnotation',
          data: {
            keyType: "'alice' | 'bob' | 'charlie'",
            valueType: 'number',
          },
        },
      ],
      output: "const scores: Record<'alice' | 'bob' | 'charlie', number> = { alice: 100, bob: 95, charlie: 87 };",
    },

    // Boolean properties
    {
      code: 'const flags = { debugMode: true, testMode: false, prodMode: true };',
      errors: [
        {
          messageId: 'preferRecordAnnotation',
          data: {
            keyType: "'debugMode' | 'testMode' | 'prodMode'",
            valueType: 'boolean',
          },
        },
      ],
      output: "const flags: Record<'debugMode' | 'testMode' | 'prodMode', boolean> = { debugMode: true, testMode: false, prodMode: true };",
    },

    // Template literal values
    {
      code: 'const messages = { greeting: `Hello world`, farewell: `Goodbye`, welcome: `Welcome` };',
      errors: [
        {
          messageId: 'preferRecordAnnotation',
          data: {
            keyType: "'greeting' | 'farewell' | 'welcome'",
            valueType: 'string',
          },
        },
      ],
      output: "const messages: Record<'greeting' | 'farewell' | 'welcome', string> = { greeting: `Hello world`, farewell: `Goodbye`, welcome: `Welcome` };",
    },

    // Negative numbers
    {
      code: 'const temperatures = { freezing: -32, cold: -10, hot: 100 };',
      errors: [
        {
          messageId: 'preferRecordAnnotation',
        },
      ],
      output: "const temperatures: Record<'freezing' | 'cold' | 'hot', number> = { freezing: -32, cold: -10, hot: 100 };",
    },

    // String keys (quoted)
    {
      code: `const obj = { "key-1": "value1", "key-2": "value2", "key-3": "value3" };`,
      errors: [
        {
          messageId: 'preferRecordAnnotation',
        },
      ],
      output: `const obj: Record<'key-1' | 'key-2' | 'key-3', string> = { "key-1": "value1", "key-2": "value2", "key-3": "value3" };`,
    },



    // Object arrays
    {
      code: 'const data = { items: [], values: [], results: [] };',
      errors: [
        {
          messageId: 'preferRecordAnnotation',
          data: {
            keyType: "'items' | 'values' | 'results'",
            valueType: 'any[]',
          },
        },
      ],
      output: "const data: Record<'items' | 'values' | 'results', any[]> = { items: [], values: [], results: [] };",
    },

    // Nested objects
    {
      code: 'const configs = { dev: {}, staging: {}, prod: {} };',
      errors: [
        {
          messageId: 'preferRecordAnnotation',
          data: {
            keyType: "'dev' | 'staging' | 'prod'",
            valueType: 'object',
          },
        },
      ],
      output: "const configs: Record<'dev' | 'staging' | 'prod', object> = { dev: {}, staging: {}, prod: {} };",
    },
  ],
});
