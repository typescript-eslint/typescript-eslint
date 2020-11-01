import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule, {
  MessageIds,
  Options,
  TYPE_KEYWORDS,
} from '../../src/rules/ban-types';
import { objectReduceKey } from '../../src/util';
import { RuleTester, noFormat } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const options: Options = [
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
    extendDefaults: false,
  },
];

ruleTester.run('ban-types', rule, {
  valid: [
    'let f = Object();', // Should not fail if there is no options set
    'let f: { x: number; y: number } = { x: 1, y: 1 };',
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
      code: 'let a: _.NS.Bad;',
      options,
    },
    {
      code: 'let a: NS.Bad._;',
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
      code: 'let a: undefined;',
      options: [
        {
          types: {
            null: {
              message: 'Use undefined instead.',
              fixWith: 'undefined',
            },
          },
        },
      ],
    },
    {
      code: 'let a: null;',
      options: [
        {
          types: {
            undefined: null,
          },
          extendDefaults: false,
        },
      ],
    },
    {
      code: 'type Props = {};',
      options: [
        {
          types: {
            '{}': false,
          },
          extendDefaults: true,
        },
      ],
    },
    'let a: [];',
  ],
  invalid: [
    {
      code: 'let a: String;',
      output: 'let a: string;',
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
      code: 'let b: { c: String };',
      output: 'let b: { c: string };',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            name: 'String',
            customMessage: ' Use string instead.',
          },
          line: 1,
          column: 13,
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
  constructor(foo: String | Object) {}

  exit(): Array<String> {
    const foo: String = 1 as String;
  }
}
      `,
      output: `
class Foo<F = string> extends Bar<string> implements Baz<Object> {
  constructor(foo: string | Object) {}

  exit(): Array<string> {
    const foo: string = 1 as string;
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
          column: 20,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Object',
            customMessage: " Use '{}' instead.",
          },
          line: 3,
          column: 29,
        },
        {
          messageId: 'bannedTypeMessage',
          data: { name: 'Array', customMessage: '' },
          line: 5,
          column: 11,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
            name: 'String',
            customMessage: ' Use string instead.',
          },
          line: 5,
          column: 17,
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
      code: 'let foo: {} = {};',
      output: 'let foo: object = {};',
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
      code: noFormat`
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
      code: noFormat`let a: Foo<   F   >;`,
      output: noFormat`let a: Foo<   T   >;`,
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
    {
      code: 'type Foo = Bar<any>;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Bar<any>',
            customMessage: " Don't use `any` as a type parameter to `Bar`",
          },
          line: 1,
          column: 12,
        },
      ],
      options: [
        {
          types: {
            'Bar<any>': "Don't use `any` as a type parameter to `Bar`",
          },
        },
      ],
    },
    {
      code: noFormat`type Foo = Bar<A,B>;`,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Bar<A,B>',
            customMessage: " Don't pass `A, B` as parameters to `Bar`",
          },
          line: 1,
          column: 12,
        },
      ],
      options: [
        {
          types: {
            'Bar<A, B>': "Don't pass `A, B` as parameters to `Bar`",
          },
        },
      ],
    },
    {
      code: 'let a: [];',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: '[]',
            customMessage: ' `[]` does only allow empty arrays.',
          },
          line: 1,
          column: 8,
        },
      ],
      options: [
        {
          types: {
            '[]': '`[]` does only allow empty arrays.',
          },
        },
      ],
    },
    {
      code: noFormat`let a:  [ ] ;`,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: '[]',
            customMessage: ' `[]` does only allow empty arrays.',
          },
          line: 1,
          column: 9,
        },
      ],
      options: [
        {
          types: {
            '[]': '`[]` does only allow empty arrays.',
          },
        },
      ],
    },
    {
      code: 'let a: [];',
      output: 'let a: any[];',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: '[]',
            customMessage: ' `[]` does only allow empty arrays.',
          },
          line: 1,
          column: 8,
        },
      ],
      options: [
        {
          types: {
            '[]': {
              message: '`[]` does only allow empty arrays.',
              fixWith: 'any[]',
            },
          },
        },
      ],
    },
    {
      code: 'let a: [[]];',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: '[]',
            customMessage: ' `[]` does only allow empty arrays.',
          },
          line: 1,
          column: 9,
        },
      ],
      options: [
        {
          types: {
            '[]': '`[]` does only allow empty arrays.',
          },
        },
      ],
    },
    ...objectReduceKey(
      TYPE_KEYWORDS,
      (acc: TSESLint.InvalidTestCase<MessageIds, Options>[], key) => {
        acc.push({
          code: `function foo(x: ${key}) {}`,
          errors: [
            {
              messageId: 'bannedTypeMessage',
              data: {
                name: key,
                customMessage: '',
              },
              line: 1,
              column: 17,
            },
          ],
          options: [
            {
              extendDefaults: false,
              types: {
                [key]: null,
              },
            },
          ],
        });
        return acc;
      },
      [],
    ),
  ],
});
