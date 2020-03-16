import rule from '../../src/rules/ban-types';
import { RuleTester } from '../RuleTester';
import { InferOptionsTypeFromRule } from '../../src/util';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const options: InferOptionsTypeFromRule<typeof rule> = [
  {
    types: {
      String: {
        message: 'Use string instead.',
        fixWith: 'string',
      },
      Object: "Use '{}' instead.",
      Array: null,
      F: null,
      'NS.Bad': {
        message: 'Use NS.Good instead.',
        fixWith: 'NS.Good',
      },
    },
  },
];

const options2: InferOptionsTypeFromRule<typeof rule> = [
  {
    types: {
      null: {
        message: 'Use undefined instead.',
        fixWith: 'undefined',
      },
    },
  },
];

const options3: InferOptionsTypeFromRule<typeof rule> = [
  {
    types: {
      undefined: null,
    },
  },
];

ruleTester.run('ban-types', rule, {
  valid: [
    'let f = Object();', // Should not fail if there is no options set
    'let f: {} = {};',
    'let f: { x: number, y: number } = { x: 1, y: 1 };',
    {
      code: 'let f = Object();',
      options,
    },
    {
      code: 'let g = Object.create(null);',
      options,
    },
    {
      code: 'let h = String(false);',
      options,
    },
    {
      code: 'let e: foo.String;',
      options,
    },
    {
      code: 'let a: _.NS.Bad',
      options,
    },
    {
      code: 'let a: NS.Bad._',
      options,
    },
    // Replace default options instead of merging with extendDefaults: false
    {
      code: 'let a: String;',
      options: [
        {
          types: {
            Number: {
              message: 'Use number instead.',
              fixWith: 'number',
            },
          },
          extendDefaults: false,
        },
      ],
    },
    {
      code: 'let a: undefined',
      options: options2,
    },
    {
      code: 'let a: null',
      options: options3,
    },
  ],
  invalid: [
    {
      code: 'let a: String;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: 'let a: Object;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Object',
            customMessage: " Use '{}' instead.",
          },
          line: 1,
          column: 8,
        },
      ],
      options,
    },
    {
      code: 'let a: undefined;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: { name: 'undefined', customMessage: '' },
          line: 1,
          column: 8,
        },
      ],
      options: options3,
    },
    {
      code: 'let a: null;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: { name: 'null', customMessage: ' Use undefined instead.' },
          line: 1,
          column: 8,
        },
      ],
      options: options2,
    },
    {
      code: 'let aa: Foo;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Foo',
            customMessage: '',
          },
        },
      ],
      options: [
        {
          types: {
            Foo: { message: '' },
          },
        },
      ],
    },
    {
      code: 'let b: {c: String};',
      output: 'let b: {c: string};',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            name: 'String',
            customMessage: ' Use string instead.',
          },
          line: 1,
          column: 12,
        },
      ],
      options,
    },
    {
      code: 'function foo(a: String) {}',
      output: 'function foo(a: string) {}',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            name: 'String',
            customMessage: ' Use string instead.',
          },
          line: 1,
          column: 17,
        },
      ],
      options,
    },
    {
      code: "'a' as String;",
      output: "'a' as string;",
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            name: 'String',
            customMessage: ' Use string instead.',
          },
          line: 1,
          column: 8,
        },
      ],
      options,
    },
    {
      code: 'let c: F;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: { name: 'F', customMessage: '' },
          line: 1,
          column: 8,
        },
      ],
      options,
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
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            name: 'String',
            customMessage: ' Use string instead.',
          },
          line: 2,
          column: 15,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            name: 'String',
            customMessage: ' Use string instead.',
          },
          line: 2,
          column: 35,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Object',
            customMessage: " Use '{}' instead.",
          },
          line: 2,
          column: 58,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            name: 'String',
            customMessage: ' Use string instead.',
          },
          line: 3,
          column: 21,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Object',
            customMessage: " Use '{}' instead.",
          },
          line: 3,
          column: 30,
        },
        {
          messageId: 'bannedTypeMessage',
          data: { name: 'Array', customMessage: '' },
          line: 5,
          column: 12,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            name: 'String',
            customMessage: ' Use string instead.',
          },
          line: 5,
          column: 18,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            name: 'String',
            customMessage: ' Use string instead.',
          },
          line: 6,
          column: 16,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            name: 'String',
            customMessage: ' Use string instead.',
          },
          line: 6,
          column: 30,
        },
      ],
      options,
    },
    {
      code: 'let a: NS.Bad;',
      output: 'let a: NS.Good;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'NS.Bad',
            customMessage: ' Use NS.Good instead.',
          },
          line: 1,
          column: 8,
        },
      ],
      options,
    },
    {
      code: `
let a: NS.Bad<Foo>;
let b: Foo<NS.Bad>;
      `,
      output: `
let a: NS.Good<Foo>;
let b: Foo<NS.Good>;
      `,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'NS.Bad',
            customMessage: ' Use NS.Good instead.',
          },
          line: 2,
          column: 8,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'NS.Bad',
            customMessage: ' Use NS.Good instead.',
          },
          line: 3,
          column: 12,
        },
      ],
      options,
    },
    {
      code: `let foo: {} = {};`,
      output: `let foo: object = {};`,
      options: [
        {
          types: {
            '{}': {
              message: 'Use object instead.',
              fixWith: 'object',
            },
          },
        },
      ],
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: '{}',
            customMessage: ' Use object instead.',
          },
          line: 1,
          column: 10,
        },
      ],
    },
    {
      code: `
let foo: {} = {};
let bar: {     } = {};
      `,
      output: `
let foo: object = {};
let bar: object = {};
      `,
      options: [
        {
          types: {
            '{   }': {
              message: 'Use object instead.',
              fixWith: 'object',
            },
          },
        },
      ],
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: '{}',
            customMessage: ' Use object instead.',
          },
          line: 2,
          column: 10,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: '{}',
            customMessage: ' Use object instead.',
          },
          line: 3,
          column: 10,
        },
      ],
    },
    {
      code: 'let a: NS.Bad;',
      output: 'let a: NS.Good;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'NS.Bad',
            customMessage: ' Use NS.Good instead.',
          },
          line: 1,
          column: 8,
        },
      ],
      options: [
        {
          types: {
            '  NS.Bad  ': {
              message: 'Use NS.Good instead.',
              fixWith: 'NS.Good',
            },
          },
        },
      ],
    },
    {
      code: 'let a: Foo<   F   >;',
      output: 'let a: Foo<   T   >;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'F',
            customMessage: ' Use T instead.',
          },
          line: 1,
          column: 15,
        },
      ],
      options: [
        {
          types: {
            '       F      ': {
              message: 'Use T instead.',
              fixWith: 'T',
            },
          },
        },
      ],
    },
  ],
});
