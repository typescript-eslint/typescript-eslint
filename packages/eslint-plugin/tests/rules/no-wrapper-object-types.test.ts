/* eslint-disable @typescript-eslint/internal/prefer-ast-types-enum */
import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-wrapper-object-types';

const ruleTester = new RuleTester();

ruleTester.run('no-wrapper-object-types', rule, {
  assertionOptions: {
    requireData: true,
  },
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
    // an `infer` type parameter is visible in its own constraint
    'type T<U> = U extends [infer String extends String] ? 1 : 0;',
    `
export {};
class Boolean {}
namespace N {
  namespace Boolean {}
  let value: Boolean;
}
    `,
    `
export {};
interface Number {
  value: 1;
}
declare global {
  let value: Number;
}
    `,
    `
interface String {
  value: 1;
}
let value: String;
    `,
    {
      code: `
export {};
interface String {
  value: 1;
}
declare let value: String;
      `,
      filename: 'test.d.ts',
    },
  ],
  invalid: [
    // an `infer` type parameter isn't visible in another one's constraint
    {
      code: 'type T<U> = U extends [infer V extends String, infer String] ? V : 0;',
      errors: [
        {
          column: 40,
          data: { preferred: 'string', typeName: 'String' },
          endColumn: 46,
          endLine: 1,
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output:
        'type T<U> = U extends [infer V extends string, infer String] ? V : 0;',
    },
    {
      code: 'type T<U> = U extends [infer String, infer V extends String] ? V : 0;',
      errors: [
        {
          column: 54,
          data: { preferred: 'string', typeName: 'String' },
          endColumn: 60,
          endLine: 1,
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output:
        'type T<U> = U extends [infer String, infer V extends string] ? V : 0;',
    },
    {
      code: 'let value: BigInt;',
      errors: [
        {
          column: 12,
          data: { preferred: 'bigint', typeName: 'BigInt' },
          endColumn: 18,
          endLine: 1,
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
          endColumn: 19,
          endLine: 1,
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
          endColumn: 18,
          endLine: 1,
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
          endColumn: 18,
          endLine: 1,
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
          endColumn: 18,
          endLine: 1,
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
          endColumn: 18,
          endLine: 1,
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
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'bannedClassType',
        },
        {
          column: 21,
          data: { preferred: 'symbol', typeName: 'Symbol' },
          endColumn: 27,
          endLine: 1,
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
          data: { preferred: 'number', typeName: 'Number' },
          endColumn: 30,
          endLine: 1,
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
          data: { preferred: 'number', typeName: 'Number' },
          endColumn: 12,
          endLine: 1,
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
          data: { preferred: 'number', typeName: 'Number' },
          endColumn: 21,
          endLine: 1,
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
          data: { preferred: 'number', typeName: 'Number' },
          endColumn: 22,
          endLine: 1,
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
          data: { preferred: 'number', typeName: 'Number' },
          endColumn: 32,
          endLine: 1,
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
          data: { preferred: 'number', typeName: 'Number' },
          endColumn: 37,
          endLine: 1,
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
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'bannedClassType',
        },
        {
          column: 24,
          data: { preferred: 'string', typeName: 'String' },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'bannedClassType',
        },
      ],
      output: 'type MyType = number & string;',
    },
    {
      code: `
export {};
namespace Number {}
let value: Number;
      `,
      errors: [
        {
          column: 12,
          data: { preferred: 'number', typeName: 'Number' },
          endColumn: 18,
          endLine: 4,
          line: 4,
          messageId: 'bannedClassType',
        },
      ],
      output: `
export {};
namespace Number {}
let value: number;
      `,
    },
    {
      code: `
export {};
namespace String {
  export const value = 1;
}
let value: String;
      `,
      errors: [
        {
          column: 12,
          data: { preferred: 'string', typeName: 'String' },
          endColumn: 18,
          endLine: 6,
          line: 6,
          messageId: 'bannedClassType',
        },
      ],
      output: `
export {};
namespace String {
  export const value = 1;
}
let value: string;
      `,
    },
    {
      code: `
export {};
function BigInt() {}
namespace BigInt {}
let value: BigInt;
      `,
      errors: [
        {
          column: 12,
          data: { preferred: 'bigint', typeName: 'BigInt' },
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'bannedClassType',
        },
      ],
      output: `
export {};
function BigInt() {}
namespace BigInt {}
let value: bigint;
      `,
    },
    {
      code: `
export {};
namespace Number {}
interface MyInterface extends Number {}
      `,
      errors: [
        {
          column: 31,
          data: { preferred: 'number', typeName: 'Number' },
          endColumn: 37,
          endLine: 4,
          line: 4,
          messageId: 'bannedClassType',
        },
      ],
      output: null,
    },
    {
      code: `
export {};
declare global {
  interface String {
    custom(): String;
  }
}
      `,
      errors: [
        {
          column: 15,
          data: { preferred: 'string', typeName: 'String' },
          endColumn: 21,
          endLine: 5,
          line: 5,
          messageId: 'bannedClassType',
        },
      ],
      output: `
export {};
declare global {
  interface String {
    custom(): string;
  }
}
      `,
    },
    {
      code: `
export {};
declare global {
  interface String {
    value: 1;
  }
  let value: String;
}
      `,
      errors: [
        {
          column: 14,
          data: { preferred: 'string', typeName: 'String' },
          endColumn: 20,
          endLine: 7,
          line: 7,
          messageId: 'bannedClassType',
        },
      ],
      output: `
export {};
declare global {
  interface String {
    value: 1;
  }
  let value: string;
}
      `,
    },
    {
      code: `
interface String {
  value: 1;
}
declare let value: String;
      `,
      errors: [
        {
          column: 20,
          data: { preferred: 'string', typeName: 'String' },
          endColumn: 26,
          endLine: 5,
          line: 5,
          messageId: 'bannedClassType',
        },
      ],
      filename: 'test.d.ts',
      output: `
interface String {
  value: 1;
}
declare let value: string;
      `,
    },
  ],
});
