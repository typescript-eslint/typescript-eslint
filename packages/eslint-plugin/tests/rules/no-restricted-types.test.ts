import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-restricted-types';

const ruleTester = new RuleTester();

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
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'bigint',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { bigint: 'Use Ok instead.' } }],
      output: null,
    },
    {
      code: 'let value: boolean;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'boolean',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { boolean: 'Use Ok instead.' } }],
      output: null,
    },
    {
      code: 'let value: never;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'never',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { never: 'Use Ok instead.' } }],
      output: null,
    },
    {
      code: 'let value: null;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'null',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { null: 'Use Ok instead.' } }],
      output: null,
    },
    {
      code: 'let value: number;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'number',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { number: 'Use Ok instead.' } }],
      output: null,
    },
    {
      code: 'let value: object;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'object',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { object: 'Use Ok instead.' } }],
      output: null,
    },
    {
      code: 'let value: string;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'string',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { string: 'Use Ok instead.' } }],
      output: null,
    },
    {
      code: 'let value: symbol;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'symbol',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { symbol: 'Use Ok instead.' } }],
      output: null,
    },
    {
      code: 'let value: undefined;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'undefined',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { undefined: 'Use Ok instead.' } }],
      output: null,
    },
    {
      code: 'let value: unknown;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'unknown',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { unknown: 'Use Ok instead.' } }],
      output: null,
    },
    {
      code: 'let value: void;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'void',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { void: 'Use Ok instead.' } }],
      output: null,
    },
    {
      code: 'let value: [];',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use unknown[] instead.',
            name: '[]',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { '[]': 'Use unknown[] instead.' } }],
      output: null,
    },
    {
      code: noFormat`let value: [  ];`,
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use unknown[] instead.',
            name: '[]',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { '[]': 'Use unknown[] instead.' } }],
      output: null,
    },
    {
      code: 'let value: [[]];',
      errors: [
        {
          column: 13,
          data: {
            customMessage: ' Use unknown[] instead.',
            name: '[]',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { '[]': 'Use unknown[] instead.' } }],
      output: null,
    },
    {
      code: 'let value: Banned;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: '',
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { Banned: true } }],
      output: null,
    },
    {
      code: 'let value: Banned;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: " Use '{}' instead.",
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { Banned: "Use '{}' instead." } }],
      output: null,
    },
    {
      code: 'let value: Banned[];',
      errors: [
        {
          column: 12,
          data: {
            customMessage: " Use '{}' instead.",
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { Banned: "Use '{}' instead." } }],
      output: null,
    },
    {
      code: 'let value: [Banned];',
      errors: [
        {
          column: 13,
          data: {
            customMessage: " Use '{}' instead.",
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { Banned: "Use '{}' instead." } }],
      output: null,
    },
    {
      code: 'let value: Banned;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: '',
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [{ types: { Banned: '' } }],
      output: null,
    },
    {
      code: 'let b: { c: Banned };',
      errors: [
        {
          column: 13,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        { types: { Banned: { fixWith: 'Ok', message: 'Use Ok instead.' } } },
      ],
      output: 'let b: { c: Ok };',
    },
    {
      code: '1 as Banned;',
      errors: [
        {
          column: 6,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        { types: { Banned: { fixWith: 'Ok', message: 'Use Ok instead.' } } },
      ],
      output: '1 as Ok;',
    },
    {
      code: 'class Derived implements Banned {}',
      errors: [
        {
          column: 26,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        { types: { Banned: { fixWith: 'Ok', message: 'Use Ok instead.' } } },
      ],
      output: 'class Derived implements Ok {}',
    },
    {
      code: 'class Derived implements Banned1, Banned2 {}',
      errors: [
        {
          column: 26,
          data: {
            customMessage: ' Use Ok1 instead.',
            name: 'Banned1',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
        {
          column: 35,
          data: {
            customMessage: ' Use Ok2 instead.',
            name: 'Banned2',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        {
          types: {
            Banned1: { fixWith: 'Ok1', message: 'Use Ok1 instead.' },
            Banned2: { fixWith: 'Ok2', message: 'Use Ok2 instead.' },
          },
        },
      ],
      output: 'class Derived implements Ok1, Ok2 {}',
    },
    {
      code: 'interface Derived extends Banned {}',
      errors: [
        {
          column: 27,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        { types: { Banned: { fixWith: 'Ok', message: 'Use Ok instead.' } } },
      ],
      output: 'interface Derived extends Ok {}',
    },
    {
      code: 'type Intersection = Banned & {};',
      errors: [
        {
          column: 21,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        { types: { Banned: { fixWith: 'Ok', message: 'Use Ok instead.' } } },
      ],
      output: 'type Intersection = Ok & {};',
    },
    {
      code: 'type Union = Banned | {};',
      errors: [
        {
          column: 14,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        { types: { Banned: { fixWith: 'Ok', message: 'Use Ok instead.' } } },
      ],
      output: 'type Union = Ok | {};',
    },
    {
      code: 'let value: NS.Banned;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use NS.Ok instead.',
            name: 'NS.Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        {
          types: {
            'NS.Banned': {
              fixWith: 'NS.Ok',
              message: 'Use NS.Ok instead.',
            },
          },
        },
      ],
      output: 'let value: NS.Ok;',
    },
    {
      code: 'let value: {} = {};',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use object instead.',
            name: '{}',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        {
          types: {
            '{}': {
              fixWith: 'object',
              message: 'Use object instead.',
            },
          },
        },
      ],
      output: 'let value: object = {};',
    },
    {
      code: 'let value: NS.Banned;',
      errors: [
        {
          column: 12,
          data: {
            customMessage: ' Use NS.Ok instead.',
            name: 'NS.Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        {
          types: {
            '  NS.Banned  ': {
              fixWith: 'NS.Ok',
              message: 'Use NS.Ok instead.',
            },
          },
        },
      ],
      output: 'let value: NS.Ok;',
    },
    {
      code: noFormat`let value: Type<   Banned   >;`,
      errors: [
        {
          column: 20,
          data: {
            customMessage: ' Use Ok instead.',
            name: 'Banned',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        {
          types: {
            '       Banned      ': {
              fixWith: 'Ok',
              message: 'Use Ok instead.',
            },
          },
        },
      ],
      output: `let value: Type<   Ok   >;`,
    },
    {
      code: 'type Intersection = Banned<any>;',
      errors: [
        {
          column: 21,
          data: {
            customMessage: " Don't use `any` as a type parameter to `Banned`",
            name: 'Banned<any>',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        {
          types: {
            'Banned<any>': "Don't use `any` as a type parameter to `Banned`",
          },
        },
      ],
      output: null,
    },
    {
      code: noFormat`type Intersection = Banned<A,B>;`,
      errors: [
        {
          column: 21,
          data: {
            customMessage: " Don't pass `A, B` as parameters to `Banned`",
            name: 'Banned<A,B>',
          },
          line: 1,
          messageId: 'bannedTypeMessage',
        },
      ],
      options: [
        {
          types: {
            'Banned<A, B>': "Don't pass `A, B` as parameters to `Banned`",
          },
        },
      ],
      output: null,
    },
  ],
});
