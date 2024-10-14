/* eslint-disable @typescript-eslint/internal/prefer-ast-types-enum */
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-wrapper-object-types';

const ruleTester = new RuleTester();

ruleTester.run('no-wrapper-object-types', rule, {
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
    `
      type Number = 0 | 1;
      let value: Number;
    `,
    `
      type Bigint = 0 | 1;
      let value: Bigint;
    `,
    `
      type T<Symbol> = Symbol;
      type U<UU> = UU extends T<infer Function> ? Function : never;
    `,
  ],
  invalid: [
    {
      code: 'let value: BigInt;',
      errors: [
        {
          column: 12,
          data: { preferred: 'bigint', typeName: 'BigInt' },
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'let value: bigint;',
    },
    {
      code: 'let value: Boolean;',
      errors: [
        {
          column: 12,
          data: { preferred: 'boolean', typeName: 'Boolean' },
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'let value: boolean;',
    },
    {
      code: 'let value: Number;',
      errors: [
        {
          column: 12,
          data: { preferred: 'number', typeName: 'Number' },
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'let value: number;',
    },
    {
      code: 'let value: Object;',
      errors: [
        {
          column: 12,
          data: { preferred: 'object', typeName: 'Object' },
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'let value: object;',
    },
    {
      code: 'let value: String;',
      errors: [
        {
          column: 12,
          data: { preferred: 'string', typeName: 'String' },
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'let value: string;',
    },
    {
      code: 'let value: Symbol;',
      errors: [
        {
          column: 12,
          data: { preferred: 'symbol', typeName: 'Symbol' },
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'let value: symbol;',
    },
    {
      code: 'let value: Number | Symbol;',
      errors: [
        {
          column: 12,
          data: { preferred: 'number', typeName: 'Number' },
          line: 1,
          messageId: 'bannedClassType',
        },
        {
          column: 21,
          data: { preferred: 'symbol', typeName: 'Symbol' },
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'let value: number | symbol;',
    },
    {
      code: 'let value: { property: Number };',
      errors: [
        {
          column: 24,
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'let value: { property: number };',
    },
    {
      code: '0 as Number;',
      errors: [
        {
          column: 6,
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: '0 as number;',
    },
    {
      code: 'type MyType = Number;',
      errors: [
        {
          column: 15,
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'type MyType = number;',
    },
    {
      code: 'type MyType = [Number];',
      errors: [
        {
          column: 16,
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'type MyType = [number];',
    },
    {
      code: 'class MyClass implements Number {}',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: null,
    },
    {
      code: 'interface MyInterface extends Number {}',
      errors: [
        {
          column: 31,
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: null,
    },
    {
      code: 'type MyType = Number & String;',
      errors: [
        {
          column: 15,
          data: { preferred: 'number', typeName: 'Number' },
          line: 1,
          messageId: 'bannedClassType',
        },
        {
          column: 24,
          data: { preferred: 'string', typeName: 'String' },
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'type MyType = number & string;',
    },
  ],
});
