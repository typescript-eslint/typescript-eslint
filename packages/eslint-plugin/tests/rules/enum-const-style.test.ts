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
    {
      code: 'enum Foo {}',
      options: ['never'],
    },
    {
      code: 'enum Foo { FOO }',
      options: ['never'],
    },
    {
      code: 'enum Foo { FOO = 1, BAR = 2 }',
      options: ['never'],
    },
    {
      code: 'enum Foo { FOO = "FOO", BAR = "BAR" }',
      options: ['never'],
    },
  ],
  invalid: [
    {
      code: 'const enum Foo {}',
      errors: [
        {
          messageId: 'noConstEnums',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'const enum Foo {}',
      errors: [
        {
          messageId: 'noConstEnums',
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
          line: 1,
          column: 1,
        },
      ],
      options: ['always'],
    },
  ],
});
