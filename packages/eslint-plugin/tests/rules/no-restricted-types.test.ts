import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-restricted-types';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-restricted-types', rule, {
  valid: [
    'let f = Object();',
    'let f: { x: number; y: number } = { x: 1, y: 1 };',
    {
      code: 'let f = Object();',
      options: [{ types: { Object: true } }],
    },
    {
      code: 'let f = Object(false);',
      options: [{ types: { Object: true } }],
    },
    {
      code: 'let g = Object.create(null);',
      options: [{ types: { Object: true } }],
    },
    {
      code: 'let e: namespace.Object;',
      options: [{ types: { Object: true } }],
    },
    {
      code: 'let value: _.NS.Banned;',
      options: [{ types: { 'NS.Banned': true } }],
    },
    {
      code: 'let value: NS.Banned._;',
      options: [{ types: { 'NS.Banned': true } }],
    },
  ],
  invalid: [
    {
      code: 'let value: bigint;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use Ok instead.',
            name: 'bigint',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { bigint: 'Use Ok instead.' } }],
    },
    {
      code: 'let value: boolean;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use Ok instead.',
            name: 'boolean',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { boolean: 'Use Ok instead.' } }],
    },
    {
      code: 'let value: never;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use Ok instead.',
            name: 'never',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { never: 'Use Ok instead.' } }],
    },
    {
      code: 'let value: null;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use Ok instead.',
            name: 'null',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { null: 'Use Ok instead.' } }],
    },
    {
      code: 'let value: number;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use Ok instead.',
            name: 'number',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { number: 'Use Ok instead.' } }],
    },
    {
      code: 'let value: object;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use Ok instead.',
            name: 'object',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { object: 'Use Ok instead.' } }],
    },
    {
      code: 'let value: string;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use Ok instead.',
            name: 'string',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { string: 'Use Ok instead.' } }],
    },
    {
      code: 'let value: symbol;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use Ok instead.',
            name: 'symbol',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { symbol: 'Use Ok instead.' } }],
    },
    {
      code: 'let value: undefined;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use Ok instead.',
            name: 'undefined',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { undefined: 'Use Ok instead.' } }],
    },
    {
      code: 'let value: unknown;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use Ok instead.',
            name: 'unknown',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { unknown: 'Use Ok instead.' } }],
    },
    {
      code: 'let value: void;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use Ok instead.',
            name: 'void',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { void: 'Use Ok instead.' } }],
    },
    {
      code: 'let value: [];',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use unknown[] instead.',
            name: '[]',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { '[]': 'Use unknown[] instead.' } }],
    },
    {
      code: noFormat`let value: [  ];`,
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use unknown[] instead.',
            name: '[]',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { '[]': 'Use unknown[] instead.' } }],
    },
    {
      code: 'let value: [[]];',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: ' Use unknown[] instead.',
            name: '[]',
          },
          line: 1,
          column: 13,
        },
      ],
      options: [{ types: { '[]': 'Use unknown[] instead.' } }],
    },
    {
      code: 'let value: Banned;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: '',
            name: 'Banned',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { Banned: true } }],
    },
    {
      code: 'let value: Banned;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: " Use '{}' instead.",
            name: 'Banned',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { Banned: "Use '{}' instead." } }],
    },
    {
      code: 'let value: Banned[];',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: " Use '{}' instead.",
            name: 'Banned',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { Banned: "Use '{}' instead." } }],
    },
    {
      code: 'let value: [Banned];',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: " Use '{}' instead.",
            name: 'Banned',
          },
          line: 1,
          column: 13,
        },
      ],
      options: [{ types: { Banned: "Use '{}' instead." } }],
    },
    {
      code: 'let value: Banned;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            customMessage: '',
            name: 'Banned',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [{ types: { Banned: '' } }],
    },
    {
      code: 'let b: { c: Banned };',
      output: 'let b: { c: Ok };',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Banned',
            customMessage: ' Use Ok instead.',
          },
          line: 1,
          column: 13,
        },
      ],
      options: [
        { types: { Banned: { message: 'Use Ok instead.', fixWith: 'Ok' } } },
      ],
    },
    {
      code: '1 as Banned;',
      output: '1 as Ok;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Banned',
            customMessage: ' Use Ok instead.',
          },
          line: 1,
          column: 6,
        },
      ],
      options: [
        { types: { Banned: { message: 'Use Ok instead.', fixWith: 'Ok' } } },
      ],
    },
    {
      code: 'class Derived implements Banned {}',
      output: 'class Derived implements Ok {}',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Banned',
            customMessage: ' Use Ok instead.',
          },
          line: 1,
          column: 26,
        },
      ],
      options: [
        { types: { Banned: { message: 'Use Ok instead.', fixWith: 'Ok' } } },
      ],
    },
    {
      code: 'class Derived implements Banned1, Banned2 {}',
      output: 'class Derived implements Ok1, Ok2 {}',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Banned1',
            customMessage: ' Use Ok1 instead.',
          },
          line: 1,
          column: 26,
        },
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Banned2',
            customMessage: ' Use Ok2 instead.',
          },
          line: 1,
          column: 35,
        },
      ],
      options: [
        {
          types: {
            Banned1: { message: 'Use Ok1 instead.', fixWith: 'Ok1' },
            Banned2: { message: 'Use Ok2 instead.', fixWith: 'Ok2' },
          },
        },
      ],
    },
    {
      code: 'interface Derived extends Banned {}',
      output: 'interface Derived extends Ok {}',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Banned',
            customMessage: ' Use Ok instead.',
          },
          line: 1,
          column: 27,
        },
      ],
      options: [
        { types: { Banned: { message: 'Use Ok instead.', fixWith: 'Ok' } } },
      ],
    },
    {
      code: 'type Intersection = Banned & {};',
      output: 'type Intersection = Ok & {};',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Banned',
            customMessage: ' Use Ok instead.',
          },
          line: 1,
          column: 21,
        },
      ],
      options: [
        { types: { Banned: { message: 'Use Ok instead.', fixWith: 'Ok' } } },
      ],
    },
    {
      code: 'type Union = Banned | {};',
      output: 'type Union = Ok | {};',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Banned',
            customMessage: ' Use Ok instead.',
          },
          line: 1,
          column: 14,
        },
      ],
      options: [
        { types: { Banned: { message: 'Use Ok instead.', fixWith: 'Ok' } } },
      ],
    },
    {
      code: 'let value: NS.Banned;',
      output: 'let value: NS.Ok;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'NS.Banned',
            customMessage: ' Use NS.Ok instead.',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [
        {
          types: {
            'NS.Banned': {
              message: 'Use NS.Ok instead.',
              fixWith: 'NS.Ok',
            },
          },
        },
      ],
    },
    {
      code: 'let value: {} = {};',
      output: 'let value: object = {};',
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
          column: 12,
        },
      ],
    },
    {
      code: 'let value: NS.Banned;',
      output: 'let value: NS.Ok;',
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'NS.Banned',
            customMessage: ' Use NS.Ok instead.',
          },
          line: 1,
          column: 12,
        },
      ],
      options: [
        {
          types: {
            '  NS.Banned  ': {
              message: 'Use NS.Ok instead.',
              fixWith: 'NS.Ok',
            },
          },
        },
      ],
    },
    {
      code: noFormat`let value: Type<   Banned   >;`,
      output: `let value: Type<   Ok   >;`,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Banned',
            customMessage: ' Use Ok instead.',
          },
          line: 1,
          column: 20,
        },
      ],
      options: [
        {
          types: {
            '       Banned      ': {
              message: 'Use Ok instead.',
              fixWith: 'Ok',
            },
          },
        },
      ],
    },
    {
      code: 'type Intersection = Banned<any>;',
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Banned<any>',
            customMessage: " Don't use `any` as a type parameter to `Banned`",
          },
          line: 1,
          column: 21,
        },
      ],
      options: [
        {
          types: {
            'Banned<any>': "Don't use `any` as a type parameter to `Banned`",
          },
        },
      ],
    },
    {
      code: noFormat`type Intersection = Banned<A,B>;`,
      output: null,
      errors: [
        {
          messageId: 'bannedTypeMessage',
          data: {
            name: 'Banned<A,B>',
            customMessage: " Don't pass `A, B` as parameters to `Banned`",
          },
          line: 1,
          column: 21,
        },
      ],
      options: [
        {
          types: {
            'Banned<A, B>': "Don't pass `A, B` as parameters to `Banned`",
          },
        },
      ],
    },
  ],
});
