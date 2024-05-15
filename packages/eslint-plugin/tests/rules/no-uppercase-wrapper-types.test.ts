import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-uppercase-wrapper-types';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-uppercase-wrapper-types', rule, {
  valid: [
    'let value: NumberLike;',
    'let value: Other;',
    'let value: bigint;',
    'let value: boolean;',
    'let value: never;',
    'let value: null;',
    'let value: number;',
    'let value: symbol;',
    'let value: undefined;',
    'let value: unknown;',
    'let value: void;',
    'let value: () => void;',
    'let value: () => () => void;',
    'let Bigint;',
    'let Boolean;',
    'let Never;',
    'let Null;',
    'let Number;',
    'let Symbol;',
    'let Undefined;',
    'let Unknown;',
    'let Void;',
    'interface Bigint {}',
    'interface Boolean {}',
    'interface Never {}',
    'interface Null {}',
    'interface Number {}',
    'interface Symbol {}',
    'interface Undefined {}',
    'interface Unknown {}',
    'interface Void {}',
    'type Bigint = {};',
    'type Boolean = {};',
    'type Never = {};',
    'type Null = {};',
    'type Number = {};',
    'type Symbol = {};',
    'type Undefined = {};',
    'type Unknown = {};',
    'type Void = {};',
    'class MyClass extends Number {}',
  ],
  invalid: [
    {
      code: 'let value: BigInt;',
      output: 'let value: bigint;',
      errors: [
        {
          data: { typeName: 'BigInt', preferred: 'bigint' },
          messageId: 'bannedClassType',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'let value: Boolean;',
      output: 'let value: boolean;',
      errors: [
        {
          data: { typeName: 'Boolean', preferred: 'boolean' },
          messageId: 'bannedClassType',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'let value: Number;',
      output: 'let value: number;',
      errors: [
        {
          data: { typeName: 'Number', preferred: 'number' },
          messageId: 'bannedClassType',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'let value: Object;',
      output: 'let value: object;',
      errors: [
        {
          data: { typeName: 'Object', preferred: 'object' },
          messageId: 'bannedClassType',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'let value: String;',
      output: 'let value: string;',
      errors: [
        {
          data: { typeName: 'String', preferred: 'string' },
          messageId: 'bannedClassType',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'let value: Symbol;',
      output: 'let value: symbol;',
      errors: [
        {
          data: { typeName: 'Symbol', preferred: 'symbol' },
          messageId: 'bannedClassType',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'let value: Function;',
      output: null,
      errors: [
        {
          messageId: 'bannedFunctionType',
          line: 1,
          column: 12,
        },
      ],
    },
    {
      code: 'let value: { property: Number };',
      output: 'let value: { property: number };',
      errors: [
        {
          messageId: 'bannedClassType',
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: '0 as Number;',
      output: '0 as number;',
      errors: [
        {
          messageId: 'bannedClassType',
          line: 1,
          column: 6,
        },
      ],
    },
    {
      code: 'type MyType = Number;',
      output: 'type MyType = number;',
      errors: [
        {
          messageId: 'bannedClassType',
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: 'type MyType = [Number];',
      output: 'type MyType = [number];',
      errors: [
        {
          messageId: 'bannedClassType',
          line: 1,
          column: 16,
        },
      ],
    },
    {
      code: 'class MyClass implements Number {}',
      output: null,
      errors: [
        {
          messageId: 'bannedClassType',
          line: 1,
          column: 26,
        },
      ],
    },
    {
      code: 'interface MyInterface extends Number {}',
      output: null,
      errors: [
        {
          messageId: 'bannedClassType',
          line: 1,
          column: 31,
        },
      ],
    },
    {
      code: 'type MyType = Number & String;',
      output: 'type MyType = number & string;',
      errors: [
        {
          data: { preferred: 'number', typeName: 'Number' },
          messageId: 'bannedClassType',
          line: 1,
          column: 15,
        },
        {
          data: { preferred: 'string', typeName: 'String' },
          messageId: 'bannedClassType',
          line: 1,
          column: 24,
        },
      ],
    },
  ],
});
