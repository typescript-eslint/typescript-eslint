import rule from '../../src/rules/prefer-labeled-tuple';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-labeled-tuple', rule, {
  valid: [
    'type Foo = [];',
    'type Foo = [bar: string, baz: string];',
    'function foo(...arg: [bar: string, baz: string]) {}',
  ],
  invalid: [
    {
      code: 'type Foo = [string, string];',
      errors: [
        {
          messageId: 'missingLabel',
        },
      ],
    },
    {
      code: 'function foo(...arg: [string, string]) {}',
      errors: [
        {
          messageId: 'missingLabel',
        },
      ],
    },
  ],
});
