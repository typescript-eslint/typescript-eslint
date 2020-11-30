import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule, { MessageIds, Options } from '../../src/rules/naming-convention';
import {
  PredefinedFormatsString,
  selectorTypeToMessageString,
  Selector,
} from '../../src/rules/naming-convention-utils';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

// only need parserOptions for the `type` option tests
const rootDir = getFixturesRootDir();
const parserOptions = {
  tsconfigRootDir: rootDir,
  project: './tsconfig.json',
};

const formatTestNames: Readonly<Record<
  PredefinedFormatsString,
  Record<'valid' | 'invalid', string[]>
>> = {
  camelCase: {
    valid: ['strictCamelCase', 'lower', 'camelCaseUNSTRICT'],
    invalid: ['snake_case', 'UPPER_CASE', 'UPPER', 'StrictPascalCase'],
  },
  strictCamelCase: {
    valid: ['strictCamelCase', 'lower'],
    invalid: [
      'snake_case',
      'UPPER_CASE',
      'UPPER',
      'StrictPascalCase',
      'camelCaseUNSTRICT',
    ],
  },
  PascalCase: {
    valid: [
      'StrictPascalCase',
      'Pascal',
      'I18n',
      'PascalCaseUNSTRICT',
      'UPPER',
    ],
    invalid: ['snake_case', 'UPPER_CASE', 'strictCamelCase'],
  },
  StrictPascalCase: {
    valid: ['StrictPascalCase', 'Pascal', 'I18n'],
    invalid: [
      'snake_case',
      'UPPER_CASE',
      'UPPER',
      'strictCamelCase',
      'PascalCaseUNSTRICT',
    ],
  },
  UPPER_CASE: {
    valid: ['UPPER_CASE', 'UPPER'],
    invalid: [
      'lower',
      'snake_case',
      'SNAKE_case_UNSTRICT',
      'strictCamelCase',
      'StrictPascalCase',
    ],
  },
  snake_case: {
    valid: ['snake_case', 'lower'],
    invalid: [
      'UPPER_CASE',
      'SNAKE_case_UNSTRICT',
      'strictCamelCase',
      'StrictPascalCase',
    ],
  },
};

const REPLACE_REGEX = /%/g;
// filter to not match `[iI]gnored`
const IGNORED_FILTER = {
  match: false,
  regex: /.gnored/.source,
};

type Cases = {
  code: string[];
  options: Omit<Options[0], 'format'>;
}[];
function createValidTestCases(cases: Cases): TSESLint.ValidTestCase<Options>[] {
  const newCases: TSESLint.ValidTestCase<Options>[] = [];

  for (const test of cases) {
    for (const [formatLoose, names] of Object.entries(formatTestNames)) {
      const format = [formatLoose as PredefinedFormatsString];
      for (const name of names.valid) {
        const createCase = (
          preparedName: string,
          options: Selector,
        ): TSESLint.ValidTestCase<Options> => ({
          options: [
            {
              ...options,
              filter: IGNORED_FILTER,
            },
          ],
          code: `// ${JSON.stringify(options)}\n${test.code
            .map(code => code.replace(REPLACE_REGEX, preparedName))
            .join('\n')}`,
        });

        newCases.push(
          createCase(name, {
            ...test.options,
            format,
          }),

          // leadingUnderscore
          createCase(name, {
            ...test.options,
            format,
            leadingUnderscore: 'forbid',
          }),
          createCase(`_${name}`, {
            ...test.options,
            format,
            leadingUnderscore: 'require',
          }),
          createCase(`__${name}`, {
            ...test.options,
            format,
            leadingUnderscore: 'requireDouble',
          }),
          createCase(`_${name}`, {
            ...test.options,
            format,
            leadingUnderscore: 'allow',
          }),
          createCase(name, {
            ...test.options,
            format,
            leadingUnderscore: 'allow',
          }),
          createCase(`__${name}`, {
            ...test.options,
            format,
            leadingUnderscore: 'allowDouble',
          }),
          createCase(name, {
            ...test.options,
            format,
            leadingUnderscore: 'allowDouble',
          }),
          createCase(`_${name}`, {
            ...test.options,
            format,
            leadingUnderscore: 'allowSingleOrDouble',
          }),
          createCase(name, {
            ...test.options,
            format,
            leadingUnderscore: 'allowSingleOrDouble',
          }),
          createCase(`__${name}`, {
            ...test.options,
            format,
            leadingUnderscore: 'allowSingleOrDouble',
          }),
          createCase(name, {
            ...test.options,
            format,
            leadingUnderscore: 'allowSingleOrDouble',
          }),

          // trailingUnderscore
          createCase(name, {
            ...test.options,
            format,
            trailingUnderscore: 'forbid',
          }),
          createCase(`${name}_`, {
            ...test.options,
            format,
            trailingUnderscore: 'require',
          }),
          createCase(`${name}__`, {
            ...test.options,
            format,
            trailingUnderscore: 'requireDouble',
          }),
          createCase(`${name}_`, {
            ...test.options,
            format,
            trailingUnderscore: 'allow',
          }),
          createCase(name, {
            ...test.options,
            format,
            trailingUnderscore: 'allow',
          }),
          createCase(`${name}__`, {
            ...test.options,
            format,
            trailingUnderscore: 'allowDouble',
          }),
          createCase(name, {
            ...test.options,
            format,
            trailingUnderscore: 'allowDouble',
          }),
          createCase(`${name}_`, {
            ...test.options,
            format,
            trailingUnderscore: 'allowSingleOrDouble',
          }),
          createCase(name, {
            ...test.options,
            format,
            trailingUnderscore: 'allowSingleOrDouble',
          }),
          createCase(`${name}__`, {
            ...test.options,
            format,
            trailingUnderscore: 'allowSingleOrDouble',
          }),
          createCase(name, {
            ...test.options,
            format,
            trailingUnderscore: 'allowSingleOrDouble',
          }),

          // prefix
          createCase(`MyPrefix${name}`, {
            ...test.options,
            format,
            prefix: ['MyPrefix'],
          }),
          createCase(`MyPrefix2${name}`, {
            ...test.options,
            format,
            prefix: ['MyPrefix1', 'MyPrefix2'],
          }),

          // suffix
          createCase(`${name}MySuffix`, {
            ...test.options,
            format,
            suffix: ['MySuffix'],
          }),
          createCase(`${name}MySuffix2`, {
            ...test.options,
            format,
            suffix: ['MySuffix1', 'MySuffix2'],
          }),
        );
      }
    }
  }

  return newCases;
}
function createInvalidTestCases(
  cases: Cases,
): TSESLint.InvalidTestCase<MessageIds, Options>[] {
  const newCases: TSESLint.InvalidTestCase<MessageIds, Options>[] = [];

  for (const test of cases) {
    for (const [formatLoose, names] of Object.entries(formatTestNames)) {
      const format = [formatLoose as PredefinedFormatsString];
      for (const name of names.invalid) {
        const createCase = (
          preparedName: string,
          options: Selector,
          messageId: MessageIds,
          data: Record<string, unknown> = {},
        ): TSESLint.InvalidTestCase<MessageIds, Options> => {
          const selectors = Array.isArray(test.options.selector)
            ? test.options.selector
            : [test.options.selector];
          const errorsTemplate = selectors.map(selector => ({
            messageId,
            ...(selector !== 'default' &&
            selector !== 'variableLike' &&
            selector !== 'memberLike' &&
            selector !== 'typeLike' &&
            selector !== 'property' &&
            selector !== 'method'
              ? {
                  data: {
                    type: selectorTypeToMessageString(selector),
                    name: preparedName,
                    ...data,
                  },
                }
              : // meta-types will use the correct selector, so don't assert on data shape
                {}),
          }));

          const errors: {
            data?: { type: string; name: string };
            messageId: MessageIds;
          }[] = [];
          test.code.forEach(() => errors.push(...errorsTemplate));

          return {
            options: [
              {
                ...options,
                filter: IGNORED_FILTER,
              },
            ],
            code: `// ${JSON.stringify(options)}\n${test.code
              .map(code => code.replace(REPLACE_REGEX, preparedName))
              .join('\n')}`,
            errors: errors,
          };
        };

        const prefixSingle = ['MyPrefix'];
        const prefixMulti = ['MyPrefix1', 'MyPrefix2'];
        const suffixSingle = ['MySuffix'];
        const suffixMulti = ['MySuffix1', 'MySuffix2'];

        newCases.push(
          createCase(
            name,
            {
              ...test.options,
              format,
            },
            'doesNotMatchFormat',
            { formats: format.join(', ') },
          ),

          // leadingUnderscore
          createCase(
            `_${name}`,
            {
              ...test.options,
              format,
              leadingUnderscore: 'forbid',
            },
            'unexpectedUnderscore',
            { position: 'leading' },
          ),
          createCase(
            name,
            {
              ...test.options,
              format,
              leadingUnderscore: 'require',
            },
            'missingUnderscore',
            { position: 'leading', count: 'one' },
          ),
          createCase(
            name,
            {
              ...test.options,
              format,
              leadingUnderscore: 'requireDouble',
            },
            'missingUnderscore',
            { position: 'leading', count: 'two' },
          ),
          createCase(
            `_${name}`,
            {
              ...test.options,
              format,
              leadingUnderscore: 'requireDouble',
            },
            'missingUnderscore',
            { position: 'leading', count: 'two' },
          ),

          // trailingUnderscore
          createCase(
            `${name}_`,
            {
              ...test.options,
              format,
              trailingUnderscore: 'forbid',
            },
            'unexpectedUnderscore',
            { position: 'trailing' },
          ),
          createCase(
            name,
            {
              ...test.options,
              format,
              trailingUnderscore: 'require',
            },
            'missingUnderscore',
            { position: 'trailing', count: 'one' },
          ),
          createCase(
            name,
            {
              ...test.options,
              format,
              trailingUnderscore: 'requireDouble',
            },
            'missingUnderscore',
            { position: 'trailing', count: 'two' },
          ),
          createCase(
            `${name}_`,
            {
              ...test.options,
              format,
              trailingUnderscore: 'requireDouble',
            },
            'missingUnderscore',
            { position: 'trailing', count: 'two' },
          ),

          // prefix
          createCase(
            name,
            {
              ...test.options,
              format,
              prefix: prefixSingle,
            },
            'missingAffix',
            { position: 'prefix', affixes: prefixSingle.join(', ') },
          ),
          createCase(
            name,
            {
              ...test.options,
              format,
              prefix: prefixMulti,
            },
            'missingAffix',
            {
              position: 'prefix',
              affixes: prefixMulti.join(', '),
            },
          ),

          // suffix
          createCase(
            name,
            {
              ...test.options,
              format,
              suffix: suffixSingle,
            },
            'missingAffix',
            { position: 'suffix', affixes: suffixSingle.join(', ') },
          ),
          createCase(
            name,
            {
              ...test.options,
              format,
              suffix: suffixMulti,
            },
            'missingAffix',
            {
              position: 'suffix',
              affixes: suffixMulti.join(', '),
            },
          ),
        );
      }
    }
  }

  return newCases;
}

const cases: Cases = [
  // #region default
  {
    code: [
      'const % = 1;',
      'function % () {}',
      '(function (%) {});',
      'class Ignored { constructor(private %) {} }',
      'const ignored = { % };',
      'interface Ignored { %: string }',
      'type Ignored = { %: string }',
      'class Ignored { private % = 1 }',
      'class Ignored { constructor(private %) {} }',
      'class Ignored { private %() {} }',
      'const ignored = { %() {} };',
      'class Ignored { private get %() {} }',
      'enum Ignored { % }',
      'abstract class % {}',
      'interface % { }',
      'type % = { };',
      'enum % {}',
      'interface Ignored<%> extends Ignored<string> {}',
    ],
    options: {
      selector: 'default',
      filter: '[iI]gnored',
    },
  },
  // #endregion default

  // #region variable
  {
    code: [
      'const % = 1;',
      'let % = 1;',
      'var % = 1;',
      'const {%} = {ignored: 1};',
      'const {% = 2} = {ignored: 1};',
      'const {...%} = {ignored: 1};',
      'const [%] = [1];',
      'const [% = 1] = [1];',
      'const [...%] = [1];',
    ],
    options: {
      selector: 'variable',
    },
  },
  // #endregion variable

  // #region function
  {
    code: ['function % () {}', '(function % () {});', 'declare function % ();'],
    options: {
      selector: 'function',
    },
  },
  // #endregion function

  // #region parameter
  {
    code: [
      'function ignored(%) {}',
      '(function (%) {});',
      'declare function ignored(%);',
      'function ignored({%}) {}',
      'function ignored(...%) {}',
      'function ignored({% = 1}) {}',
      'function ignored({...%}) {}',
      'function ignored([%]) {}',
      'function ignored([% = 1]) {}',
      'function ignored([...%]) {}',
    ],
    options: {
      selector: 'parameter',
    },
  },
  // #endregion parameter

  // #region property
  {
    code: [
      'class Ignored { private % }',
      'class Ignored { private "%" = 1 }',
      'class Ignored { private readonly % = 1 }',
      'class Ignored { private static % }',
      'class Ignored { private static readonly % = 1 }',
      'class Ignored { abstract % = 1 }',
      'class Ignored { declare % }',
    ],
    options: {
      selector: 'classProperty',
    },
  },
  {
    code: ['const ignored = { % };', 'const ignored = { "%": 1 };'],
    options: {
      selector: 'objectLiteralProperty',
    },
  },
  {
    code: [
      'interface Ignored { % }',
      'interface Ignored { "%": string }',
      'type Ignored = { % }',
      'type Ignored = { "%": string }',
    ],
    options: {
      selector: 'typeProperty',
    },
  },
  // #endregion property

  // #region parameterProperty
  {
    code: [
      'class Ignored { constructor(private %) {} }',
      'class Ignored { constructor(readonly %) {} }',
      'class Ignored { constructor(private readonly %) {} }',
    ],
    options: {
      selector: 'parameterProperty',
    },
  },
  {
    code: ['class Ignored { constructor(private readonly %) {} }'],
    options: {
      selector: 'parameterProperty',
      modifiers: ['readonly'],
    },
  },
  // #endregion parameterProperty

  // #region method
  {
    code: [
      'class Ignored { private %() {} }',
      'class Ignored { private "%"() {} }',
      'class Ignored { private readonly %() {} }',
      'class Ignored { private static %() {} }',
      'class Ignored { private static readonly %() {} }',
      'class Ignored { private % = () => {} }',
      'class Ignored { abstract %() }',
      'class Ignored { declare %() }',
    ],
    options: {
      selector: 'classMethod',
    },
  },
  {
    code: [
      'const ignored = { %() {} };',
      'const ignored = { "%"() {} };',
      'const ignored = { %: () => {} };',
    ],
    options: {
      selector: 'objectLiteralMethod',
    },
  },
  {
    code: [
      'interface Ignored { %(): string }',
      'interface Ignored { "%"(): string }',
      'type Ignored = { %(): string }',
      'type Ignored = { "%"(): string }',
    ],
    options: {
      selector: 'typeMethod',
    },
  },
  // #endregion method

  // #region accessor
  {
    code: [
      'const ignored = { get %() {} };',
      'const ignored = { set "%"(ignored) {} };',
      'class Ignored { private get %() {} }',
      'class Ignored { private set "%"(ignored) {} }',
      'class Ignored { private static get %() {} }',
    ],
    options: {
      selector: 'accessor',
    },
  },
  // #endregion accessor

  // #region enumMember
  {
    code: ['enum Ignored { % }', 'enum Ignored { "%" }'],
    options: {
      selector: 'enumMember',
    },
  },
  // #endregion enumMember

  // #region class
  {
    code: ['class % {}', 'abstract class % {}', 'const ignored = class % {}'],
    options: {
      selector: 'class',
    },
  },
  // #endregion class

  // #region interface
  {
    code: ['interface % {}'],
    options: {
      selector: 'interface',
    },
  },
  // #endregion interface

  // #region typeAlias
  {
    code: ['type % = {};', 'type % = 1;'],
    options: {
      selector: 'typeAlias',
    },
  },
  // #endregion typeAlias

  // #region enum
  {
    code: ['enum % {}'],
    options: {
      selector: 'enum',
    },
  },
  // #endregion enum

  // #region typeParameter
  {
    code: [
      'class Ignored<%> {}',
      'function ignored<%>() {}',
      'type Ignored<%> = { ignored: % };',
      'interface Ignored<%> extends Ignored<string> {}',
    ],
    options: {
      selector: 'typeParameter',
    },
  },
  // #endregion typeParameter
];

ruleTester.run('naming-convention', rule, {
  valid: [
    ...createValidTestCases(cases),
    {
      code: `
        const child_process = require('child_process');
      `,
      parserOptions,
      options: [
        {
          selector: 'default',
          format: ['camelCase'],
          filter: {
            regex: 'child_process',
            match: false,
          },
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
      parserOptions,
      options: [
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['UPPER_CASE'],
          prefix: ['ANY_'],
        },
        {
          selector: 'variable',
          types: ['string'],
          format: ['camelCase'],
          prefix: ['string_'],
        },
        {
          selector: 'variable',
          types: ['number'],
          format: ['camelCase'],
          prefix: ['number_'],
        },
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['camelCase'],
          prefix: ['boolean_'],
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
          selector: 'default',
          format: ['camelCase'],
          custom: {
            regex: /^unused_\w/.source,
            match: false,
          },
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
          custom: {
            regex: /^I[A-Z]/.source,
            match: false,
          },
        },
        {
          selector: 'function',
          format: ['snake_case'],
          custom: {
            regex: /_function_/.source,
            match: true,
          },
          leadingUnderscore: 'allow',
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
          selector: ['default', 'typeLike', 'function'],
          format: ['camelCase'],
          custom: {
            regex: /^unused_\w/.source,
            match: false,
          },
          leadingUnderscore: 'allow',
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
          selector: 'default',
          format: ['camelCase'],
        },
      ],
    },
    // no format selector
    {
      code: 'const snake_case = 1;',
      options: [
        {
          selector: 'default',
          format: ['camelCase'],
        },
        {
          selector: 'variable',
          format: null,
        },
      ],
    },
    {
      code: 'const snake_case = 1;',
      options: [
        {
          selector: 'default',
          format: ['camelCase'],
        },
        {
          selector: 'variable',
          format: [],
        },
      ],
    },
    // https://github.com/typescript-eslint/typescript-eslint/issues/1478
    {
      code: `
        const child_process = require('child_process');
      `,
      options: [
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
        {
          selector: 'variable',
          format: ['snake_case'],
          filter: 'child_process',
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
          format: ['strictCamelCase'],
          selector: 'default',
          filter: {
            regex: /-/.source,
            match: false,
          },
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
          format: ['strictCamelCase'],
          selector: 'default',
          filter: {
            regex: /^(Property-Name)$/.source,
            match: false,
          },
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
      parserOptions,
      options: [
        {
          selector: ['variable', 'parameter', 'property', 'accessor'],
          types: ['number'],
          format: ['PascalCase'],
          prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
        },
      ],
    },
    {
      code: `
        class foo {
          private readonly FooBoo: boolean;
        }
      `,
      parserOptions,
      options: [
        {
          selector: ['property', 'accessor'],
          types: ['boolean'],
          modifiers: ['private', 'readonly'],
          format: ['PascalCase'],
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
          selector: ['property', 'accessor'],
          modifiers: ['private'],
          format: ['camelCase'],
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
      parserOptions,
      options: [
        {
          selector: ['property', 'accessor'],
          modifiers: ['private'],
          format: ['StrictPascalCase'],
          prefix: ['Van'],
        },
        {
          selector: ['variable', 'parameter'],
          types: ['number'],
          format: ['camelCase'],
          prefix: ['is', 'good'],
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
        { selector: 'property', format: ['PascalCase'] },
        { selector: 'variable', format: ['camelCase'] },
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
        { selector: 'default', format: ['camelCase'] },
        {
          selector: 'variable',
          format: ['PascalCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'function',
          format: ['PascalCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
          modifiers: ['exported'],
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
        { selector: 'default', format: ['camelCase'] },
        {
          selector: 'variable',
          format: ['PascalCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'function',
          format: ['PascalCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'class',
          format: ['PascalCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
          modifiers: ['exported'],
        },
      ],
    },
    {
      code: `
        {
          const camelCaseVar = 1;
          function camelCaseFunction() {}
          declare function camelCaseDeclaredFunction() {
          };
        }
        const PascalCaseVar = 1;
        function PascalCaseFunction() {}
        declare function PascalCaseDeclaredFunction() {
        };
      `,
      options: [
        { selector: 'default', format: ['camelCase'] },
        {
          selector: 'variable',
          format: ['PascalCase'],
          modifiers: ['global'],
        },
        {
          selector: 'function',
          format: ['PascalCase'],
          modifiers: ['global'],
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
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          format: ['snake_case'],
          modifiers: ['destructured'],
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
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          format: null,
          modifiers: ['destructured'],
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
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'parameter',
          modifiers: ['destructured'],
          format: ['camelCase'],
        },
      ],
    },
    {
      code: `
        class Ignored {
          private static abstract readonly some_name = 1;
          IgnoredDueToModifiers = 1;
        }
      `,
      options: [
        {
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'classProperty',
          format: ['snake_case'],
          modifiers: ['static', 'readonly'],
        },
      ],
    },
    {
      code: `
        class Ignored {
          constructor(private readonly some_name, IgnoredDueToModifiers) {}
        }
      `,
      options: [
        {
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'parameterProperty',
          format: ['snake_case'],
          modifiers: ['readonly'],
        },
      ],
    },
    {
      code: `
        class Ignored {
          private static abstract some_name() {}
          IgnoredDueToModifiers() {}
        }
      `,
      options: [
        {
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'classMethod',
          format: ['snake_case'],
          modifiers: ['abstract', 'static'],
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
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'accessor',
          format: ['snake_case'],
          modifiers: ['private', 'static'],
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
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'class',
          format: ['snake_case'],
          modifiers: ['abstract'],
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
          UnusedTypeParam
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
          used_typeparam
        > = used_typeparam;
      `,
      options: [
        {
          selector: 'default',
          format: ['snake_case'],
        },
        {
          selector: 'default',
          modifiers: ['unused'],
          format: ['PascalCase'],
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
          selector: 'default',
          format: ['snake_case'],
        },
        {
          selector: 'default',
          format: null,
          modifiers: ['requiresQuotes'],
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
          selector: 'default',
          format: ['snake_case'],
        },
        {
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
          format: null,
          modifiers: ['requiresQuotes'],
        },
        // making sure the `requoresQuotes` modifier appropriately overrides this
        {
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
          format: ['PascalCase'],
        },
      ],
    },
  ],
  invalid: [
    {
      // make sure we handle no options and apply defaults
      code: 'const x_x = 1;',
      errors: [{ messageId: 'doesNotMatchFormat' }],
    },
    {
      // make sure we handle empty options and apply defaults
      code: 'const x_x = 1;',
      options: [],
      errors: [{ messageId: 'doesNotMatchFormat' }],
    },
    ...createInvalidTestCases(cases),
    {
      code: `
        const child_process = require('child_process');
      `,
      parserOptions,
      options: [
        {
          selector: 'default',
          format: ['camelCase'],
          filter: {
            regex: 'child_process',
            match: true,
          },
        },
      ],
      errors: [{ messageId: 'doesNotMatchFormat' }],
    },
    {
      code: `
        declare const any_camelCase01: any;
        declare const any_camelCase02: any | null;
        declare const any_camelCase03: any | null | undefined;
        declare const string_camelCase01: string;
        declare const string_camelCase02: string | null;
        declare const string_camelCase03: string | null | undefined;
        declare const string_camelCase04: 'a' | null | undefined;
        declare const string_camelCase05: string | 'a' | null | undefined;
        declare const number_camelCase06: number;
        declare const number_camelCase07: number | null;
        declare const number_camelCase08: number | null | undefined;
        declare const number_camelCase09: 1 | null | undefined;
        declare const number_camelCase10: number | 2 | null | undefined;
        declare const boolean_camelCase11: boolean;
        declare const boolean_camelCase12: boolean | null;
        declare const boolean_camelCase13: boolean | null | undefined;
        declare const boolean_camelCase14: true | null | undefined;
        declare const boolean_camelCase15: false | null | undefined;
        declare const boolean_camelCase16: true | false | null | undefined;
      `,
      options: [
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['UPPER_CASE'],
          prefix: ['any_'],
        },
        {
          selector: 'variable',
          types: ['string'],
          format: ['snake_case'],
          prefix: ['string_'],
        },
        {
          selector: 'variable',
          types: ['number'],
          format: ['snake_case'],
          prefix: ['number_'],
        },
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['snake_case'],
          prefix: ['boolean_'],
        },
      ],
      parserOptions,
      errors: Array(19).fill({ messageId: 'doesNotMatchFormatTrimmed' }),
    },
    {
      code: `
        declare const function_camelCase1: () => void;
        declare const function_camelCase2: (() => void) | null;
        declare const function_camelCase3: (() => void) | null | undefined;
        declare const function_camelCase4:
          | (() => void)
          | (() => string)
          | null
          | undefined;
      `,
      options: [
        {
          selector: 'variable',
          types: ['function'],
          format: ['snake_case'],
          prefix: ['function_'],
        },
      ],
      parserOptions,
      errors: Array(4).fill({ messageId: 'doesNotMatchFormatTrimmed' }),
    },
    {
      code: `
        declare const array_camelCase1: Array<number>;
        declare const array_camelCase2: ReadonlyArray<number> | null;
        declare const array_camelCase3: number[] | null | undefined;
        declare const array_camelCase4: readonly number[] | null | undefined;
        declare const array_camelCase5:
          | number[]
          | (number | string)[]
          | null
          | undefined;
        declare const array_camelCase6: [] | null | undefined;
        declare const array_camelCase7: [number] | null | undefined;
        declare const array_camelCase8:
          | readonly number[]
          | Array<string>
          | [boolean]
          | null
          | undefined;
      `,
      options: [
        {
          selector: 'variable',
          types: ['array'],
          format: ['snake_case'],
          prefix: ['array_'],
        },
      ],
      parserOptions,
      errors: Array(8).fill({ messageId: 'doesNotMatchFormatTrimmed' }),
    },
    {
      code: `
        let unused_foo = 'a';
        const _unused_foo = 1;
        interface IFoo {}
        class IBar {}
        function fooBar() {}
      `,
      options: [
        {
          selector: 'default',
          format: ['snake_case'],
          custom: {
            regex: /^unused_\w/.source,
            match: false,
          },
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
          custom: {
            regex: /^I[A-Z]/.source,
            match: false,
          },
        },
        {
          selector: 'function',
          format: ['camelCase'],
          custom: {
            regex: /function/.source,
            match: true,
          },
          leadingUnderscore: 'allow',
        },
      ],
      errors: [
        {
          messageId: 'satisfyCustom',
          line: 2,
          data: {
            type: 'Variable',
            name: 'unused_foo',
            regex: '/^unused_\\w/u',
            regexMatch: 'not match',
          },
        },
        {
          messageId: 'satisfyCustom',
          line: 3,
          data: {
            type: 'Variable',
            name: '_unused_foo',
            regex: '/^unused_\\w/u',
            regexMatch: 'not match',
          },
        },
        {
          messageId: 'satisfyCustom',
          line: 4,
          data: {
            type: 'Interface',
            name: 'IFoo',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
          },
        },
        {
          messageId: 'satisfyCustom',
          line: 5,
          data: {
            type: 'Class',
            name: 'IBar',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
          },
        },
        {
          messageId: 'satisfyCustom',
          line: 6,
          data: {
            type: 'Function',
            name: 'fooBar',
            regex: '/function/u',
            regexMatch: 'match',
          },
        },
      ],
    },
    {
      code: `
        let unused_foo = 'a';
        const _unused_foo = 1;
        function foo_bar() {}
        interface IFoo {}
        class IBar {}
      `,
      options: [
        {
          selector: ['variable', 'function'],
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: ['class', 'interface'],
          format: ['PascalCase'],
          custom: {
            regex: /^I[A-Z]/.source,
            match: false,
          },
        },
      ],
      errors: [
        {
          messageId: 'doesNotMatchFormat',
          line: 2,
          data: {
            type: 'Variable',
            name: 'unused_foo',
            formats: 'camelCase',
          },
        },
        {
          messageId: 'doesNotMatchFormatTrimmed',
          line: 3,
          data: {
            type: 'Variable',
            name: '_unused_foo',
            processedName: 'unused_foo',
            formats: 'camelCase',
          },
        },
        {
          messageId: 'doesNotMatchFormat',
          line: 4,
          data: {
            type: 'Function',
            name: 'foo_bar',
            formats: 'camelCase',
          },
        },
        {
          messageId: 'satisfyCustom',
          line: 5,
          data: {
            type: 'Interface',
            name: 'IFoo',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
          },
        },
        {
          messageId: 'satisfyCustom',
          line: 6,
          data: {
            type: 'Class',
            name: 'IBar',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
          },
        },
      ],
    },
    {
      code: `
        const foo = {
          'Property Name': 'asdf',
        };
      `,
      options: [
        {
          format: ['strictCamelCase'],
          selector: 'default',
          filter: {
            regex: /-/.source,
            match: false,
          },
        },
      ],
      errors: [
        {
          line: 3,
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Object Literal Property',
            name: 'Property Name',
            formats: 'strictCamelCase',
          },
        },
      ],
    },
    {
      code: `
        const myfoo_bar = 'abcs';
        function fun(myfoo: string) {}
        class foo {
          Myfoo: string;
        }
      `,
      options: [
        {
          selector: ['variable', 'property', 'parameter'],
          types: ['string'],
          format: ['PascalCase'],
          prefix: ['my', 'My'],
        },
      ],
      parserOptions,
      errors: Array(3).fill({ messageId: 'doesNotMatchFormatTrimmed' }),
    },
    {
      code: `
        class foo {
          private readonly fooBar: boolean;
        }
      `,
      options: [
        {
          selector: ['property', 'accessor'],
          modifiers: ['private', 'readonly'],
          format: ['PascalCase'],
        },
      ],
      errors: [{ messageId: 'doesNotMatchFormat' }],
    },
    {
      code: `
        function my_foo_bar() {}
      `,
      parserOptions,
      options: [
        {
          selector: ['variable', 'function'],
          types: ['string'],
          format: ['PascalCase'],
          prefix: ['my', 'My'],
        },
      ],
      errors: [{ messageId: 'doesNotMatchFormatTrimmed' }],
    },
    {
      code: `
        class SomeClass {
          static otherConstant = 'hello';
        }

        export const { otherConstant } = SomeClass;
      `,
      parserOptions,
      options: [
        { selector: 'property', format: ['PascalCase'] },
        { selector: 'variable', format: ['camelCase'] },
      ],
      errors: [
        {
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
    },
    {
      code: `
        declare class Foo {
          Bar(Baz: string): void;
        }
      `,
      parserOptions,
      options: [{ selector: 'parameter', format: ['camelCase'] }],
      errors: [
        {
          line: 3,
          messageId: 'doesNotMatchFormat',
        },
      ],
    },
    {
      code: `
        export const PascalCaseVar = 1;
        export enum PascalCaseEnum {}
        export class PascalCaseClass {}
        export function PascalCaseFunction() {}
        export interface PascalCaseInterface {}
        export type PascalCaseType = {};
      `,
      options: [
        {
          selector: 'default',
          format: ['snake_case'],
        },
        {
          selector: 'variable',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'function',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'class',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'interface',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'typeAlias',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'enum',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
      ],
      errors: Array(6).fill({ messageId: 'doesNotMatchFormat' }),
    },
    {
      code: `
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
        { selector: 'default', format: ['snake_case'] },
        {
          selector: 'variable',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'function',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'class',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'interface',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'typeAlias',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
        {
          selector: 'enum',
          format: ['camelCase'],
          modifiers: ['exported'],
        },
      ],
      errors: Array(6).fill({ messageId: 'doesNotMatchFormat' }),
    },
    {
      code: `
        const PascalCaseVar = 1;
        function PascalCaseFunction() {}
        declare function PascalCaseDeclaredFunction() {
        };
      `,
      options: [
        { selector: 'default', format: ['snake_case'] },
        {
          selector: 'variable',
          format: ['camelCase'],
          modifiers: ['global'],
        },
        {
          selector: 'function',
          format: ['camelCase'],
          modifiers: ['global'],
        },
      ],
      errors: Array(3).fill({ messageId: 'doesNotMatchFormat' }),
    },
    {
      code: `
        const { some_name1 } = {};
        const { some_name2 = 2 } = {};
        const { ignored: IgnoredDueToModifiers1 } = {};
        const { ignored: IgnoredDueToModifiers2 = 3 } = {};
        const IgnoredDueToModifiers3 = 1;
      `,
      options: [
        {
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          format: ['UPPER_CASE'],
          modifiers: ['destructured'],
        },
      ],
      errors: Array(2).fill({ messageId: 'doesNotMatchFormat' }),
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
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'parameter',
          modifiers: ['destructured'],
          format: ['UPPER_CASE'],
        },
      ],
      errors: Array(2).fill({ messageId: 'doesNotMatchFormat' }),
    },
    {
      code: `
        class Ignored {
          private static abstract readonly some_name = 1;
          IgnoredDueToModifiers = 1;
        }
      `,
      options: [
        {
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'classProperty',
          format: ['UPPER_CASE'],
          modifiers: ['static', 'readonly'],
        },
      ],
      errors: [{ messageId: 'doesNotMatchFormat' }],
    },
    {
      code: `
        class Ignored {
          constructor(private readonly some_name, IgnoredDueToModifiers) {}
        }
      `,
      options: [
        {
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'parameterProperty',
          format: ['UPPER_CASE'],
          modifiers: ['readonly'],
        },
      ],
      errors: [{ messageId: 'doesNotMatchFormat' }],
    },
    {
      code: `
        class Ignored {
          private static abstract some_name() {}
          IgnoredDueToModifiers() {}
        }
      `,
      options: [
        {
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'classMethod',
          format: ['UPPER_CASE'],
          modifiers: ['abstract', 'static'],
        },
      ],
      errors: [{ messageId: 'doesNotMatchFormat' }],
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
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'accessor',
          format: ['UPPER_CASE'],
          modifiers: ['private', 'static'],
        },
      ],
      errors: [{ messageId: 'doesNotMatchFormat' }],
    },
    {
      code: `
        abstract class some_name {}
        class IgnoredDueToModifier {}
      `,
      options: [
        {
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'class',
          format: ['UPPER_CASE'],
          modifiers: ['abstract'],
        },
      ],
      errors: [{ messageId: 'doesNotMatchFormat' }],
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
          UnusedTypeParam
        > = {};
      `,
      options: [
        {
          selector: 'default',
          format: ['PascalCase'],
        },
        {
          selector: 'default',
          modifiers: ['unused'],
          format: ['snake_case'],
        },
      ],
      errors: Array(7).fill({ messageId: 'doesNotMatchFormat' }),
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
          selector: 'default',
          format: ['snake_case'],
        },
        {
          selector: 'default',
          format: ['PascalCase'],
          modifiers: ['requiresQuotes'],
        },
      ],
      errors: Array(13).fill({ messageId: 'doesNotMatchFormat' }),
    },
  ],
});
