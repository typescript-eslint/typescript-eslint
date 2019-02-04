/**
 * @fileoverview Disallows the declaration of empty interfaces.
 * @author Patricio Trevino
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule from '../../src/rules/no-empty-interface';
import RuleTester from '../RuleTester';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser'
});

ruleTester.run('no-empty-interface', rule, {
  valid: [
    `
interface Foo {
    name: string;
}
        `,
    `
interface Foo {
    name: string;
}

interface Bar {
    age: number;
}

// valid because extending multiple interfaces can be used instead of a union type
interface Baz extends Foo, Bar {}
        `
  ],
  invalid: [
    {
      code: 'interface Foo {}',
      errors: [
        {
          messageId: 'noEmpty',
          line: 1,
          column: 11
        }
      ]
    },
    {
      code: 'interface Foo extends {}',
      errors: [
        {
          messageId: 'noEmpty',
          line: 1,
          column: 11
        }
      ]
    },
    {
      code: `
interface Foo {
    name: string;
}

interface Bar extends Foo {}
            `,
      errors: [
        {
          messageId: 'noEmptyWithSuper',
          line: 6,
          column: 11
        }
      ]
    }
  ]
});
