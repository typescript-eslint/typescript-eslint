import rule from '../../src/rules/enum-const-style';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('enum-style', rule, {
  valid: [
    'enum Foo {}',
    'enum Foo { FOO }',
    'enum Foo { FOO = 1, BAR = 2 }',
    'enum Foo { FOO = "FOO", BAR = "BAR" }',
    {
      code: 'const enum Foo {}',
      options: ['always'],
    },
    {
      code: 'const enum Foo { FOO }',
      options: ['always'],
    },
    {
      code: 'const enum Foo { FOO = 1, BAR = 2 }',
      options: ['always'],
    },
    {
      code: 'const enum Foo { FOO = "FOO", BAR = "BAR" }',
      options: ['always'],
    },
  ],
  invalid: [
    {
      code: 'const enum Foo {}',
      errors: [
        {
          messageId: 'noConstEnums',
          data: {
            name: 'Object',
          },
          line: 1,
          column: 1,
        },
      ],
      options: [],
    },
    {
      code: 'const enum Foo {}',
      errors: [
        {
          messageId: 'noConstEnums',
          data: {
            name: 'Object',
          },
          line: 1,
          column: 1,
        },
      ],
      options: ['never'],
    },
    {
      code: 'enum Foo {}',
      errors: [
        {
          messageId: 'noNonConstEnums',
          data: {
            name: 'Object',
          },
          line: 1,
          column: 1,
        },
      ],
      options: ['always'],
    },
  ],
});
