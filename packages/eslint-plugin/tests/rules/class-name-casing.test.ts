import rule from '../../src/rules/class-name-casing';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('class-name-casing', rule, {
  valid: [
    'class ValidClassName {}',
    {
      code: 'export default class {}',
      parserOptions: {
        sourceType: 'module',
      },
    },
    'var Foo = class {};',
    'interface SomeInterface {}',
    'class ClassNameWithDigit2 {}',
    'abstract class ClassNameWithDigit2 {}',
    'var ba_zz = class Foo {};',
  ],

  invalid: [
    {
      code: 'class invalidClassName {}',
      errors: [
        {
          messageId: 'notPascalCased',
          data: {
            friendlyName: 'Class',
            name: 'invalidClassName',
          },
          line: 1,
          column: 7,
        },
      ],
    },
    {
      code: 'class Another_Invalid_Class_Name {}',
      errors: [
        {
          messageId: 'notPascalCased',
          data: {
            friendlyName: 'Class',
            name: 'Another_Invalid_Class_Name',
          },
          line: 1,
          column: 7,
        },
      ],
    },
    {
      code: 'var foo = class {};',
      errors: [
        {
          messageId: 'notPascalCased',
          data: {
            friendlyName: 'Class',
            name: 'foo',
          },
          line: 1,
          column: 5,
        },
      ],
    },
    {
      code: 'const foo = class {};',
      errors: [
        {
          messageId: 'notPascalCased',
          data: {
            friendlyName: 'Class',
            name: 'foo',
          },
          line: 1,
          column: 7,
        },
      ],
    },
    {
      code: 'var bar = class invalidName {}',
      errors: [
        {
          messageId: 'notPascalCased',
          data: {
            friendlyName: 'Class',
            name: 'invalidName',
          },
          line: 1,
          column: 17,
        },
      ],
    },
    {
      code: 'interface someInterface {}',
      errors: [
        {
          messageId: 'notPascalCased',
          data: {
            friendlyName: 'Interface',
            name: 'someInterface',
          },
          line: 1,
          column: 11,
        },
      ],
    },
    {
      code: 'abstract class invalidClassName {}',
      errors: [
        {
          messageId: 'notPascalCased',
          data: {
            friendlyName: 'Abstract class',
            name: 'invalidClassName',
          },
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'declare class invalidClassName {}',
      errors: [
        {
          messageId: 'notPascalCased',
          data: {
            friendlyName: 'Class',
            name: 'invalidClassName',
          },
          line: 1,
          column: 15,
        },
      ],
    },
  ],
});
