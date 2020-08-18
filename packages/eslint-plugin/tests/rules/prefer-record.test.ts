import rule from '../../src/rules/prefer-record';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-record', rule, {
  valid: [
    // Record
    'type Foo = Record<string, any>;',

    // Interface
    'interface Foo {}',
    `
interface Foo {
  bar: string;
  [key: string]: any;
}
    `,
    `
interface Foo {
  [key: string]: any;
  bar: string;
}
    `,

    // Type literal
    'type Foo = {};',
    `
type Foo = {
  bar: string;
  [key: string]: any;
};
    `,
    `
type Foo = {
  [key: string]: any;
  bar: string;
};
    `,

    // Generic
    `
type Foo = Generic<{
  [key: string]: any;
  bar: string;
}>;
    `,

    // Function types
    'function foo(arg: { [key: string]: any; bar: string }) {}',
    'function foo(): { [key: string]: any; bar: string } {}',
  ],
  invalid: [
    // Interface
    {
      code: `
interface Foo {
  [key: string]: any;
}
      `,
      output: `
type Foo = Record<string, any>;
      `,
      errors: [{ messageId: 'preferRecord', line: 2, column: 1 }],
    },

    // Type literal
    {
      code: 'type Foo = { [key: string]: any };',
      output: 'type Foo = Record<string, any>;',
      errors: [{ messageId: 'preferRecord', line: 1, column: 12 }],
    },

    // Generic
    {
      code: 'type Foo = Generic<{ [key: string]: any }>;',
      output: 'type Foo = Generic<Record<string, any>>;',
      errors: [{ messageId: 'preferRecord', line: 1, column: 20 }],
    },

    // Function types
    {
      code: 'function foo(arg: { [key: string]: any }) {}',
      output: 'function foo(arg: Record<string, any>) {}',
      errors: [{ messageId: 'preferRecord', line: 1, column: 19 }],
    },
    {
      code: 'function foo(): { [key: string]: any } {}',
      output: 'function foo(): Record<string, any> {}',
      errors: [{ messageId: 'preferRecord', line: 1, column: 17 }],
    },

    // Never
    // Type literal
    {
      code: 'type Foo = Record<string, any>;',
      options: ['never'],
      output: 'type Foo = { [key: string]: any };',
      errors: [{ messageId: 'preferIndexSignature', line: 1, column: 12 }],
    },

    // Generic
    {
      code: 'type Foo = Generic<Record<string, any>>;',
      options: ['never'],
      output: 'type Foo = Generic<{ [key: string]: any }>;',
      errors: [{ messageId: 'preferIndexSignature', line: 1, column: 20 }],
    },

    // Function types
    {
      code: 'function foo(arg: Record<string, any>) {}',
      options: ['never'],
      output: 'function foo(arg: { [key: string]: any }) {}',
      errors: [{ messageId: 'preferIndexSignature', line: 1, column: 19 }],
    },
    {
      code: 'function foo(): Record<string, any> {}',
      options: ['never'],
      output: 'function foo(): { [key: string]: any } {}',
      errors: [{ messageId: 'preferIndexSignature', line: 1, column: 17 }],
    },
  ],
});
