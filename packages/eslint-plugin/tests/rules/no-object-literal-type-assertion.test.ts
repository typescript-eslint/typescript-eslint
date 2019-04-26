import rule from '../../src/rules/no-object-literal-type-assertion';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false,
    },
  },
});

ruleTester.run('no-object-literal-type-assertion', rule, {
  valid: [
    `<T> x;`,
    `x as T;`,
    `const foo = bar;`,
    `const foo: baz = bar;`,
    `const x: T = {};`,
    `const foo = { bar: { } };`,
    // Allow cast to 'any'
    `const foo = {} as any;`,
    `const foo = <any> {};`,
    // Allow cast to 'unknown'
    `const foo = {} as unknown;`,
    `const foo = <unknown> {};`,
    `const foo = {} as const;`,
    `const foo = <const> {};`,
    {
      code: `print({ bar: 5 } as Foo)`,
      options: [
        {
          allowAsParameter: true,
        },
      ],
    },
    {
      code: `new print({ bar: 5 } as Foo)`,
      options: [
        {
          allowAsParameter: true,
        },
      ],
    },
  ],
  invalid: [
    {
      code: `<T> ({});`,
      errors: [
        {
          messageId: 'unexpectedTypeAssertion',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `({}) as T;`,
      errors: [
        {
          messageId: 'unexpectedTypeAssertion',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `const x = {} as T;`,
      errors: [
        {
          messageId: 'unexpectedTypeAssertion',
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: `print({ bar: 5 } as Foo)`,
      errors: [
        {
          messageId: 'unexpectedTypeAssertion',
          line: 1,
          column: 7,
        },
      ],
    },
    {
      code: `new print({ bar: 5 } as Foo)`,
      errors: [
        {
          messageId: 'unexpectedTypeAssertion',
          line: 1,
          column: 11,
        },
      ],
    },
  ],
});
