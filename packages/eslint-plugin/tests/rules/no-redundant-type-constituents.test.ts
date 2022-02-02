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
      code: 'type T = number | 0;',
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
      code: 'type T = number | (0 | 1);',
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
      code: 'type T = (0 | 0) | number;',
      errors: [
        {
          column: 11,
          data: {
            literal: '0 | 0',
            primitive: 'number',
          },
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
          column: 19,
          data: {
            literal: '2 | 0 | 1',
            primitive: 'number',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = (0 | (1 | 2)) | number;',
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
      code: 'type T = (0 | 1) | number;',
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
      code: 'type T = (0 | (0 | 1)) | number;',
      errors: [
        {
          column: 11,
          data: {
            literal: '0 | 0 | 1',
            primitive: 'number',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: "type T = (2 | 'other' | 3) | number;",
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
      code: "type T = '' | string;",
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
      code: `
        type B = 'b';
        type T = B | string;
      `,
      errors: [
        {
          column: 18,
          data: {
            literal: '"b"',
            primitive: 'string',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = `a${number}c` | string;',
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
      code: `
        type B = \`a\${number}c\`;
        type T = B | string;
      `,
      errors: [
        {
          column: 18,
          data: {
            literal: 'template literal type',
            primitive: 'string',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = `${number}` | string;',
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
      code: 'type T = 0n | bigint;',
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
      code: 'type T = -1n | bigint;',
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
      code: 'type T = (-1n | 1n) | bigint;',
      errors: [
        {
          column: 11,
          data: {
            literal: '-1n | 1n',
            primitive: 'bigint',
          },
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
          column: 22,
          data: {
            literal: 'false',
            primitive: 'boolean',
          },
          messageId: 'literalOverridden',
        },
      ],
    },
    {
      code: 'type T = false | boolean;',
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
      code: 'type T = true | boolean;',
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
      code: 'type T = false & boolean;',
      errors: [
        {
          column: 18,
          data: {
            literal: 'false',
            primitive: 'boolean',
          },
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
          column: 22,
          data: {
            literal: 'false',
            primitive: 'boolean',
          },
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
          column: 22,
          data: {
            literal: 'true',
            primitive: 'boolean',
          },
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: 'type T = true & boolean;',
      errors: [
        {
          column: 17,
          data: {
            literal: 'true',
            primitive: 'boolean',
          },
          messageId: 'primitiveOverridden',
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
            literal: '0',
            primitive: 'number',
          },
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: "type T = '' & string;",
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
      code: `
        type B = 0n;
        type T = B & bigint;
      `,
      errors: [
        {
          column: 22,
          data: {
            literal: '0n',
            primitive: 'bigint',
          },
          messageId: 'primitiveOverridden',
        },
      ],
    },
    {
      code: 'type T = 0n & bigint;',
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
      code: 'type T = -1n & bigint;',
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
