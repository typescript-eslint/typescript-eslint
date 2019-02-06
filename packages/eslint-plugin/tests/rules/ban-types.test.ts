/**
 * @fileoverview Enforces that types will not to be used
 * @author Armano <https://github.com/armano2>
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import rule from '../../src/rules/ban-types';
import RuleTester from '../RuleTester';
import { InferOptionsTypeFromRule } from '../../src/util';

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser'
});

const options: InferOptionsTypeFromRule<typeof rule> = [
  {
    types: {
      String: {
        message: 'Use string instead.',
        fixWith: 'string'
      },
      Object: "Use '{}' instead.",
      Array: null,
      F: null
    }
  }
];

ruleTester.run('ban-types', rule, {
  valid: [
    'let f = Object();', // Should not fail if there is no options set
    {
      code: 'let f = Object();',
      options
    },
    {
      code: 'let g = Object.create(null);',
      options
    },
    {
      code: 'let h = String(false);',
      options
    },
    {
      code: 'let e: foo.String;',
      options
    }
  ],
  invalid: [
    {
      code: 'let a: Object;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Object',
            customMessage: " Use '{}' instead."
          },
          line: 1,
          column: 8
        }
      ],
      options
    },
    {
      code: 'let b: {c: String};',
      output: 'let b: {c: string};',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'String',
            customMessage: ' Use string instead.'
          },
          line: 1,
          column: 12
        }
      ],
      options
    },
    {
      code: 'function foo(a: String) {}',
      output: 'function foo(a: string) {}',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'String',
            customMessage: ' Use string instead.'
          },
          line: 1,
          column: 17
        }
      ],
      options
    },
    {
      code: "'a' as String;",
      output: "'a' as string;",
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'String',
            customMessage: ' Use string instead.'
          },
          line: 1,
          column: 8
        }
      ],
      options
    },
    {
      code: 'let c: F;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: { name: 'F', customMessage: '' },
          line: 1,
          column: 8
        }
      ],
      options
    },
    {
      code: `
class Foo<F = String> extends Bar<String> implements Baz<Object> {
  constructor (foo: String | Object) {}

  exit() : Array<String> {
    const foo: String = 1 as String
  }
}
            `,
      output: `
class Foo<F = string> extends Bar<string> implements Baz<Object> {
  constructor (foo: string | Object) {}

  exit() : Array<string> {
    const foo: string = 1 as string
  }
}
            `,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'String',
            customMessage: ' Use string instead.'
          },
          line: 2,
          column: 15
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'String',
            customMessage: ' Use string instead.'
          },
          line: 2,
          column: 35
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Object',
            customMessage: " Use '{}' instead."
          },
          line: 2,
          column: 58
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'String',
            customMessage: ' Use string instead.'
          },
          line: 3,
          column: 21
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Object',
            customMessage: " Use '{}' instead."
          },
          line: 3,
          column: 30
        },
        {
          messageId: 'bannedTypeMessage',
          data: { name: 'Array', customMessage: '' },
          line: 5,
          column: 12
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'String',
            customMessage: ' Use string instead.'
          },
          line: 5,
          column: 18
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'String',
            customMessage: ' Use string instead.'
          },
          line: 6,
          column: 16
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'String',
            customMessage: ' Use string instead.'
          },
          line: 6,
          column: 30
        }
      ],
      options
    }
  ]
});
