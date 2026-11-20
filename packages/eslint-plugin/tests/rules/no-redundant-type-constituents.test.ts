import rule from '../../src/rules/no-redundant-type-constituents';
import { createRuleTesterWithTypes } from '../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('no-redundant-type-constituents', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
type T = any;
type U = T;
    `,
    `
type T = never;
type U = T;
    `,
    `
type T = 1 | 2;
type U = T | 3;
type V = U;
    `,
    'type T = () => never;',
    'type T = () => never | string;',
    `
type B = never;
type T = () => B | string;
    `,
    `
type B = string;
type T = () => B | never;
    `,
    'type T = () => string | never;',
    'type T = { (): string | never };',
    `
function _(): string | never {
  return '';
}
    `,
    `
const _ = (): string | never => {
  return '';
};
    `,
    `
type B = string;
type T = { (): B | never };
    `,
    'type T = { new (): string | never };',
    `
type B = never;
type T = { new (): string | B };
    `,
    `
type B = unknown;
type T = B;
    `,
    'type T = bigint;',
    `
type B = bigint;
type T = B;
    `,
    'type T = 1n | 2n;',
    `
type B = 1n;
type T = B | 2n;
    `,
    'type T = boolean;',
    `
type B = boolean;
type T = B;
    `,
    'type T = false | true;',
    `
type B = false;
type T = B | true;
    `,
    `
type B = true;
type T = B | false;
    `,
    'type T = number;',
    `
type B = number;
type T = B;
    `,
    'type T = 1 | 2;',
    `
type B = 1;
type T = B | 2;
    `,
    'type T = 1 | false;',
    `
type B = 1;
type T = B | false;
    `,
    'type T = string;',
    `
type B = string;
type T = B;
    `,
    "type T = 'a' | 'b';",
    `
type B = 'b';
type T = 'a' | B;
    `,
    `
type B = 'a';
type T = B | 'b';
    `,
    'type T = bigint | null;',
    `
type B = bigint;
type T = B | null;
    `,
    'type T = boolean | null;',
    `
type B = boolean;
type T = B | null;
    `,
    'type T = number | null;',
    `
type B = number;
type T = B | null;
    `,
    'type T = string | null;',
    `
type B = string;
type T = B | null;
    `,
    'type T = bigint & null;',
    `
type B = bigint;
type T = B & null;
    `,
    'type T = boolean & null;',
    `
type B = boolean;
type T = B & null;
    `,
    'type T = number & null;',
    `
type B = number;
type T = B & null;
    `,
    'type T = string & null;',
    `
type B = string;
type T = B & null;
    `,
    'type T = `${string}` & null;',
    `
type B = \`\${string}\`;
type T = B & null;
    `,
    `
type T = 'a' | 1 | 'b';
type U = T & string;
    `,
    "declare function fn(): never | 'foo';",
    'type T = { a: string } | { b: string };',
    'type T = { a: string; b: number } | { a: string };',
    'type T = { a: string; b: number } & { a: string };',
    'type T = { a?: string } | { a: string };',
    'type T = { a?: string } & { a: string };',
    'type T = { [key: string]: string } | { a: string };',
    'type T = { [key: string]: string } & { a: string };',
    "type T = ({ a: string; b: number } | { a: string }) | { a: 'foo' };",
    `
type GetMethod = ({ a: 1; b: 2 } & { c: 3 }) | ({ a: 2; b: 2 } & { c: 3 });
type T = { a: 1 | 2 } & GetMethod;
    `,
    `
interface A {
  a: 1;
}
interface B {
  a: number;
}
type T = A | B;
type U = A & B;
    `,
    `
type A = { a: 1 };
type T = A | { a: number };
    `,
    `
type B = { a: number };
type T = { a: 1 } & B;
    `,
    'type T = {} | { a: string };',
    'type T = {} & { a: string };',
    'type T = Record<string, never> | { a: string };',
    `
interface Empty {}
type T = Empty | { a: string };
type U = Empty & { a: string };
    `,
    'type T = object | { a: string };',
    'type T = object & { a: string };',
    'type T = (object & { a: number }) | { a: 1 };',
    'type T = (() => void) | { (): void; a: string };',
    'type T = (() => void) & { (): void; a: string };',
    'type T = Function | { a: string };',
    'type T = (new () => object) | { new (): object; a: string };',
    'type T = { (): void; a: 1 } | { a: number };',
    'type T = { new (): object; a: 1 } | { a: number };',
    'type T = { a: 1 } | { a: 1 };',
    'type T = { a: 1 } & { a: 1 };',
    'type T = [1, 2] | [1, 2];',
    'type T = number[] | { length: number };',
    'type T = ({ a: 1 } & string) | { a: number };',
  ],

  invalid: [
    {
      code: 'type T = number | any;',
      errors: [
        {
          column: 19,
          data: { container: 'union', typeName: 'any' },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: `
type B = number;
type T = B | any;
      `,
      errors: [
        {
          column: 14,
          data: { container: 'union', typeName: 'any' },
          endColumn: 17,
          endLine: 3,
          line: 3,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = any | number;',
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: 'any' },
          endColumn: 13,
          endLine: 1,
          line: 1,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: `
type B = any;
type T = B | number;
      `,
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: 'any' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = number | never;',
      errors: [
        {
          column: 19,
          data: { container: 'union', typeName: 'never' },
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: `
type B = number;
type T = B | never;
      `,
      errors: [
        {
          column: 14,
          data: { container: 'union', typeName: 'never' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: `
type B = never;
type T = B | number;
      `,
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: 'never' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = never | number;',
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: 'never' },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = number | unknown;',
      errors: [
        {
          column: 19,
          data: { container: 'union', typeName: 'unknown' },
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = unknown | number;',
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: 'unknown' },
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type ErrorTypes = NotKnown | 0;',
      errors: [
        {
          column: 19,
          data: { container: 'union', typeName: 'NotKnown' },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'errorTypeOverrides',
        },
      ],
    },
    {
      code: 'type T = number | 0;',
      errors: [
        {
          column: 19,
          data: { literal: '0', primitive: 'number' },
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = number | (0 | 1);',
      errors: [
        {
          column: 20,
          data: { literal: '0 | 1', primitive: 'number' },
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = (0 | 0) | number;',
      errors: [
        {
          column: 11,
          data: { literal: '0 | 0', primitive: 'number' },
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: `
type B = 0 | 1;
type T = (2 | B) | number;
      `,
      errors: [
        {
          column: 11,
          data: { literal: '2 | 0 | 1', primitive: 'number' },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = (0 | (1 | 2)) | number;',
      errors: [
        {
          column: 11,
          data: { literal: '0 | 1 | 2', primitive: 'number' },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = (0 | 1) | number;',
      errors: [
        {
          column: 11,
          data: { literal: '0 | 1', primitive: 'number' },
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = (0 | (0 | 1)) | number;',
      errors: [
        {
          column: 11,
          data: { literal: '0 | 0 | 1', primitive: 'number' },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: "type T = (2 | 'other' | 3) | number;",
      errors: [
        {
          column: 11,
          data: { literal: '2 | 3', primitive: 'number' },
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: "type T = '' | string;",
      errors: [
        {
          column: 10,
          data: { literal: '""', primitive: 'string' },
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: `
type B = 'b';
type T = B | string;
      `,
      errors: [
        {
          column: 10,
          data: { literal: '"b"', primitive: 'string' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = `a${number}c` | string;',
      errors: [
        {
          column: 10,
          data: { literal: 'template literal type', primitive: 'string' },
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: `
type B = \`a\${number}c\`;
type T = B | string;
      `,
      errors: [
        {
          column: 10,
          data: { literal: 'template literal type', primitive: 'string' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = `${number}` | string;',
      errors: [
        {
          column: 10,
          data: { literal: 'template literal type', primitive: 'string' },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = 0n | bigint;',
      errors: [
        {
          column: 10,
          data: { literal: '0n', primitive: 'bigint' },
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = -1n | bigint;',
      errors: [
        {
          column: 10,
          data: { literal: '-1n', primitive: 'bigint' },
          endColumn: 13,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = (-1n | 1n) | bigint;',
      errors: [
        {
          column: 11,
          data: { literal: '-1n | 1n', primitive: 'bigint' },
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: `
type B = boolean;
type T = B | false;
      `,
      errors: [
        {
          column: 14,
          data: { literal: 'false', primitive: 'boolean' },
          endColumn: 19,
          endLine: 3,
          line: 3,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = false | boolean;',
      errors: [
        {
          column: 10,
          data: { literal: 'false', primitive: 'boolean' },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = true | boolean;',
      errors: [
        {
          column: 10,
          data: { literal: 'true', primitive: 'boolean' },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = false & boolean;',
      errors: [
        {
          column: 18,
          data: { literal: 'false', primitive: 'boolean' },
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: `
type B = false;
type T = B & boolean;
      `,
      errors: [
        {
          column: 14,
          data: { literal: 'false', primitive: 'boolean' },
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: `
type B = true;
type T = B & boolean;
      `,
      errors: [
        {
          column: 14,
          data: { literal: 'true', primitive: 'boolean' },
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: 'type T = true & boolean;',
      errors: [
        {
          column: 17,
          data: { literal: 'true', primitive: 'boolean' },
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: 'type T = number & any;',
      errors: [
        {
          column: 19,
          data: { container: 'intersection', typeName: 'any' },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = any & number;',
      errors: [
        {
          column: 10,
          data: { container: 'intersection', typeName: 'any' },
          endColumn: 13,
          endLine: 1,
          line: 1,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type ErrorTypes = NotKnown & 0;',
      errors: [
        {
          column: 19,
          data: { container: 'intersection', typeName: 'NotKnown' },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'errorTypeOverrides',
        },
      ],
    },
    {
      code: 'type T = number & never;',
      errors: [
        {
          column: 19,
          data: { container: 'intersection', typeName: 'never' },
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: `
type B = never;
type T = B & number;
      `,
      errors: [
        {
          column: 10,
          data: { container: 'intersection', typeName: 'never' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = never & number;',
      errors: [
        {
          column: 10,
          data: { container: 'intersection', typeName: 'never' },
          endColumn: 15,
          endLine: 1,
          line: 1,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = number & unknown;',
      errors: [
        {
          column: 19,
          data: { container: 'intersection', typeName: 'unknown' },
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = unknown & number;',
      errors: [
        {
          column: 10,
          data: { container: 'intersection', typeName: 'unknown' },
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = number & 0;',
      errors: [
        {
          column: 10,
          data: { literal: '0', primitive: 'number' },
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: "type T = '' & string;",
      errors: [
        {
          column: 15,
          data: { literal: '""', primitive: 'string' },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: `
type B = 0n;
type T = B & bigint;
      `,
      errors: [
        {
          column: 14,
          data: { literal: '0n', primitive: 'bigint' },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: 'type T = 0n & bigint;',
      errors: [
        {
          column: 15,
          data: { literal: '0n', primitive: 'bigint' },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: 'type T = -1n & bigint;',
      errors: [
        {
          column: 16,
          data: { literal: '-1n', primitive: 'bigint' },
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: `
type T = 'a' | 'b';
type U = T & string;
      `,
      errors: [
        {
          column: 10,
          data: { literal: '"a" | "b"', primitive: 'string' },
          endColumn: 11,
          endLine: 3,
          line: 3,
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: `
type S = 1 | 2;
type T = 'a' | 'b';
type U = S & T & string & number;
      `,
      errors: [
        {
          column: 10,
          data: { literal: '1 | 2', primitive: 'number' },
          endColumn: 11,
          endLine: 4,
          line: 4,
          messageId: 'primitiveOverridden',
        },
        {
          column: 14,
          data: { literal: '"a" | "b"', primitive: 'string' },
          endColumn: 15,
          endLine: 4,
          line: 4,
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: 'type T = { a: 1 } | { a: number };',
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: '{ a: 1; }' },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = { a: 1 } & { a: number };',
      errors: [
        {
          column: 21,
          data: { container: 'intersection', typeName: '{ a: number; }' },
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: `
interface Wide {
  a: number;
}
type T = Wide | { a: 1 };
      `,
      errors: [
        {
          column: 17,
          data: { container: 'union', typeName: '{ a: 1; }' },
          endColumn: 25,
          endLine: 5,
          line: 5,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: `
interface Narrow {
  a: 1;
}
type T = Narrow & { a: number };
      `,
      errors: [
        {
          column: 19,
          data: { container: 'intersection', typeName: '{ a: number; }' },
          endColumn: 32,
          endLine: 5,
          line: 5,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = ({ a: number } | string) | { a: 1 };',
      errors: [
        {
          column: 37,
          data: { container: 'union', typeName: '{ a: 1; }' },
          endColumn: 45,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = { a: { b: 1 } } | { a: { b: number } };',
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: '{ a: { b: 1; }; }' },
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = { [key: string]: 1 } | { [key: string]: number };',
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: '{ [key: string]: 1; }' },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = { [key: string]: 1 } & { [key: string]: number };',
      errors: [
        {
          column: 33,
          data: {
            container: 'intersection',
            typeName: '{ [key: string]: number; }',
          },
          endColumn: 58,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = { a?: 1 } | { a?: number };',
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: '{ a?: 1 | undefined; }' },
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = string[] | (string | number)[];',
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: 'string[]' },
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = string[] & (string | number)[];',
      errors: [
        {
          column: 21,
          data: { container: 'intersection', typeName: '(string | number)[]' },
          endColumn: 40,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = [1, 2] | [number, number];',
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: '[1, 2]' },
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = [1, 2] & [number, number];',
      errors: [
        {
          column: 19,
          data: { container: 'intersection', typeName: '[number, number]' },
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = [1, 2] | number[];',
      errors: [
        {
          column: 10,
          data: { container: 'union', typeName: '[1, 2]' },
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = [1, 2] & number[];',
      errors: [
        {
          column: 19,
          data: { container: 'intersection', typeName: 'number[]' },
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = ({ a: 1 } & { b: 1 }) | { a: number; b: number };',
      errors: [
        {
          column: 11,
          data: { container: 'union', typeName: '{ a: 1; } & { b: 1; }' },
          endColumn: 30,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = { a: 1; b: 1 } & ({ a: number } & { b: number });',
      errors: [
        {
          column: 28,
          data: {
            container: 'intersection',
            typeName: '{ a: number; } & { b: number; }',
          },
          endColumn: 57,
          endLine: 1,
          line: 1,
          messageId: 'overridden',
        },
      ],
    },
  ],
});
