import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-redundant-type-constituents';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('no-redundant-type-constituents', rule, {
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
    'type Foo = { a: string } | { a: number };',
    "type Foo = { a: string } | { a: 'b' | 'c' | 0 };",
    "type Foo = { a: 'b' | 'c' | 0 } | ({ a: 1 } | { a: 'a' });",
    'type Foo = { a: 1 } | { a: 1; b: 1 };',
    'type Foo = { a: 1 } | ({ a: 1 } & { b: 1 });',
    'type Foo = ({ a: 1 } & { b: 1 }) | { a: 1 };',
    'type Foo = { a: 1 } & { b: number };',
    'type Foo = { a: 1; b: 1 } & ({ a: 1; b: 1; c: 1 } | { a: 1 });',
    'type Foo = ({ a: 1; b: 1; c: 1 } | { a: 1 }) & { a: 1; b: 1 };',
    `
      type Foo =
        | (({ a: 1 } | { b: 1 }) & { a: 1 })
        | (({ a: 1 } | { c: 1 }) & { a: 1 });
    `,
    'type Foo = { a: 1 } | { a: { a: 1 } };',
    'type T = { [key: string]: 1 } | { a: 1 };',
    'type T = Partial<{ a: 1; b: 1 }> | { a: 1 };',
    "type T = Omit<{ a: 1; b: 1 }, 'a'> | { a: number; b: number };",
    'type T = { a?: 1; b?: 1 } & { a: 1 };',
    "type F<T> = Omit<T, 'a'> & { a: 1 };",
    "type F<T> = Omit<T, 'a'> & { a?: 1 };",
    "type F<T> = Omit<T, 'c'> & { a?: 1; b?: 1 };",
    "type F<T> = Omit<T, 'c'> & { a?: 1; b: 1 };",
    'type T = { a: { b: 1 } } & { a: { b: { c: 1 } } };',
    `
      interface A {
        a: 1;
      }
      interface B extends A {
        b: 1;
      }
      type C = A | B;
    `,
  ],

  invalid: [
    {
      code: 'type T = number | any;',
      errors: [
        {
          column: 19,
          data: {
            container: 'union',
            typeName: 'any',
          },
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
          column: 22,
          data: {
            container: 'union',
            typeName: 'any',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = any | number;',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            typeName: 'any',
          },
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
          column: 18,
          data: {
            container: 'union',
            typeName: 'any',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = number | never;',
      errors: [
        {
          column: 19,
          data: {
            container: 'union',
            typeName: 'never',
          },
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
          column: 22,
          data: {
            container: 'union',
            typeName: 'never',
          },
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
          column: 18,
          data: {
            container: 'union',
            typeName: 'never',
          },
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = never | number;',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            typeName: 'never',
          },
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = number | unknown;',
      errors: [
        {
          column: 19,
          data: {
            container: 'union',
            typeName: 'unknown',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = unknown | number;',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            typeName: 'unknown',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type ErrorTypes = NotKnown | 0;',
      errors: [
        {
          column: 19,
          data: {
            container: 'union',
            typeName: 'NotKnown',
          },
          messageId: 'errorTypeOverrides',
        },
      ],
    },
    {
      code: 'type T = number | 0;',
      errors: [
        {
          column: 19,
          data: {
            container: 'union',
            nonRedundantType: 'number',
            redundantType: '0',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = number | (0 | 1);',
      errors: [
        {
          column: 20,
          data: {
            container: 'union',
            nonRedundantType: 'number',
            redundantType: '0 | 1',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = (0 | 0) | number;',
      errors: [
        {
          column: 11,
          data: {
            container: 'union',
            nonRedundantType: 'number',
            redundantType: '0 | 0',
          },
          messageId: 'typeOverridden',
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
          column: 19,
          data: {
            container: 'union',
            nonRedundantType: 'number',
            redundantType: '2 | 0 | 1',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = (0 | (1 | 2)) | number;',
      errors: [
        {
          column: 11,
          data: {
            container: 'union',
            nonRedundantType: 'number',
            redundantType: '0 | 1 | 2',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = (0 | 1) | number;',
      errors: [
        {
          column: 11,
          data: {
            container: 'union',
            nonRedundantType: 'number',
            redundantType: '0 | 1',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = (0 | (0 | 1)) | number;',
      errors: [
        {
          column: 11,
          data: {
            container: 'union',
            nonRedundantType: 'number',
            redundantType: '0 | 0 | 1',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: "type T = (2 | 'other' | 3) | number;",
      errors: [
        {
          column: 11,
          data: {
            container: 'union',
            nonRedundantType: 'number',
            redundantType: '2 | 3',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: "type T = '' | string;",
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            nonRedundantType: 'string',
            redundantType: '""',
          },
          messageId: 'typeOverridden',
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
          column: 18,
          data: {
            container: 'union',
            nonRedundantType: 'string',
            redundantType: '"b"',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = `a${number}c` | string;',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            nonRedundantType: 'string',
            redundantType: '`a${number}c`',
          },
          messageId: 'typeOverridden',
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
          column: 18,
          data: {
            container: 'union',
            nonRedundantType: 'string',
            redundantType: '`a${number}c`',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = `${number}` | string;',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            nonRedundantType: 'string',
            redundantType: '`${number}`',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = 0n | bigint;',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            nonRedundantType: 'bigint',
            redundantType: '0n',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = -1n | bigint;',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            nonRedundantType: 'bigint',
            redundantType: '-1n',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = (-1n | 1n) | bigint;',
      errors: [
        {
          column: 11,
          data: {
            container: 'union',
            nonRedundantType: 'bigint',
            redundantType: '-1n | 1n',
          },
          messageId: 'typeOverridden',
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
          column: 22,
          data: {
            container: 'union',
            nonRedundantType: 'boolean',
            redundantType: 'false',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = false | boolean;',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            nonRedundantType: 'boolean',
            redundantType: 'false',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = true | boolean;',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            nonRedundantType: 'boolean',
            redundantType: 'true',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = false & boolean;',
      errors: [
        {
          column: 18,
          data: {
            container: 'intersection',
            nonRedundantType: 'false',
            redundantType: 'boolean',
          },
          messageId: 'typeOverridden',
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
          column: 22,
          data: {
            container: 'intersection',
            nonRedundantType: 'false',
            redundantType: 'boolean',
          },
          messageId: 'typeOverridden',
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
          column: 22,
          data: {
            container: 'intersection',
            nonRedundantType: 'true',
            redundantType: 'boolean',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = true & boolean;',
      errors: [
        {
          column: 17,
          data: {
            container: 'intersection',
            nonRedundantType: 'true',
            redundantType: 'boolean',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = number & any;',
      errors: [
        {
          column: 19,
          data: {
            container: 'intersection',
            typeName: 'any',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = any & number;',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            typeName: 'any',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type ErrorTypes = NotKnown & 0;',
      errors: [
        {
          column: 19,
          data: {
            container: 'intersection',
            typeName: 'NotKnown',
          },
          messageId: 'errorTypeOverrides',
        },
      ],
    },
    {
      code: 'type T = number & never;',
      errors: [
        {
          column: 19,
          data: {
            container: 'intersection',
            typeName: 'never',
          },
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
          column: 18,
          data: {
            container: 'intersection',
            typeName: 'never',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = never & number;',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            typeName: 'never',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = number & unknown;',
      errors: [
        {
          column: 19,
          data: {
            container: 'intersection',
            typeName: 'unknown',
          },
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = unknown & number;',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            typeName: 'unknown',
          },
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = number & 0;',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            nonRedundantType: '0',
            redundantType: 'number',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: "type T = '' & string;",
      errors: [
        {
          column: 15,
          data: {
            container: 'intersection',
            nonRedundantType: '""',
            redundantType: 'string',
          },
          messageId: 'typeOverridden',
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
          column: 22,
          data: {
            container: 'intersection',
            nonRedundantType: '0n',
            redundantType: 'bigint',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = 0n & bigint;',
      errors: [
        {
          column: 15,
          data: {
            container: 'intersection',
            nonRedundantType: '0n',
            redundantType: 'bigint',
          },
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = -1n & bigint;',
      errors: [
        {
          column: 16,
          data: {
            container: 'intersection',
            nonRedundantType: '-1n',
            redundantType: 'bigint',
          },
          messageId: 'typeOverridden',
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
          column: 22,
          data: {
            container: 'intersection',
            nonRedundantType: 'T',
            redundantType: 'string',
          },
          messageId: 'typeOverridden',
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
          column: 26,
          data: {
            container: 'intersection',
            nonRedundantType: 'T',
            redundantType: 'string',
          },
          endColumn: 32,
          line: 4,
          messageId: 'typeOverridden',
        },
        {
          column: 35,
          data: {
            container: 'intersection',
            nonRedundantType: 'S',
            redundantType: 'number',
          },
          endColumn: 41,
          line: 4,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = { a: 1 } | any;',
      errors: [
        {
          column: 21,
          data: {
            container: 'union',
            typeName: 'any',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: `
        type B = { a: 1 };
        type T = B | any;
      `,
      errors: [
        {
          column: 22,
          data: {
            container: 'union',
            typeName: 'any',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = any | { a: 1 };',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            typeName: 'any',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: `
        type B = any;
        type T = B | { a: 1 };
      `,
      errors: [
        {
          column: 18,
          data: {
            container: 'union',
            typeName: 'any',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = { a: 1 } | never;',
      errors: [
        {
          column: 21,
          data: {
            container: 'union',
            typeName: 'never',
          },
          messageId: 'overridden',
        },
      ],
    },
    {
      code: `
        type B = { a: 1 };
        type T = B | never;
      `,
      errors: [
        {
          column: 22,
          data: {
            container: 'union',
            typeName: 'never',
          },
          messageId: 'overridden',
        },
      ],
    },
    {
      code: `
        type B = never;
        type T = B | { a: 1 };
      `,
      errors: [
        {
          column: 18,
          data: {
            container: 'union',
            typeName: 'never',
          },
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = never | { a: 1 };',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            typeName: 'never',
          },
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = { a: 1 } | unknown;',
      errors: [
        {
          column: 21,
          data: {
            container: 'union',
            typeName: 'unknown',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = unknown | { a: 1 };',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            typeName: 'unknown',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type ErrorTypes = NotKnown | { a: 1 };',
      errors: [
        {
          column: 19,
          data: {
            container: 'union',
            typeName: 'NotKnown',
          },
          messageId: 'errorTypeOverrides',
        },
      ],
    },
    {
      code: 'type Foo = { a: 1 | 2 } | ({ a: 1 } & { a: 1 | 3 });',
      errors: [
        {
          column: 28,
          data: {
            container: 'union',
            nonRedundantType: '{ a: 1 | 2; }',
            redundantType: '{ a: 1; } & { a: 1 | 3; }',
          },
          endColumn: 51,
          messageId: 'typeOverridden',
        },
        {
          column: 39,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; }',
            redundantType: '{ a: 1 | 3; }',
          },
          endColumn: 51,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type Foo = { a: 1 | 2 } | ({ a: 1 } | ({ a: 2 } & { a: 1 | 2 }));',
      errors: [
        {
          column: 28,
          data: {
            container: 'union',
            nonRedundantType: '{ a: 1 | 2; }',
            redundantType: '{ a: 1; } | ({ a: 2; } & { a: 1 | 2; })',
          },
          endColumn: 64,
          messageId: 'typeOverridden',
        },
        {
          column: 51,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 2; }',
            redundantType: '{ a: 1 | 2; }',
          },
          endColumn: 63,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type Foo = { a: 1 } | ({ a: 3 } | ({ a: 1 | 2 } & { a: number }));',
      errors: [
        {
          column: 12,
          data: {
            container: 'union',
            nonRedundantType: '{ a: 1 | 2; } & { a: number; }',
            redundantType: '{ a: 1; }',
          },
          endColumn: 20,
          messageId: 'typeOverridden',
        },
        {
          column: 51,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1 | 2; }',
            redundantType: '{ a: number; }',
          },
          endColumn: 64,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
type R = { a: 1 | 2 } & { a: number };
type T = R | { a: 1 };
      `,
      errors: [
        {
          column: 25,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1 | 2; }',
            redundantType: '{ a: number; }',
          },
          endColumn: 38,
          line: 2,
          messageId: 'typeOverridden',
        },
        {
          column: 14,
          data: {
            container: 'union',
            nonRedundantType: 'R',
            redundantType: '{ a: 1; }',
          },
          endColumn: 22,
          line: 3,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
type R = ({ a: 1; b: 2; c: 1 } & { a: 1; b: 2 }) | { a: 2; b: 1 };
type P = R & { a: number; b: number };
      `,
      errors: [
        {
          column: 34,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; b: 2; c: 1; }',
            redundantType: '{ a: 1; b: 2; }',
          },
          endColumn: 48,
          line: 2,
          messageId: 'typeOverridden',
        },
        {
          column: 14,
          data: {
            container: 'intersection',
            nonRedundantType: 'R',
            redundantType: '{ a: number; b: number; }',
          },
          endColumn: 38,
          line: 3,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
type R = { a: 1 | 2 } & { a: number };
type T = R | { a: 1 };
type U = T | { a: 2 };
      `,
      errors: [
        {
          column: 25,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1 | 2; }',
            redundantType: '{ a: number; }',
          },
          endColumn: 38,
          line: 2,
          messageId: 'typeOverridden',
        },
        {
          column: 14,
          data: {
            container: 'union',
            nonRedundantType: 'R',
            redundantType: '{ a: 1; }',
          },
          endColumn: 22,
          line: 3,
          messageId: 'typeOverridden',
        },
        {
          column: 14,
          data: {
            container: 'union',
            nonRedundantType: 'R',
            redundantType: '{ a: 2; }',
          },
          endColumn: 22,
          line: 4,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = { a: false } & { a: boolean };',
      errors: [
        {
          column: 25,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: false; }',
            redundantType: '{ a: boolean; }',
          },
          endColumn: 39,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
type B = { a: false };
type T = B & { a: boolean };
      `,
      errors: [
        {
          column: 14,
          data: {
            container: 'intersection',
            nonRedundantType: 'B',
            redundantType: '{ a: boolean; }',
          },
          endColumn: 28,
          line: 3,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = { a: true } & { a: boolean };',
      errors: [
        {
          column: 24,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: true; }',
            redundantType: '{ a: boolean; }',
          },
          endColumn: 38,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = { a: number } & any;',
      errors: [
        {
          column: 26,
          data: {
            container: 'intersection',
            typeName: 'any',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = any & { a: number };',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            typeName: 'any',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type ErrorTypes = NotKnown & { a: 0 };',
      errors: [
        {
          column: 19,
          data: {
            container: 'intersection',
            typeName: 'NotKnown',
          },
          messageId: 'errorTypeOverrides',
        },
      ],
    },
    {
      code: 'type T = { a: number } & never;',
      errors: [
        {
          column: 26,
          data: {
            container: 'intersection',
            typeName: 'never',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: `
        type B = never;
        type T = B & { a: number };
      `,
      errors: [
        {
          column: 18,
          data: {
            container: 'intersection',
            typeName: 'never',
          },
          line: 3,
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = never & { a: number };',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            typeName: 'never',
          },
          messageId: 'overrides',
        },
      ],
    },
    {
      code: 'type T = { a: number } & unknown;',
      errors: [
        {
          column: 26,
          data: {
            container: 'intersection',
            typeName: 'unknown',
          },
          messageId: 'overridden',
        },
      ],
    },
    {
      code: 'type T = unknown & { a: number };',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            typeName: 'unknown',
          },
          messageId: 'overridden',
        },
      ],
    },
    {
      code: `
type T = { a: 1 } | { a: 2 };
type U = T & { a: number };
      `,
      errors: [
        {
          column: 14,
          data: {
            container: 'intersection',
            nonRedundantType: 'T',
            redundantType: '{ a: number; }',
          },
          endColumn: 27,
          line: 3,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
type S = { a: 1 } | { a: 2 };
type T = { a: 'a' } | { a: 'b' };
type U = S & T & { a: string } & { a: number };
      `,
      errors: [
        {
          column: 18,
          data: {
            container: 'intersection',
            nonRedundantType: 'T',
            redundantType: '{ a: string; }',
          },
          endColumn: 31,
          line: 4,
          messageId: 'typeOverridden',
        },
        {
          column: 34,
          data: {
            container: 'intersection',
            nonRedundantType: 'S',
            redundantType: '{ a: number; }',
          },
          endColumn: 47,
          line: 4,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = { a: 1 | 2 } & { a: number } & { a: 1 };',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; }',
            redundantType: '{ a: 1 | 2; }',
          },
          endColumn: 22,
          messageId: 'typeOverridden',
        },
        {
          column: 25,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1 | 2; } & { a: 1; }',
            redundantType: '{ a: number; }',
          },
          endColumn: 38,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type Foo = ({ a: number } & { b: number }) & { a: 1; b: 1 };',
      errors: [
        {
          column: 13,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; b: 1; }',
            redundantType: '{ a: number; }',
          },
          endColumn: 42,
          messageId: 'typeOverridden',
        },
        {
          column: 13,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; b: 1; }',
            redundantType: '{ b: number; }',
          },
          endColumn: 42,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type Foo = ({ a: number } & { b: number }) & { a: 1 } & { b: 1 };',
      errors: [
        {
          column: 13,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; }',
            redundantType: '{ a: number; }',
          },
          endColumn: 42,
          messageId: 'typeOverridden',
        },
        {
          column: 13,
          data: {
            container: 'intersection',
            nonRedundantType: '{ b: 1; }',
            redundantType: '{ b: number; }',
          },
          endColumn: 42,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type Foo = { a: 1; b: 1 } | ({ a: number } & ({ b: 1 } | { d: 1 }));',
      errors: [
        {
          column: 12,
          data: {
            container: 'union',
            nonRedundantType: '{ a: number; } & ({ b: 1; } | { d: 1; })',
            redundantType: '{ a: 1; b: 1; }',
          },
          endColumn: 26,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type F = { a: 1 } & ({ a: 1; b: 1 } | { a: 1 });',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; b: 1; } | { a: 1; }',
            redundantType: '{ a: 1; }',
          },
          endColumn: 18,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type F = ({ a: 1; b: 1 } | { a: 1 }) & { a: 1 };',
      errors: [
        {
          column: 40,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; b: 1; } | { a: 1; }',
            redundantType: '{ a: 1; }',
          },
          endColumn: 48,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type F = { a: 1; b: 1 } & ({ a: 1 } | { b: 1 });',
      errors: [
        {
          column: 28,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; b: 1; }',
            redundantType: '{ a: 1; } | { b: 1; }',
          },
          endColumn: 47,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type F = { a: 1 } & { a: 1; b: 1 };',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; b: 1; }',
            redundantType: '{ a: 1; }',
          },
          endColumn: 18,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
type R = { a: 1; b: 2 } | { a: 2; b: 1 };
type T = { a: number } | { b: number };
type U = R & T;
      `,
      errors: [
        {
          column: 14,
          data: {
            container: 'intersection',
            nonRedundantType: 'R',
            redundantType: 'T',
          },
          endColumn: 15,
          line: 4,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
type T = { a: 1; b: 1 };
type U<K extends string> = Omit<T, K> & Required<T>;
type K = U<'a'>;
type R = K | { a: 1 };
      `,
      errors: [
        {
          column: 28,
          data: {
            container: 'intersection',
            nonRedundantType: 'Required<T>',
            redundantType: 'Omit<T, K>',
          },
          endColumn: 38,
          line: 3,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
type T = { a: 1; b: 1 };
type U<K extends string> = Omit<T, K> & Required<T>;
type K = U<'a'>;
type R = K & { a: 1 };
      `,
      errors: [
        {
          column: 28,
          data: {
            container: 'intersection',
            nonRedundantType: 'Required<T>',
            redundantType: 'Omit<T, K>',
          },
          endColumn: 38,
          line: 3,
          messageId: 'typeOverridden',
        },
        {
          column: 14,
          data: {
            container: 'intersection',
            nonRedundantType: 'K',
            redundantType: '{ a: 1; }',
          },
          endColumn: 22,
          line: 5,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
interface T {
  a: 1;
}
type U = T | { a: number };
      `,
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            nonRedundantType: '{ a: number; }',
            redundantType: 'T',
          },
          endColumn: 11,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = { [key: string]: 1 } & { a: 1 };',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; }',
            redundantType: '{ [key: string]: 1; }',
          },
          endColumn: 30,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = Record<string, number> & { a: 1 };',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; }',
            redundantType: 'Record<string, number>',
          },
          endColumn: 32,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
type T = { [key: string]: 1 };
type U = T & { a: 1 };
      `,
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; }',
            redundantType: 'T',
          },
          endColumn: 11,
          line: 3,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type U = { [key: string]: 1 } | { [key: string]: number };',
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            nonRedundantType: '{ [key: string]: number; }',
            redundantType: '{ [key: string]: 1; }',
          },
          endColumn: 30,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
type T = { a: '1'; b: '2' };
type U<Type> = {
  [Property in keyof Type]: 0;
};
type F = U<T> | { a: number; b: number };
      `,
      errors: [
        {
          column: 10,
          data: {
            container: 'union',
            nonRedundantType: '{ a: number; b: number; }',
            redundantType: 'U<T>',
          },
          endColumn: 14,
          line: 6,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
type T = { a: '1'; b: '2' };
type U<Type> = {
  [Property in keyof Type]: 0;
};
type F = U<T> & { a: number; b: number };
      `,
      errors: [
        {
          column: 17,
          data: {
            container: 'intersection',
            nonRedundantType: 'U<T>',
            redundantType: '{ a: number; b: number; }',
          },
          endColumn: 41,
          line: 6,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = Partial<{ a: 1 }> | { a: 1 };',
      errors: [
        {
          column: 30,
          data: {
            container: 'union',
            nonRedundantType: 'Partial<{ a: 1; }>',
            redundantType: '{ a: 1; }',
          },
          endColumn: 38,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = Partial<{ a: 1 }> & { a: 1 };',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; }',
            redundantType: 'Partial<{ a: 1; }>',
          },
          endColumn: 27,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = { a?: 1 } & { a: 1; b?: 1 };',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: 1; b?: 1 | undefined; }',
            redundantType: '{ a?: 1 | undefined; }',
          },
          endColumn: 19,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: 'type T = { a: { b: 1 } } & { a: { b: 1; c?: 1 } };',
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            nonRedundantType: '{ a: { b: 1; c?: 1 | undefined; }; }',
            redundantType: '{ a: { b: 1; }; }',
          },
          endColumn: 25,
          messageId: 'typeOverridden',
        },
      ],
    },
    {
      code: `
interface A {
  a: 1;
}
interface B extends A {
  b: 1;
}
type C = A & B;
      `,
      errors: [
        {
          column: 10,
          data: {
            container: 'intersection',
            nonRedundantType: 'B',
            redundantType: 'A',
          },
          endColumn: 11,
          line: 8,
          messageId: 'typeOverridden',
        },
      ],
    },
  ],
});
