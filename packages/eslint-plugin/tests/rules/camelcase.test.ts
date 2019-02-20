import rule from '../../src/rules/camelcase';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('camelcase', rule, {
  valid: [
    {
      code: 'interface Foo { b_ar: number }',
      options: [{ properties: 'never' }],
    },
    {
      code: 'interface Foo { bar: number }',
      options: [{ properties: 'always' }],
    },
    {
      code: 'class Foo { b_ar: number; }',
      options: [{ properties: 'never' }],
    },
    {
      code: 'class Foo { bar: number; }',
      options: [{ properties: 'always' }],
    },
    {
      code: 'class Foo { b_ar: number = 0; }',
      options: [{ properties: 'never' }],
    },
    {
      code: 'class Foo { bar: number = 0; }',
      options: [{ properties: 'always' }],
    },
    {
      code: 'class Foo { constructor(private b_ar: number) {} }',
      options: [{ properties: 'never' }],
    },
    {
      code: 'class Foo { constructor(private bar: number) {} }',
      options: [{ properties: 'always' }],
    },
    {
      code: 'class Foo { constructor(private b_ar: number = 0) {} }',
      options: [{ properties: 'never' }],
    },
    {
      code: 'class Foo { constructor(private bar: number = 0) {} }',
      options: [{ properties: 'always' }],
    },
    {
      code: 'abstract class Foo { b_ar: number; }',
      options: [{ properties: 'never' }],
    },
    {
      code: 'abstract class Foo { bar: number; }',
      options: [{ properties: 'always' }],
    },
    {
      code: 'abstract class Foo { b_ar: number = 0; }',
      options: [{ properties: 'never' }],
    },
    {
      code: 'abstract class Foo { bar: number = 0; }',
      options: [{ properties: 'always' }],
    },
    {
      code: 'abstract class Foo { abstract b_ar: number; }',
      options: [{ properties: 'never' }],
    },
    {
      code: 'abstract class Foo { abstract bar: number; }',
      options: [{ properties: 'always' }],
    },
    {
      code: 'abstract class Foo { abstract b_ar: number = 0; }',
      options: [{ properties: 'never' }],
    },
    {
      code: 'abstract class Foo { abstract bar: number = 0; }',
      options: [{ properties: 'always' }],
    },
  ],

  invalid: [
    {
      code: 'interface Foo { b_ar: number }',
      options: [{ properties: 'always' }],
      errors: [
        {
          messageId: 'notCamelCase',
          data: {
            name: 'b_ar',
          },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: 'class Foo { b_ar: number; }',
      options: [{ properties: 'always' }],
      errors: [
        {
          messageId: 'notCamelCase',
          data: {
            name: 'b_ar',
          },
          line: 1,
          column: 13,
        },
      ],
    },
    {
      code: 'class Foo { constructor(private b_ar: number) {} }',
      options: [{ properties: 'always' }],
      errors: [
        {
          messageId: 'notCamelCase',
          data: {
            name: 'b_ar',
          },
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'class Foo { constructor(private b_ar: number = 0) {} }',
      options: [{ properties: 'always' }],
      errors: [
        {
          messageId: 'notCamelCase',
          data: {
            name: 'b_ar',
          },
          line: 1,
          column: 33,
        },
      ],
    },
    {
      code: 'abstract class Foo { b_ar: number; }',
      options: [{ properties: 'always' }],
      errors: [
        {
          messageId: 'notCamelCase',
          data: {
            name: 'b_ar',
          },
          line: 1,
          column: 22,
        },
      ],
    },
    {
      code: 'abstract class Foo { b_ar: number = 0; }',
      options: [{ properties: 'always' }],
      errors: [
        {
          messageId: 'notCamelCase',
          data: {
            name: 'b_ar',
          },
          line: 1,
          column: 22,
        },
      ],
    },
    {
      code: 'abstract class Foo { abstract b_ar: number; }',
      options: [{ properties: 'always' }],
      errors: [
        {
          messageId: 'notCamelCase',
          data: {
            name: 'b_ar',
          },
          line: 1,
          column: 31,
        },
      ],
    },
    {
      code: 'abstract class Foo { abstract b_ar: number = 0; }',
      options: [{ properties: 'always' }],
      errors: [
        {
          messageId: 'notCamelCase',
          data: {
            name: 'b_ar',
          },
          line: 1,
          column: 31,
        },
      ],
    },
  ],
});
