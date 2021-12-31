import rule from '../../src/rules/no-redundant-type-constituents';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2021,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-redundant-type-constituents', rule, {
  valid: [
    'type _ = any;',
    'type _ = never;',
    'type _ = () => never;',
    'type _ = () => never | string;',
    'type _ = () => string | never;',
    'type _ = { (): string | never };',
    'type _ = { new (): string | never };',
    'type _ = unknown;',
    'type _ = bigint;',
    'type _ = 1n | 2n;',
    'type _ = boolean;',
    'type _ = false | true;',
    'type _ = number;',
    'type _ = 1 | 2;',
    'type _ = 1 | false;',
    'type _ = string;',
    "type _ = 'a' | 'b';",
    'type _ = bigint | null;',
    'type _ = boolean | null;',
    'type _ = number | null;',
    'type _ = string | null;',
    'type _ = bigint & null;',
    'type _ = boolean & null;',
    'type _ = number & null;',
    'type _ = string & null;',
  ],

  invalid: [
    {
      code: 'type _ = number | any;',
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
      code: 'type _ = any | number;',
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
      code: 'type _ = number | never;',
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
      code: 'type _ = never | number;',
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
      code: 'type _ = number | unknown;',
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
      code: 'type _ = unknown | number;',
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
      code: 'type _ = number | 0;',
      errors: [
        {
          column: 19,
          data: {
            literal: '0',
            primitive: 'number',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = number | (0 | 1);',
      errors: [
        {
          column: 20,
          data: {
            literal: '0 | 1',
            primitive: 'number',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = (0 | 0) | number;',
      errors: [
        {
          column: 11,
          data: {
            literal: '0',
            primitive: 'number',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = (0 | (0 | 0)) | number;',
      errors: [
        {
          column: 11,
          data: {
            literal: '0',
            primitive: 'number',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = (0 | 1) | number;',
      errors: [
        {
          column: 11,
          data: {
            literal: '0 | 1',
            primitive: 'number',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = (0 | (0 | 1)) | number;',
      errors: [
        {
          column: 11,
          data: {
            literal: '0 | 1',
            primitive: 'number',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = (0 | (1 | 2)) | number;',
      errors: [
        {
          column: 11,
          data: {
            literal: '0 | 1 | 2',
            primitive: 'number',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: "type _ = (2 | 'other' | 3) | number;",
      errors: [
        {
          column: 11,
          data: {
            literal: '2 | 3',
            primitive: 'number',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: "type _ = '' | string;",
      errors: [
        {
          column: 10,
          data: {
            literal: '""',
            primitive: 'string',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = `a${number}c` | string;',
      errors: [
        {
          column: 10,
          data: {
            literal: 'template literal type',
            primitive: 'string',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = `${number}` | string;',
      errors: [
        {
          column: 10,
          data: {
            literal: 'template literal type',
            primitive: 'string',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = 0n | bigint;',
      errors: [
        {
          column: 10,
          data: {
            literal: '0n',
            primitive: 'bigint',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = -1n | bigint;',
      errors: [
        {
          column: 10,
          data: {
            literal: '-1n',
            primitive: 'bigint',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = (-1n | 1n) | bigint;',
      errors: [
        {
          column: 11,
          data: {
            literal: '1n | -1n',
            primitive: 'bigint',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = false | boolean;',
      errors: [
        {
          column: 10,
          data: {
            literal: 'false',
            primitive: 'boolean',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = true | boolean;',
      errors: [
        {
          column: 10,
          data: {
            literal: 'true',
            primitive: 'boolean',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type _ = number & any;',
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
      code: 'type _ = any & number;',
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
      code: 'type _ = number & never;',
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
      code: 'type _ = never & number;',
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
      code: 'type _ = number & unknown;',
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
      code: 'type _ = unknown & number;',
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
      code: 'type _ = number & 0;',
      errors: [
        {
          column: 10,
          data: {
            literal: '0',
            primitive: 'number',
          },
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: "type _ = '' & string;",
      errors: [
        {
          column: 15,
          data: {
            literal: '""',
            primitive: 'string',
          },
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: 'type _ = 0n & bigint;',
      errors: [
        {
          column: 15,
          data: {
            literal: '0n',
            primitive: 'bigint',
          },
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: 'type _ = -1n & bigint;',
      errors: [
        {
          column: 16,
          data: {
            literal: '-1n',
            primitive: 'bigint',
          },
          messageId: 'primitiveOverridden',
        },
      ],
    },
  ],
});
