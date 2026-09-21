/* eslint-disable @typescript-eslint/internal/plugin-test-formatting -- Prettier doesn't yet support TS 5.6 string literal module identifiers */
/* eslint-disable @typescript-eslint/internal/prefer-ast-types-enum */
import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/naming-convention';
import { getFixturesRootDir } from '../../RuleTester';

const ruleTester = new RuleTester();

// only need parserOptions for the `type` option tests
const rootDir = getFixturesRootDir();
const parserOptions = {
  project: './tsconfig.json',
  projectService: false,
  tsconfigRootDir: rootDir,
};

ruleTester.run('naming-convention', rule, {
  assertionOptions: {
    requireData: true,
  },
  invalid: [
    {
      // make sure we handle no options and apply defaults
      code: 'const x_x = 1;',
      errors: [
        {
          column: 7,
          data: {
            formats: 'camelCase, UPPER_CASE',
            name: 'x_x',
            type: 'Variable',
          },
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'doesNotMatchFormat',
        },
      ],
    },
    {
      // make sure we handle empty options and apply defaults
      code: 'const x_x = 1;',
      errors: [
        {
          column: 7,
          data: {
            formats: 'camelCase, UPPER_CASE',
            name: 'x_x',
            type: 'Variable',
          },
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [],
    },
    {
      code: `
        const child_process = require('child_process');
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'camelCase',
            name: 'child_process',
            type: 'Variable',
          },
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          filter: {
            match: true,
            regex: 'child_process',
          },
          format: ['camelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        declare const any_camelCase01: any;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'UPPER_CASE',
            name: 'any_camelCase01',
            processedName: 'camelCase01',
            type: 'Variable',
          },
          endColumn: 43,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['UPPER_CASE'],
          modifiers: ['const'],
          prefix: ['any_'],
          selector: 'variable',
        },
      ],
    },
    {
      code: `
        declare const any_camelCase02: any | null;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'UPPER_CASE',
            name: 'any_camelCase02',
            processedName: 'camelCase02',
            type: 'Variable',
          },
          endColumn: 50,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['UPPER_CASE'],
          modifiers: ['const'],
          prefix: ['any_'],
          selector: 'variable',
        },
      ],
    },
    {
      code: `
        declare const any_camelCase03: any | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'UPPER_CASE',
            name: 'any_camelCase03',
            processedName: 'camelCase03',
            type: 'Variable',
          },
          endColumn: 62,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['UPPER_CASE'],
          modifiers: ['const'],
          prefix: ['any_'],
          selector: 'variable',
        },
      ],
    },
    {
      code: `
        declare const string_camelCase01: string;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'string_camelCase01',
            processedName: 'camelCase01',
            type: 'Variable',
          },
          endColumn: 49,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['string_'],
          selector: 'variable',
          types: ['string'],
        },
      ],
    },
    {
      code: `
        declare const string_camelCase02: string | null;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'string_camelCase02',
            processedName: 'camelCase02',
            type: 'Variable',
          },
          endColumn: 56,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['string_'],
          selector: 'variable',
          types: ['string'],
        },
      ],
    },
    {
      code: `
        declare const string_camelCase03: string | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'string_camelCase03',
            processedName: 'camelCase03',
            type: 'Variable',
          },
          endColumn: 68,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['string_'],
          selector: 'variable',
          types: ['string'],
        },
      ],
    },
    {
      code: `
        declare const string_camelCase04: 'a' | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'string_camelCase04',
            processedName: 'camelCase04',
            type: 'Variable',
          },
          endColumn: 65,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['string_'],
          selector: 'variable',
          types: ['string'],
        },
      ],
    },
    {
      code: `
        declare const string_camelCase05: string | 'a' | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'string_camelCase05',
            processedName: 'camelCase05',
            type: 'Variable',
          },
          endColumn: 74,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['string_'],
          selector: 'variable',
          types: ['string'],
        },
      ],
    },
    {
      code: `
        declare const number_camelCase06: number;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'number_camelCase06',
            processedName: 'camelCase06',
            type: 'Variable',
          },
          endColumn: 49,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['number_'],
          selector: 'variable',
          types: ['number'],
        },
      ],
    },
    {
      code: `
        declare const number_camelCase07: number | null;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'number_camelCase07',
            processedName: 'camelCase07',
            type: 'Variable',
          },
          endColumn: 56,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['number_'],
          selector: 'variable',
          types: ['number'],
        },
      ],
    },
    {
      code: `
        declare const number_camelCase08: number | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'number_camelCase08',
            processedName: 'camelCase08',
            type: 'Variable',
          },
          endColumn: 68,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['number_'],
          selector: 'variable',
          types: ['number'],
        },
      ],
    },
    {
      code: `
        declare const number_camelCase09: 1 | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'number_camelCase09',
            processedName: 'camelCase09',
            type: 'Variable',
          },
          endColumn: 63,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['number_'],
          selector: 'variable',
          types: ['number'],
        },
      ],
    },
    {
      code: `
        declare const number_camelCase10: number | 2 | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'number_camelCase10',
            processedName: 'camelCase10',
            type: 'Variable',
          },
          endColumn: 72,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['number_'],
          selector: 'variable',
          types: ['number'],
        },
      ],
    },
    {
      code: `
        declare const boolean_camelCase11: boolean;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'boolean_camelCase11',
            processedName: 'camelCase11',
            type: 'Variable',
          },
          endColumn: 51,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['boolean_'],
          selector: 'variable',
          types: ['boolean'],
        },
      ],
    },
    {
      code: `
        declare const boolean_camelCase12: boolean | null;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'boolean_camelCase12',
            processedName: 'camelCase12',
            type: 'Variable',
          },
          endColumn: 58,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['boolean_'],
          selector: 'variable',
          types: ['boolean'],
        },
      ],
    },
    {
      code: `
        declare const boolean_camelCase13: boolean | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'boolean_camelCase13',
            processedName: 'camelCase13',
            type: 'Variable',
          },
          endColumn: 70,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['boolean_'],
          selector: 'variable',
          types: ['boolean'],
        },
      ],
    },
    {
      code: `
        declare const boolean_camelCase14: true | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'boolean_camelCase14',
            processedName: 'camelCase14',
            type: 'Variable',
          },
          endColumn: 67,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['boolean_'],
          selector: 'variable',
          types: ['boolean'],
        },
      ],
    },
    {
      code: `
        declare const boolean_camelCase15: false | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'boolean_camelCase15',
            processedName: 'camelCase15',
            type: 'Variable',
          },
          endColumn: 68,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['boolean_'],
          selector: 'variable',
          types: ['boolean'],
        },
      ],
    },
    {
      code: `
        declare const boolean_camelCase16: true | false | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'boolean_camelCase16',
            processedName: 'camelCase16',
            type: 'Variable',
          },
          endColumn: 75,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['boolean_'],
          selector: 'variable',
          types: ['boolean'],
        },
      ],
    },
    {
      code: `
        declare const function_camelCase1: () => void;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'function_camelCase1',
            processedName: 'camelCase1',
            type: 'Variable',
          },
          endColumn: 54,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['function_'],
          selector: 'variable',
          types: ['function'],
        },
      ],
    },
    {
      code: `
        declare const function_camelCase2: (() => void) | null;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'function_camelCase2',
            processedName: 'camelCase2',
            type: 'Variable',
          },
          endColumn: 63,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['function_'],
          selector: 'variable',
          types: ['function'],
        },
      ],
    },
    {
      code: `
        declare const function_camelCase3: (() => void) | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'function_camelCase3',
            processedName: 'camelCase3',
            type: 'Variable',
          },
          endColumn: 75,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['function_'],
          selector: 'variable',
          types: ['function'],
        },
      ],
    },
    {
      code: `
        declare const function_camelCase4:
          | (() => void)
          | (() => string)
          | null
          | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'function_camelCase4',
            processedName: 'camelCase4',
            type: 'Variable',
          },
          endColumn: 22,
          endLine: 6,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['function_'],
          selector: 'variable',
          types: ['function'],
        },
      ],
    },
    {
      code: `
        declare const array_camelCase1: Array<number>;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'array_camelCase1',
            processedName: 'camelCase1',
            type: 'Variable',
          },
          endColumn: 54,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['array_'],
          selector: 'variable',
          types: ['array'],
        },
      ],
    },
    {
      code: `
        declare const array_camelCase2: ReadonlyArray<number> | null;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'array_camelCase2',
            processedName: 'camelCase2',
            type: 'Variable',
          },
          endColumn: 69,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['array_'],
          selector: 'variable',
          types: ['array'],
        },
      ],
    },
    {
      code: `
        declare const array_camelCase3: number[] | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'array_camelCase3',
            processedName: 'camelCase3',
            type: 'Variable',
          },
          endColumn: 68,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['array_'],
          selector: 'variable',
          types: ['array'],
        },
      ],
    },
    {
      code: `
        declare const array_camelCase4: readonly number[] | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'array_camelCase4',
            processedName: 'camelCase4',
            type: 'Variable',
          },
          endColumn: 77,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['array_'],
          selector: 'variable',
          types: ['array'],
        },
      ],
    },
    {
      code: `
        declare const array_camelCase5:
          | number[]
          | (number | string)[]
          | null
          | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'array_camelCase5',
            processedName: 'camelCase5',
            type: 'Variable',
          },
          endColumn: 22,
          endLine: 6,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['array_'],
          selector: 'variable',
          types: ['array'],
        },
      ],
    },
    {
      code: `
        declare const array_camelCase6: [] | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'array_camelCase6',
            processedName: 'camelCase6',
            type: 'Variable',
          },
          endColumn: 62,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['array_'],
          selector: 'variable',
          types: ['array'],
        },
      ],
    },
    {
      code: `
        declare const array_camelCase7: [number] | null | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'array_camelCase7',
            processedName: 'camelCase7',
            type: 'Variable',
          },
          endColumn: 68,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['array_'],
          selector: 'variable',
          types: ['array'],
        },
      ],
    },
    {
      code: `
        declare const array_camelCase8:
          | readonly number[]
          | Array<string>
          | [boolean]
          | null
          | undefined;
      `,
      errors: [
        {
          column: 23,
          data: {
            formats: 'snake_case',
            name: 'array_camelCase8',
            processedName: 'camelCase8',
            type: 'Variable',
          },
          endColumn: 22,
          endLine: 7,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['snake_case'],
          prefix: ['array_'],
          selector: 'variable',
          types: ['array'],
        },
      ],
    },
    {
      code: `
        let unused_foo = 'a';
      `,
      errors: [
        {
          column: 13,
          data: {
            name: 'unused_foo',
            regex: '/^unused_\\w/u',
            regexMatch: 'not match',
            type: 'Variable',
          },
          endColumn: 23,
          endLine: 2,
          line: 2,
          messageId: 'satisfyCustom',
        },
      ],
      options: [
        {
          custom: {
            match: false,
            regex: /^unused_\w/.source,
          },
          format: ['snake_case'],
          leadingUnderscore: 'allow',
          selector: 'default',
        },
      ],
    },
    {
      code: `
        const _unused_foo = 1;
      `,
      errors: [
        {
          column: 15,
          data: {
            name: '_unused_foo',
            regex: '/^unused_\\w/u',
            regexMatch: 'not match',
            type: 'Variable',
          },
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'satisfyCustom',
        },
      ],
      options: [
        {
          custom: {
            match: false,
            regex: /^unused_\w/.source,
          },
          format: ['snake_case'],
          leadingUnderscore: 'allow',
          selector: 'default',
        },
      ],
    },
    {
      code: `
        interface IFoo {}
      `,
      errors: [
        {
          column: 19,
          data: {
            name: 'IFoo',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
            type: 'Interface',
          },
          endColumn: 23,
          endLine: 2,
          line: 2,
          messageId: 'satisfyCustom',
        },
      ],
      options: [
        {
          custom: {
            match: false,
            regex: /^I[A-Z]/.source,
          },
          format: ['PascalCase'],
          selector: 'typeLike',
        },
      ],
    },
    {
      code: `
        class IBar {}
      `,
      errors: [
        {
          column: 15,
          data: {
            name: 'IBar',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
            type: 'Class',
          },
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'satisfyCustom',
        },
      ],
      options: [
        {
          custom: {
            match: false,
            regex: /^I[A-Z]/.source,
          },
          format: ['PascalCase'],
          selector: 'typeLike',
        },
      ],
    },
    {
      code: `
        function fooBar() {}
      `,
      errors: [
        {
          column: 18,
          data: {
            name: 'fooBar',
            regex: '/function/u',
            regexMatch: 'match',
            type: 'Function',
          },
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'satisfyCustom',
        },
      ],
      options: [
        {
          custom: {
            match: true,
            regex: /function/.source,
          },
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: 'function',
        },
      ],
    },
    {
      code: `
        let unused_foo = 'a';
      `,
      errors: [
        {
          column: 13,
          data: {
            formats: 'camelCase',
            name: 'unused_foo',
            type: 'Variable',
          },
          endColumn: 23,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: ['variable', 'function'],
        },
      ],
    },
    {
      code: `
        const _unused_foo = 1;
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'camelCase',
            name: '_unused_foo',
            processedName: 'unused_foo',
            type: 'Variable',
          },
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      options: [
        {
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: ['variable', 'function'],
        },
      ],
    },
    {
      code: `
        function foo_bar() {}
      `,
      errors: [
        {
          column: 18,
          data: {
            formats: 'camelCase',
            name: 'foo_bar',
            type: 'Function',
          },
          endColumn: 25,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: ['variable', 'function'],
        },
      ],
    },
    {
      code: `
        interface IFoo {}
      `,
      errors: [
        {
          column: 19,
          data: {
            name: 'IFoo',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
            type: 'Interface',
          },
          endColumn: 23,
          endLine: 2,
          line: 2,
          messageId: 'satisfyCustom',
        },
      ],
      options: [
        {
          custom: {
            match: false,
            regex: /^I[A-Z]/.source,
          },
          format: ['PascalCase'],
          selector: ['class', 'interface'],
        },
      ],
    },
    {
      code: `
        class IBar {}
      `,
      errors: [
        {
          column: 15,
          data: {
            name: 'IBar',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
            type: 'Class',
          },
          endColumn: 19,
          endLine: 2,
          line: 2,
          messageId: 'satisfyCustom',
        },
      ],
      options: [
        {
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: ['variable', 'function'],
        },
        {
          custom: {
            match: false,
            regex: /^I[A-Z]/.source,
          },
          format: ['PascalCase'],
          selector: ['class', 'interface'],
        },
      ],
    },
    {
      code: `
        const foo = {
          'Property Name': 'asdf',
        };
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'strictCamelCase',
            name: 'Property Name',
            type: 'Object Literal Property',
          },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          filter: {
            match: false,
            regex: /-/.source,
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        const myfoo_bar = 'abcs';
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'PascalCase',
            name: 'myfoo_bar',
            processedName: 'foo_bar',
            type: 'Variable',
          },
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          prefix: ['my', 'My'],
          selector: ['variable', 'property', 'parameter'],
          types: ['string'],
        },
      ],
    },
    {
      code: `
        function fun(myfoo: string) {}
      `,
      errors: [
        {
          column: 22,
          data: {
            formats: 'PascalCase',
            name: 'myfoo',
            processedName: 'foo',
            type: 'Parameter',
          },
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          prefix: ['my', 'My'],
          selector: ['variable', 'property', 'parameter'],
          types: ['string'],
        },
      ],
    },
    {
      code: `
        class foo {
          Myfoo: string;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'PascalCase',
            name: 'Myfoo',
            processedName: 'foo',
            type: 'Class Property',
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          prefix: ['my', 'My'],
          selector: ['variable', 'property', 'parameter'],
          types: ['string'],
        },
      ],
    },
    {
      code: `
        class foo {
          private readonly fooBar: boolean;
        }
      `,
      errors: [
        {
          column: 28,
          data: {
            formats: 'PascalCase',
            name: 'fooBar',
            type: 'Class Property',
          },
          endColumn: 34,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          modifiers: ['private', 'readonly'],
          selector: ['property', 'accessor'],
        },
      ],
    },
    {
      code: `
        function my_foo_bar() {}
      `,
      errors: [
        {
          column: 18,
          data: {
            formats: 'PascalCase',
            name: 'my_foo_bar',
            processedName: '_foo_bar',
            type: 'Function',
          },
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormatTrimmed',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          prefix: ['my', 'My'],
          selector: ['variable', 'function'],
          types: ['string'],
        },
      ],
    },
    {
      code: `
        class SomeClass {
          static otherConstant = 'hello';
        }

        export const { otherConstant } = SomeClass;
      `,
      errors: [
        {
          column: 18,
          data: {
            formats: 'PascalCase',
            name: 'otherConstant',
            type: 'Class Property',
          },
          endColumn: 31,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        { format: ['PascalCase'], selector: 'property' },
        { format: ['camelCase'], selector: 'variable' },
      ],
    },
    {
      code: `
        declare class Foo {
          Bar(Baz: string): void;
        }
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'camelCase',
            name: 'Baz',
            type: 'Parameter',
          },
          endColumn: 26,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [{ format: ['camelCase'], selector: 'parameter' }],
    },
    {
      code: `
        export const PascalCaseVar = 1;
      `,
      errors: [
        {
          column: 22,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseVar',
            type: 'Variable',
          },
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        export enum PascalCaseEnum {}
      `,
      errors: [
        {
          column: 21,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseEnum',
            type: 'Enum',
          },
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        export class PascalCaseClass {}
      `,
      errors: [
        {
          column: 22,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseClass',
            type: 'Class',
          },
          endColumn: 37,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        export function PascalCaseFunction() {}
      `,
      errors: [
        {
          column: 25,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseFunction',
            type: 'Function',
          },
          endColumn: 43,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        export interface PascalCaseInterface {}
      `,
      errors: [
        {
          column: 26,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseInterface',
            type: 'Interface',
          },
          endColumn: 45,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        export type PascalCaseType = {};
      `,
      errors: [
        {
          column: 21,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseType',
            type: 'Type Alias',
          },
          endColumn: 35,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        const PascalCaseVar = 1;
        export { PascalCaseVar };
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseVar',
            type: 'Variable',
          },
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        { format: ['snake_case'], selector: 'default' },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        enum PascalCaseEnum {}
        export { PascalCaseEnum };
      `,
      errors: [
        {
          column: 14,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseEnum',
            type: 'Enum',
          },
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        { format: ['snake_case'], selector: 'default' },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        class PascalCaseClass {}
        export { PascalCaseClass };
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseClass',
            type: 'Class',
          },
          endColumn: 30,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        { format: ['snake_case'], selector: 'default' },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        function PascalCaseFunction() {}
        export { PascalCaseFunction };
      `,
      errors: [
        {
          column: 18,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseFunction',
            type: 'Function',
          },
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        { format: ['snake_case'], selector: 'default' },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        interface PascalCaseInterface {}
        export { PascalCaseInterface };
      `,
      errors: [
        {
          column: 19,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseInterface',
            type: 'Interface',
          },
          endColumn: 38,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        { format: ['snake_case'], selector: 'default' },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        type PascalCaseType = {};
        export { PascalCaseType };
      `,
      errors: [
        {
          column: 14,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseType',
            type: 'Type Alias',
          },
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        { format: ['snake_case'], selector: 'default' },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['camelCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        const PascalCaseVar = 1;
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseVar',
            type: 'Variable',
          },
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        { format: ['snake_case'], selector: 'default' },
        {
          format: ['camelCase'],
          modifiers: ['global'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['global'],
          selector: 'function',
        },
      ],
    },
    {
      code: `
        function PascalCaseFunction() {}
      `,
      errors: [
        {
          column: 18,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseFunction',
            type: 'Function',
          },
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        { format: ['snake_case'], selector: 'default' },
        {
          format: ['camelCase'],
          modifiers: ['global'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['global'],
          selector: 'function',
        },
      ],
    },
    {
      code: `
        declare function PascalCaseDeclaredFunction();
      `,
      errors: [
        {
          column: 26,
          data: {
            formats: 'camelCase',
            name: 'PascalCaseDeclaredFunction',
            type: 'Function',
          },
          endColumn: 52,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        { format: ['snake_case'], selector: 'default' },
        {
          format: ['camelCase'],
          modifiers: ['global'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          modifiers: ['global'],
          selector: 'function',
        },
      ],
    },
    {
      code: `
        const { some_name1 } = {};
        const { ignored: IgnoredDueToModifiers1 } = {};
        const { ignored: IgnoredDueToModifiers2 = 3 } = {};
        const IgnoredDueToModifiers3 = 1;
      `,
      errors: [
        {
          column: 17,
          data: {
            formats: 'UPPER_CASE',
            name: 'some_name1',
            type: 'Variable',
          },
          endColumn: 27,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['UPPER_CASE'],
          modifiers: ['destructured'],
          selector: 'variable',
        },
      ],
    },
    {
      code: `
        const { some_name2 = 2 } = {};
        const { ignored: IgnoredDueToModifiers1 } = {};
        const { ignored: IgnoredDueToModifiers2 = 3 } = {};
        const IgnoredDueToModifiers3 = 1;
      `,
      errors: [
        {
          column: 17,
          data: {
            formats: 'UPPER_CASE',
            name: 'some_name2',
            type: 'Variable',
          },
          endColumn: 27,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['UPPER_CASE'],
          modifiers: ['destructured'],
          selector: 'variable',
        },
      ],
    },
    {
      code: `
        export function Foo(
          { aName },
          { ignored: IgnoredDueToModifiers1 },
          { ignored: IgnoredDueToModifiers1 = 2 },
          IgnoredDueToModifiers2,
        ) {}
      `,
      errors: [
        {
          column: 13,
          data: {
            formats: 'UPPER_CASE',
            name: 'aName',
            type: 'Parameter',
          },
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['UPPER_CASE'],
          modifiers: ['destructured'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: `
        export function Foo(
          { anotherName = 1 },
          { ignored: IgnoredDueToModifiers1 },
          { ignored: IgnoredDueToModifiers1 = 2 },
          IgnoredDueToModifiers2,
        ) {}
      `,
      errors: [
        {
          column: 13,
          data: {
            formats: 'UPPER_CASE',
            name: 'anotherName',
            type: 'Parameter',
          },
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['UPPER_CASE'],
          modifiers: ['destructured'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: `
        class Ignored {
          private static abstract readonly some_name;
          IgnoredDueToModifiers = 1;
        }
      `,
      errors: [
        {
          column: 44,
          data: {
            formats: 'UPPER_CASE',
            name: 'some_name',
            type: 'Class Property',
          },
          endColumn: 53,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['UPPER_CASE'],
          modifiers: ['static', 'readonly'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: `
        class Ignored {
          constructor(
            private readonly some_name,
            IgnoredDueToModifiers,
          ) {}
        }
      `,
      errors: [
        {
          column: 30,
          data: {
            formats: 'UPPER_CASE',
            name: 'some_name',
            type: 'Parameter Property',
          },
          endColumn: 39,
          endLine: 4,
          line: 4,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['UPPER_CASE'],
          modifiers: ['readonly'],
          selector: 'parameterProperty',
        },
      ],
    },
    {
      code: `
        class Ignored {
          private static some_name() {}
          IgnoredDueToModifiers() {}
        }
      `,
      errors: [
        {
          column: 26,
          data: {
            formats: 'UPPER_CASE',
            name: 'some_name',
            type: 'Class Method',
          },
          endColumn: 35,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['UPPER_CASE'],
          modifiers: ['static'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: `
        class Ignored {
          private static get some_name() {}
          get IgnoredDueToModifiers() {}
        }
      `,
      errors: [
        {
          column: 30,
          data: {
            formats: 'UPPER_CASE',
            name: 'some_name',
            type: 'Classic Accessor',
          },
          endColumn: 39,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['UPPER_CASE'],
          modifiers: ['private', 'static'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: `
        abstract class some_name {}
        class IgnoredDueToModifier {}
      `,
      errors: [
        {
          column: 24,
          data: {
            formats: 'UPPER_CASE',
            name: 'some_name',
            type: 'Class',
          },
          endColumn: 33,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['UPPER_CASE'],
          modifiers: ['abstract'],
          selector: 'class',
        },
      ],
    },
    {
      code: `
        const UnusedVar = 1;
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'snake_case',
            name: 'UnusedVar',
            type: 'Variable',
          },
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['unused'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        function UnusedFunc(
          // this line is intentionally broken out
          unused_param: string,
        ) {}
      `,
      errors: [
        {
          column: 18,
          data: {
            formats: 'snake_case',
            name: 'UnusedFunc',
            type: 'Function',
          },
          endColumn: 28,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['unused'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        function unused_func(
          // this line is intentionally broken out
          UnusedParam: string,
        ) {}
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'snake_case',
            name: 'UnusedParam',
            type: 'Parameter',
          },
          endColumn: 30,
          endLine: 4,
          line: 4,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['unused'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        class UnusedClass {}
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'snake_case',
            name: 'UnusedClass',
            type: 'Class',
          },
          endColumn: 26,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['unused'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        interface UnusedInterface {}
      `,
      errors: [
        {
          column: 19,
          data: {
            formats: 'snake_case',
            name: 'UnusedInterface',
            type: 'Interface',
          },
          endColumn: 34,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['unused'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        type UnusedType<
          // this line is intentionally broken out
          unused_type_param,
        > = {};
      `,
      errors: [
        {
          column: 14,
          data: {
            formats: 'snake_case',
            name: 'UnusedType',
            type: 'Type Alias',
          },
          endColumn: 24,
          endLine: 2,
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['unused'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        type unused_type<
          // this line is intentionally broken out
          UnusedTypeParam,
        > = {};
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'snake_case',
            name: 'UnusedTypeParam',
            type: 'Type Parameter',
          },
          endColumn: 26,
          endLine: 4,
          line: 4,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['unused'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        const ignored1 = {
          'a a': 1,
        };
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'PascalCase',
            name: 'a a',
            type: 'Object Literal Property',
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        const ignored1 = {
          'b b'() {},
        };
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'PascalCase',
            name: 'b b',
            type: 'Object Literal Method',
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        const ignored1 = {
          get 'c c'() {
            return 1;
          },
        };
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'PascalCase',
            name: 'c c',
            type: 'Classic Accessor',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        const ignored1 = {
          set 'd d'(value: string) {},
        };
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'PascalCase',
            name: 'd d',
            type: 'Classic Accessor',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        class ignored2 {
          'a a' = 1;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'PascalCase',
            name: 'a a',
            type: 'Class Property',
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        class ignored2 {
          'b b'() {}
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'PascalCase',
            name: 'b b',
            type: 'Class Method',
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        class ignored2 {
          get 'c c'() {
            return 1;
          }
        }
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'PascalCase',
            name: 'c c',
            type: 'Classic Accessor',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        class ignored2 {
          set 'd d'(value: string) {}
        }
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'PascalCase',
            name: 'd d',
            type: 'Classic Accessor',
          },
          endColumn: 20,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        interface ignored3 {
          'a a': 1;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'PascalCase',
            name: 'a a',
            type: 'Type Property',
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        interface ignored3 {
          'b b'(): void;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'PascalCase',
            name: 'b b',
            type: 'Type Method',
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        type ignored4 = {
          'a a': 1;
        };
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'PascalCase',
            name: 'a a',
            type: 'Type Property',
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        type ignored4 = {
          'b b'(): void;
        };
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'PascalCase',
            name: 'b b',
            type: 'Type Method',
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        enum ignored5 {
          'a a',
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'PascalCase',
            name: 'a a',
            type: 'Enum Member',
          },
          endColumn: 16,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: noFormat`
        type Foo = {
          'foo     Bar': string;
        };
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'camelCase',
            name: 'foo     Bar',
            type: 'Type Property',
          },
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
    },
    {
      code: noFormat`
        type Foo = {
          '': string;
        };
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'camelCase',
            name: '',
            type: 'Type Property',
          },
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
    },
    {
      code: noFormat`
        type Foo = {
          '0': string;
        };
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'camelCase',
            name: '0',
            type: 'Type Property',
          },
          endColumn: 14,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
    },
    {
      code: noFormat`
        type Foo = {
          'foo': string;
          'foo-bar': string;
        };
      `,
      // only 'foo-bar' is reported because 'foo' is valid
      errors: [
        {
          column: 11,
          data: {
            formats: 'camelCase',
            name: 'foo-bar',
            type: 'Type Property',
          },
          endColumn: 20,
          endLine: 4,
          line: 4,
          messageId: 'doesNotMatchFormat',
        },
      ],
    },
    {
      code: noFormat`
        type Foo = {
          '#foo-bar': string;
        };
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'camelCase',
            name: '#foo-bar',
            type: 'Type Property',
          },
          endColumn: 21,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
    },
    {
      code: noFormat`
        interface Bar {
          'boo-----foo': string;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'camelCase',
            name: 'boo-----foo',
            type: 'Type Property',
          },
          endColumn: 24,
          endLine: 3,
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
    },
    {
      code: `
        class foo {
          public Bar() {
            return 42;
          }
          public async async_bar() {
            return 42;
          }
          // ❌ error
          public async asyncBar() {
            return 42;
          }
        }
      `,
      errors: [
        {
          column: 24,
          data: {
            formats: 'snake_case',
            name: 'asyncBar',
            type: 'Class Method',
          },
          endColumn: 32,
          endLine: 10,
          line: 10,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['PascalCase'],
          selector: 'method',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['method', 'objectLiteralMethod'],
        },
      ],
    },
    {
      code: `
        class foo {
          public Bar() {
            return 42;
          }
          public async async_bar() {
            return 42;
          }
          // ❌ error
          public AsyncBar2 = async () => {
            return 42;
          };
        }
      `,
      errors: [
        {
          column: 18,
          data: {
            formats: 'snake_case',
            name: 'AsyncBar2',
            type: 'Class Method',
          },
          endColumn: 27,
          endLine: 10,
          line: 10,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['PascalCase'],
          selector: 'method',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['method', 'objectLiteralMethod'],
        },
      ],
    },
    {
      code: `
        class foo {
          public Bar() {
            return 42;
          }
          public async async_bar() {
            return 42;
          }
          // ❌ error
          public AsyncBar3 = async function () {
            return 42;
          };
        }
      `,
      errors: [
        {
          column: 18,
          data: {
            formats: 'snake_case',
            name: 'AsyncBar3',
            type: 'Class Method',
          },
          endColumn: 27,
          endLine: 10,
          line: 10,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['PascalCase'],
          selector: 'method',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['method', 'objectLiteralMethod'],
        },
      ],
    },
    {
      code: `
        abstract class foo {
          public abstract Bar(): number;
          public abstract async async_bar(): number;
          // ❌ error
          public abstract async ASYNC_BAR(): number;
        }
      `,
      errors: [
        {
          column: 33,
          data: {
            formats: 'snake_case',
            name: 'ASYNC_BAR',
            type: 'Class Method',
          },
          endColumn: 42,
          endLine: 6,
          line: 6,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['PascalCase'],
          selector: 'method',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['method', 'objectLiteralMethod'],
        },
      ],
    },
    {
      code: `
        const obj = {
          Bar() {
            return 42;
          },
          async async_bar() {
            return 42;
          },
          // ❌ error
          async AsyncBar() {
            return 42;
          },
        };
      `,
      errors: [
        {
          column: 17,
          data: {
            formats: 'snake_case',
            name: 'AsyncBar',
            type: 'Object Literal Method',
          },
          endColumn: 25,
          endLine: 10,
          line: 10,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['PascalCase'],
          selector: 'method',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['method', 'objectLiteralMethod'],
        },
      ],
    },
    {
      code: `
        const obj = {
          Bar() {
            return 42;
          },
          async async_bar() {
            return 42;
          },
          // ❌ error
          AsyncBar2: async () => {
            return 42;
          },
        };
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'snake_case',
            name: 'AsyncBar2',
            type: 'Object Literal Method',
          },
          endColumn: 20,
          endLine: 10,
          line: 10,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['PascalCase'],
          selector: 'method',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['method', 'objectLiteralMethod'],
        },
      ],
    },
    {
      code: `
        const obj = {
          Bar() {
            return 42;
          },
          async async_bar() {
            return 42;
          },
          // ❌ error
          AsyncBar3: async function () {
            return 42;
          },
        };
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'snake_case',
            name: 'AsyncBar3',
            type: 'Object Literal Method',
          },
          endColumn: 20,
          endLine: 10,
          line: 10,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['PascalCase'],
          selector: 'method',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['method', 'objectLiteralMethod'],
        },
      ],
    },
    {
      code: `
        const syncbar1 = () => {};
        function syncBar2() {}
        const syncBar3 = function syncBar4() {};

        // ❌ error
        const AsyncBar1 = async () => {};
        const async_bar1 = async () => {};
        const async_bar3 = async function async_bar4() {};
        async function async_bar2() {}
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'snake_case',
            name: 'AsyncBar1',
            type: 'Variable',
          },
          endColumn: 24,
          endLine: 7,
          line: 7,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'variableLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['variableLike'],
        },
      ],
    },
    {
      code: `
        const syncbar1 = () => {};
        function syncBar2() {}
        const syncBar3 = function syncBar4() {};

        const async_bar1 = async () => {};
        const async_bar3 = async function async_bar4() {};
        async function async_bar2() {}
        // ❌ error
        const asyncBar5 = async function async_bar6() {};
      `,
      errors: [
        {
          column: 15,
          data: {
            formats: 'snake_case',
            name: 'asyncBar5',
            type: 'Variable',
          },
          endColumn: 24,
          endLine: 10,
          line: 10,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'variableLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['variableLike'],
        },
      ],
    },
    {
      code: `
        const syncbar1 = () => {};
        function syncBar2() {}
        const syncBar3 = function syncBar4() {};

        const async_bar1 = async () => {};
        // ❌ error
        async function asyncBar2() {}
      `,
      errors: [
        {
          column: 24,
          data: {
            formats: 'snake_case',
            name: 'asyncBar2',
            type: 'Function',
          },
          endColumn: 33,
          endLine: 8,
          line: 8,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'variableLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['variableLike'],
        },
      ],
    },
    {
      code: `
        const syncbar1 = () => {};
        function syncBar2() {}
        const syncBar3 = function syncBar4() {};

        const async_bar1 = async () => {};
        const async_bar3 = async function async_bar4() {};
        async function async_bar2() {}
        // ❌ error
        const async_bar3 = async function ASYNC_BAR4() {};
      `,
      errors: [
        {
          column: 43,
          data: {
            formats: 'snake_case',
            name: 'ASYNC_BAR4',
            type: 'Function',
          },
          endColumn: 53,
          endLine: 10,
          line: 10,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'variableLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['variableLike'],
        },
      ],
    },
    {
      code: `
        class foo extends bar {
          public someAttribute = 1;
          public override some_attribute_override = 1;
          // ❌ error
          public override someAttributeOverride = 1;
        }
      `,
      errors: [
        {
          column: 27,
          data: {
            formats: 'snake_case',
            name: 'someAttributeOverride',
            type: 'Class Property',
          },
          endColumn: 48,
          endLine: 6,
          line: 6,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['override'],
          selector: ['memberLike'],
        },
      ],
    },
    {
      code: `
        class foo extends bar {
          public override some_method_override() {
            return 42;
          }
          // ❌ error
          public override someMethodOverride() {
            return 42;
          }
        }
      `,
      errors: [
        {
          column: 27,
          data: {
            formats: 'snake_case',
            name: 'someMethodOverride',
            type: 'Class Method',
          },
          endColumn: 45,
          endLine: 7,
          line: 7,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['override'],
          selector: ['memberLike'],
        },
      ],
    },
    {
      code: `
        class foo extends bar {
          public get someGetter(): string;
          public override get some_getter_override(): string;
          // ❌ error
          public override get someGetterOverride(): string;
        }
      `,
      errors: [
        {
          column: 31,
          data: {
            formats: 'snake_case',
            name: 'someGetterOverride',
            type: 'Classic Accessor',
          },
          endColumn: 49,
          endLine: 6,
          line: 6,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['override'],
          selector: ['memberLike'],
        },
      ],
    },
    {
      code: `
        class foo extends bar {
          public set someSetter(val: string);
          public override set some_setter_override(val: string);
          // ❌ error
          public override set someSetterOverride(val: string);
        }
      `,
      errors: [
        {
          column: 31,
          data: {
            formats: 'snake_case',
            name: 'someSetterOverride',
            type: 'Classic Accessor',
          },
          endColumn: 49,
          endLine: 6,
          line: 6,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['override'],
          selector: ['memberLike'],
        },
      ],
    },
    {
      code: `
        class foo {
          private firstPrivateField = 1;
          // ❌ error
          private first_private_field = 1;
        }
      `,
      errors: [
        {
          column: 19,
          data: {
            formats: 'camelCase',
            name: 'first_private_field',
            type: 'Class Property',
          },
          endColumn: 38,
          endLine: 5,
          line: 5,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['#private'],
          selector: ['memberLike'],
        },
      ],
    },
    {
      code: `
        class foo {
          // ❌ error
          #secondPrivateField = 1;
          #second_private_field = 1;
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'snake_case',
            name: 'secondPrivateField',
            type: 'Class Property',
          },
          endColumn: 30,
          endLine: 4,
          line: 4,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['#private'],
          selector: ['memberLike'],
        },
      ],
    },
    {
      code: `
        class foo {
          private firstPrivateMethod() {}
          // ❌ error
          private first_private_method() {}
        }
      `,
      errors: [
        {
          column: 19,
          data: {
            formats: 'camelCase',
            name: 'first_private_method',
            type: 'Class Method',
          },
          endColumn: 39,
          endLine: 5,
          line: 5,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['#private'],
          selector: ['memberLike'],
        },
      ],
    },
    {
      code: `
        class foo {
          // ❌ error
          #secondPrivateMethod() {}
          #second_private_method() {}
        }
      `,
      errors: [
        {
          column: 11,
          data: {
            formats: 'snake_case',
            name: 'secondPrivateMethod',
            type: 'Class Method',
          },
          endColumn: 31,
          endLine: 4,
          line: 4,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['#private'],
          selector: ['memberLike'],
        },
      ],
    },
    {
      code: "import * as fooBar from 'foo_bar';",
      errors: [
        {
          column: 13,
          data: {
            formats: 'PascalCase',
            name: 'fooBar',
            type: 'Import',
          },
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: ['import'],
        },
        {
          format: ['PascalCase'],
          modifiers: ['namespace'],
          selector: ['import'],
        },
      ],
    },
    {
      code: "import FooBar from 'foo_bar';",
      errors: [
        {
          column: 8,
          data: {
            formats: 'camelCase',
            name: 'FooBar',
            type: 'Import',
          },
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: ['import'],
        },
        {
          format: ['PascalCase'],
          modifiers: ['namespace'],
          selector: ['import'],
        },
      ],
    },
    {
      code: "import { default as foo_bar } from 'foo_bar';",
      errors: [
        {
          column: 21,
          data: {
            formats: 'camelCase',
            name: 'foo_bar',
            type: 'Import',
          },
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: ['import'],
        },
        {
          format: ['PascalCase'],
          modifiers: ['namespace'],
          selector: ['import'],
        },
      ],
    },
    {
      code: 'import { "🍎" as foo } from \'foo_bar\';',
      errors: [
        {
          column: 18,
          data: {
            formats: 'PascalCase',
            name: 'foo',
            type: 'Import',
          },
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'doesNotMatchFormat',
        },
      ],
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          selector: ['import'],
        },
      ],
    },
  ],
  valid: [
    {
      code: `
        const child_process = require('child_process');
      `,
      languageOptions: { parserOptions },
      options: [
        {
          filter: {
            match: false,
            regex: 'child_process',
          },
          format: ['camelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        declare const ANY_UPPER_CASE: any;
        declare const ANY_UPPER_CASE: any | null;
        declare const ANY_UPPER_CASE: any | null | undefined;

        declare const string_camelCase: string;
        declare const string_camelCase: string | null;
        declare const string_camelCase: string | null | undefined;
        declare const string_camelCase: 'a' | null | undefined;
        declare const string_camelCase: string | 'a' | null | undefined;

        declare const number_camelCase: number;
        declare const number_camelCase: number | null;
        declare const number_camelCase: number | null | undefined;
        declare const number_camelCase: 1 | null | undefined;
        declare const number_camelCase: number | 2 | null | undefined;

        declare const boolean_camelCase: boolean;
        declare const boolean_camelCase: boolean | null;
        declare const boolean_camelCase: boolean | null | undefined;
        declare const boolean_camelCase: true | null | undefined;
        declare const boolean_camelCase: false | null | undefined;
        declare const boolean_camelCase: true | false | null | undefined;
      `,
      languageOptions: { parserOptions },
      options: [
        {
          format: ['UPPER_CASE'],
          modifiers: ['const'],
          prefix: ['ANY_'],
          selector: 'variable',
        },
        {
          format: ['camelCase'],
          prefix: ['string_'],
          selector: 'variable',
          types: ['string'],
        },
        {
          format: ['camelCase'],
          prefix: ['number_'],
          selector: 'variable',
          types: ['number'],
        },
        {
          format: ['camelCase'],
          prefix: ['boolean_'],
          selector: 'variable',
          types: ['boolean'],
        },
      ],
    },
    {
      code: `
        let foo = 'a';
        const _foo = 1;
        interface Foo {}
        class Bar {}
        function foo_function_bar() {}
      `,
      options: [
        {
          custom: {
            match: false,
            regex: /^unused_\w/.source,
          },
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: 'default',
        },
        {
          custom: {
            match: false,
            regex: /^I[A-Z]/.source,
          },
          format: ['PascalCase'],
          selector: 'typeLike',
        },
        {
          custom: {
            match: true,
            regex: /_function_/.source,
          },
          format: ['snake_case'],
          leadingUnderscore: 'allow',
          selector: 'function',
        },
      ],
    },
    {
      code: `
        let foo = 'a';
        const _foo = 1;
        interface foo {}
        class bar {}
        function fooFunctionBar() {}
        function _fooFunctionBar() {}
      `,
      options: [
        {
          custom: {
            match: false,
            regex: /^unused_\w/.source,
          },
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          selector: ['default', 'typeLike', 'function'],
        },
      ],
    },
    {
      code: `
        const match = 'test'.match(/test/);
        const [, key, value] = match;
      `,
      options: [
        {
          format: ['camelCase'],
          selector: 'default',
        },
      ],
    },
    // no format selector
    {
      code: 'const snake_case = 1;',
      options: [
        {
          format: ['camelCase'],
          selector: 'default',
        },
        {
          format: null,
          selector: 'variable',
        },
      ],
    },
    {
      code: 'const snake_case = 1;',
      options: [
        {
          format: ['camelCase'],
          selector: 'default',
        },
        {
          format: [],
          selector: 'variable',
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/1478
    {
      code: `
        const child_process = require('child_process');
      `,
      options: [
        { format: ['camelCase', 'UPPER_CASE'], selector: 'variable' },
        {
          filter: 'child_process',
          format: ['snake_case'],
          selector: 'variable',
        },
      ],
    },
    {
      code: `
        const foo = {
          'Property-Name': 'asdf',
        };
      `,
      options: [
        {
          filter: {
            match: false,
            regex: /-/.source,
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        const foo = {
          'Property-Name': 'asdf',
        };
      `,
      options: [
        {
          filter: {
            match: false,
            regex: /^(Property-Name)$/.source,
          },
          format: ['strictCamelCase'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        let isFoo = 1;
        class foo {
          shouldBoo: number;
        }
      `,
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
          selector: ['variable', 'parameter', 'property', 'accessor'],
          types: ['number'],
        },
      ],
    },
    {
      code: `
        class foo {
          private readonly FooBoo: boolean;
        }
      `,
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          modifiers: ['private', 'readonly'],
          selector: ['property', 'accessor'],
          types: ['boolean'],
        },
      ],
    },
    {
      code: `
        class foo {
          private fooBoo: number;
        }
      `,
      options: [
        {
          format: ['camelCase'],
          modifiers: ['private'],
          selector: ['property', 'accessor'],
        },
      ],
    },
    {
      code: `
        const isfooBar = 1;
        function fun(goodfunFoo: number) {}
        class foo {
          private VanFooBar: number;
        }
      `,
      languageOptions: { parserOptions },
      options: [
        {
          format: ['StrictPascalCase'],
          modifiers: ['private'],
          prefix: ['Van'],
          selector: ['property', 'accessor'],
        },
        {
          format: ['camelCase'],
          prefix: ['is', 'good'],
          selector: ['variable', 'parameter'],
          types: ['number'],
        },
      ],
    },
    {
      code: `
        class SomeClass {
          static OtherConstant = 'hello';
        }

        export const { OtherConstant: otherConstant } = SomeClass;
      `,
      options: [
        { format: ['PascalCase'], selector: 'property' },
        { format: ['camelCase'], selector: 'variable' },
      ],
    },
    // treat properties with function expressions as typeMethod
    {
      code: `
        interface SOME_INTERFACE {
          SomeMethod: () => void;

          some_property: string;
        }
      `,
      options: [
        {
          format: ['UPPER_CASE'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          selector: 'typeMethod',
        },
        {
          format: ['snake_case'],
          selector: 'typeProperty',
        },
      ],
    },
    {
      code: `
        type Ignored = {
          ignored_due_to_modifiers: string;
          readonly FOO: string;
        };
      `,
      languageOptions: { parserOptions },
      options: [
        {
          format: ['UPPER_CASE'],
          modifiers: ['readonly'],
          selector: 'typeProperty',
        },
      ],
    },
    {
      code: `
        const camelCaseVar = 1;
        enum camelCaseEnum {}
        class camelCaseClass {}
        function camelCaseFunction() {}
        interface camelCaseInterface {}
        type camelCaseType = {};
        export const PascalCaseVar = 1;
        export enum PascalCaseEnum {}
        export class PascalCaseClass {}
        export function PascalCaseFunction() {}
        export interface PascalCaseInterface {}
        export type PascalCaseType = {};
      `,
      options: [
        { format: ['camelCase'], selector: 'default' },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        const camelCaseVar = 1;
        enum camelCaseEnum {}
        class camelCaseClass {}
        function camelCaseFunction() {}
        interface camelCaseInterface {}
        type camelCaseType = {};
        const PascalCaseVar = 1;
        enum PascalCaseEnum {}
        class PascalCaseClass {}
        function PascalCaseFunction() {}
        interface PascalCaseInterface {}
        type PascalCaseType = {};
        export {
          PascalCaseVar,
          PascalCaseEnum,
          PascalCaseClass,
          PascalCaseFunction,
          PascalCaseInterface,
          PascalCaseType,
        };
      `,
      options: [
        { format: ['camelCase'], selector: 'default' },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'variable',
        },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'function',
        },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'class',
        },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'interface',
        },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'typeAlias',
        },
        {
          format: ['PascalCase'],
          modifiers: ['exported'],
          selector: 'enum',
        },
      ],
    },
    {
      code: `
        {
          const camelCaseVar = 1;
          function camelCaseFunction() {}
          declare function camelCaseDeclaredFunction();
        }
        const PascalCaseVar = 1;
        function PascalCaseFunction() {}
        declare function PascalCaseDeclaredFunction();
      `,
      options: [
        { format: ['camelCase'], selector: 'default' },
        {
          format: ['PascalCase'],
          modifiers: ['global'],
          selector: 'variable',
        },
        {
          format: ['PascalCase'],
          modifiers: ['global'],
          selector: 'function',
        },
      ],
    },
    {
      code: `
        const { some_name1 } = {};
        const { ignore: IgnoredDueToModifiers1 } = {};
        const { some_name2 = 2 } = {};
        const IgnoredDueToModifiers2 = 1;
      `,
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['destructured'],
          selector: 'variable',
        },
      ],
    },
    {
      code: `
        const { some_name1 } = {};
        const { ignore: IgnoredDueToModifiers1 } = {};
        const { some_name2 = 2 } = {};
        const IgnoredDueToModifiers2 = 1;
      `,
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: null,
          modifiers: ['destructured'],
          selector: 'variable',
        },
      ],
    },
    {
      code: `
        export function Foo(
          { aName },
          { anotherName = 1 },
          { ignored: IgnoredDueToModifiers1 },
          { ignored: IgnoredDueToModifiers1 = 2 },
          IgnoredDueToModifiers2,
        ) {}
      `,
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['camelCase'],
          modifiers: ['destructured'],
          selector: 'parameter',
        },
      ],
    },
    {
      code: `
        class Ignored {
          private static abstract readonly some_name;
          IgnoredDueToModifiers = 1;
        }
      `,
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['static', 'readonly'],
          selector: 'classProperty',
        },
      ],
    },
    {
      code: `
        class Ignored {
          constructor(
            private readonly some_name,
            IgnoredDueToModifiers,
          ) {}
        }
      `,
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['readonly'],
          selector: 'parameterProperty',
        },
      ],
    },
    {
      code: `
        class Ignored {
          private static some_name() {}
          IgnoredDueToModifiers() {}
        }
      `,
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['static'],
          selector: 'classMethod',
        },
      ],
    },
    {
      code: `
        class Ignored {
          private static get some_name() {}
          get IgnoredDueToModifiers() {}
        }
      `,
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['private', 'static'],
          selector: 'accessor',
        },
      ],
    },
    {
      code: `
        abstract class some_name {}
        class IgnoredDueToModifier {}
      `,
      options: [
        {
          format: ['PascalCase'],
          selector: 'default',
        },
        {
          format: ['snake_case'],
          modifiers: ['abstract'],
          selector: 'class',
        },
      ],
    },
    {
      code: `
        const UnusedVar = 1;
        function UnusedFunc(
          // this line is intentionally broken out
          UnusedParam: string,
        ) {}
        class UnusedClass {}
        interface UnusedInterface {}
        type UnusedType<
          // this line is intentionally broken out
          UnusedTypeParam,
        > = {};

        export const used_var = 1;
        export function used_func(
          // this line is intentionally broken out
          used_param: string,
        ) {
          return used_param;
        }
        export class used_class {}
        export interface used_interface {}
        export type used_type<
          // this line is intentionally broken out
          used_typeparam,
        > = used_typeparam;
      `,
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: ['PascalCase'],
          modifiers: ['unused'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        const ignored1 = {
          'a a': 1,
          'b b'() {},
          get 'c c'() {
            return 1;
          },
          set 'd d'(value: string) {},
        };
        class ignored2 {
          'a a' = 1;
          'b b'() {}
          get 'c c'() {
            return 1;
          }
          set 'd d'(value: string) {}
        }
        interface ignored3 {
          'a a': 1;
          'b b'(): void;
        }
        type ignored4 = {
          'a a': 1;
          'b b'(): void;
        };
        enum ignored5 {
          'a a',
        }
      `,
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: null,
          modifiers: ['requiresQuotes'],
          selector: 'default',
        },
      ],
    },
    {
      code: `
        const ignored1 = {
          'a a': 1,
          'b b'() {},
          get 'c c'() {
            return 1;
          },
          set 'd d'(value: string) {},
        };
        class ignored2 {
          'a a' = 1;
          'b b'() {}
          get 'c c'() {
            return 1;
          }
          set 'd d'(value: string) {}
        }
        interface ignored3 {
          'a a': 1;
          'b b'(): void;
        }
        type ignored4 = {
          'a a': 1;
          'b b'(): void;
        };
        enum ignored5 {
          'a a',
        }
      `,
      options: [
        {
          format: ['snake_case'],
          selector: 'default',
        },
        {
          format: null,
          modifiers: ['requiresQuotes'],
          selector: [
            'classProperty',
            'objectLiteralProperty',
            'typeProperty',
            'classMethod',
            'objectLiteralMethod',
            'typeMethod',
            'accessor',
            'enumMember',
          ],
        },
        // making sure the `requiresQuotes` modifier appropriately overrides this
        {
          format: ['PascalCase'],
          selector: [
            'classProperty',
            'objectLiteralProperty',
            'typeProperty',
            'classMethod',
            'objectLiteralMethod',
            'typeMethod',
            'accessor',
            'enumMember',
          ],
        },
      ],
    },
    {
      code: `
        const obj = {
          Foo: 42,
          Bar() {
            return 42;
          },
        };
      `,
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['PascalCase'],
          selector: 'property',
        },
        {
          format: ['PascalCase'],
          selector: 'method',
        },
      ],
    },
    {
      code: `
        const obj = {
          Bar() {
            return 42;
          },
          async async_bar() {
            return 42;
          },
        };
        class foo {
          public Bar() {
            return 42;
          }
          public async async_bar() {
            return 42;
          }
        }
        abstract class foo {
          public Bar() {
            return 42;
          }
          public async async_bar() {
            return 42;
          }
        }
      `,
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['method', 'objectLiteralMethod'],
        },
        {
          format: ['PascalCase'],
          selector: 'method',
        },
      ],
    },
    {
      code: `
        const async_bar1 = async () => {};
        async function async_bar2() {}
        const async_bar3 = async function async_bar4() {};
      `,
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['PascalCase'],
          selector: 'method',
        },
        {
          format: ['snake_case'],
          modifiers: ['async'],
          selector: ['variable'],
        },
      ],
    },
    {
      code: `
        class foo extends bar {
          public someAttribute = 1;
          public override some_attribute_override = 1;
          public someMethod() {
            return 42;
          }
          public override some_method_override2() {
            return 42;
          }
        }
        abstract class foo extends bar {
          public abstract someAttribute: string;
          public abstract override some_attribute_override: string;
          public abstract someMethod(): string;
          public abstract override some_method_override2(): string;
        }
      `,
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['override'],
          selector: ['memberLike'],
        },
      ],
    },
    {
      code: `
        class foo {
          private someAttribute = 1;
          #some_attribute = 1;

          private someMethod() {}
          #some_method() {}
        }
      `,
      languageOptions: { parserOptions },
      options: [
        {
          format: ['camelCase'],
          selector: 'memberLike',
        },
        {
          format: ['snake_case'],
          modifiers: ['#private'],
          selector: ['memberLike'],
        },
      ],
    },
    {
      code: "import * as FooBar from 'foo_bar';",
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          selector: ['import'],
        },
        {
          format: ['camelCase'],
          modifiers: ['default'],
          selector: ['import'],
        },
      ],
    },
    {
      code: "import fooBar from 'foo_bar';",
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          selector: ['import'],
        },
        {
          format: ['camelCase'],
          modifiers: ['default'],
          selector: ['import'],
        },
      ],
    },
    {
      code: "import { default as fooBar } from 'foo_bar';",
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          selector: ['import'],
        },
        {
          format: ['camelCase'],
          modifiers: ['default'],
          selector: ['import'],
        },
      ],
    },
    {
      code: "import { foo_bar } from 'foo_bar';",
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          selector: ['import'],
        },
        {
          format: ['camelCase'],
          modifiers: ['default'],
          selector: ['import'],
        },
      ],
    },
    {
      code: 'import { "🍎" as Foo } from \'foo_bar\';',
      languageOptions: { parserOptions },
      options: [
        {
          format: ['PascalCase'],
          selector: ['import'],
        },
      ],
    },
  ],
});
