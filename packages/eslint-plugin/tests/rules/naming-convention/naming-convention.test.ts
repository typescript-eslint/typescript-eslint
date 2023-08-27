/* eslint-disable @typescript-eslint/internal/prefer-ast-types-enum */
import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/naming-convention';
import { getFixturesRootDir } from '../../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

// only need parserOptions for the `type` option tests
const rootDir = getFixturesRootDir();
const parserOptions = {
  tsconfigRootDir: rootDir,
  project: './tsconfig.json',
};

ruleTester.run('naming-convention', rule, {
  valid: [
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
          selector: 'default',
          format: ['UPPER_CASE'],
        },
        {
          selector: 'typeMethod',
          format: ['PascalCase'],
        },
        {
          selector: 'typeProperty',
          format: ['snake_case'],
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
      parserOptions,
      options: [
        {
          selector: 'typeProperty',
          modifiers: ['readonly'],
          format: ['UPPER_CASE'],
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
          declare function camelCaseDeclaredFunction() {};
        }
        const PascalCaseVar = 1;
        function PascalCaseFunction() {}
        declare function PascalCaseDeclaredFunction() {};
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
          private static abstract readonly some_name;
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
    {
      code: `
        const obj = {
          Foo: 42,
          Bar() {
            return 42;
          },
        };
      `,
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: 'property',
          format: ['PascalCase'],
        },
        {
          selector: 'method',
          format: ['PascalCase'],
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
          public abstract Bar() {
            return 42;
          }
          public abstract async async_bar() {
            return 42;
          }
        }
      `,
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: ['method', 'objectLiteralMethod'],
          format: ['snake_case'],
          modifiers: ['async'],
        },
        {
          selector: 'method',
          format: ['PascalCase'],
        },
      ],
    },
    {
      code: `
        const async_bar1 = async () => {};
        async function async_bar2() {}
        const async_bar3 = async function async_bar4() {};
      `,
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: 'method',
          format: ['PascalCase'],
        },
        {
          selector: ['variable'],
          format: ['snake_case'],
          modifiers: ['async'],
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
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: ['memberLike'],
          modifiers: ['override'],
          format: ['snake_case'],
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
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: ['memberLike'],
          modifiers: ['#private'],
          format: ['snake_case'],
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
        declare function PascalCaseDeclaredFunction() {};
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
          private static abstract readonly some_name;
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
          UnusedTypeParam,
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
    {
      code: noFormat`
        type Foo = {
          'foo     Bar': string;
          '': string;
          '0': string;
          'foo': string;
          'foo-bar': string;
          '#foo-bar': string;
        };

        interface Bar {
          'boo-----foo': string;
        }
      `,
      // 6, not 7 because 'foo' is valid
      errors: Array(6).fill({ messageId: 'doesNotMatchFormat' }),
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
          // ❌ error
          public AsyncBar2 = async () => {
            return 42;
          };
          // ❌ error
          public AsyncBar3 = async function () {
            return 42;
          };
        }
        abstract class foo {
          public abstract Bar(): number;
          public abstract async async_bar(): number;
          // ❌ error
          public abstract async ASYNC_BAR(): number;
        }
      `,
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: 'method',
          format: ['PascalCase'],
        },
        {
          selector: ['method', 'objectLiteralMethod'],
          format: ['snake_case'],
          modifiers: ['async'],
        },
      ],
      errors: [
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Class Method',
            name: 'asyncBar',
            formats: 'snake_case',
          },
        },
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Class Method',
            name: 'AsyncBar2',
            formats: 'snake_case',
          },
        },
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Class Method',
            name: 'AsyncBar3',
            formats: 'snake_case',
          },
        },
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Class Method',
            name: 'ASYNC_BAR',
            formats: 'snake_case',
          },
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
          // ❌ error
          AsyncBar2: async () => {
            return 42;
          },
          // ❌ error
          AsyncBar3: async function () {
            return 42;
          },
        };
      `,
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: 'method',
          format: ['PascalCase'],
        },
        {
          selector: ['method', 'objectLiteralMethod'],
          format: ['snake_case'],
          modifiers: ['async'],
        },
      ],
      errors: [
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Object Literal Method',
            name: 'AsyncBar',
            formats: 'snake_case',
          },
        },
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Object Literal Method',
            name: 'AsyncBar2',
            formats: 'snake_case',
          },
        },
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Object Literal Method',
            name: 'AsyncBar3',
            formats: 'snake_case',
          },
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
        // ❌ error
        const asyncBar5 = async function async_bar6() {};
      `,
      parserOptions,
      options: [
        {
          selector: 'variableLike',
          format: ['camelCase'],
        },
        {
          selector: ['variableLike'],
          modifiers: ['async'],
          format: ['snake_case'],
        },
      ],
      errors: [
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Variable',
            name: 'AsyncBar1',
            formats: 'snake_case',
          },
        },
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Variable',
            name: 'asyncBar5',
            formats: 'snake_case',
          },
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
        const async_bar3 = async function async_bar4() {};
        async function async_bar2() {}
        // ❌ error
        const async_bar3 = async function ASYNC_BAR4() {};
      `,
      parserOptions,
      options: [
        {
          selector: 'variableLike',
          format: ['camelCase'],
        },
        {
          selector: ['variableLike'],
          modifiers: ['async'],
          format: ['snake_case'],
        },
      ],
      errors: [
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Function',
            name: 'asyncBar2',
            formats: 'snake_case',
          },
        },
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Function',
            name: 'ASYNC_BAR4',
            formats: 'snake_case',
          },
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
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: ['memberLike'],
          modifiers: ['override'],
          format: ['snake_case'],
        },
      ],
      errors: [
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Class Property',
            name: 'someAttributeOverride',
            formats: 'snake_case',
          },
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
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: ['memberLike'],
          modifiers: ['override'],
          format: ['snake_case'],
        },
      ],
      errors: [
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Class Method',
            name: 'someMethodOverride',
            formats: 'snake_case',
          },
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
          public set someSetter(val: string);
          public override set some_setter_override(val: string);
          // ❌ error
          public override set someSetterOverride(val: string);
        }
      `,
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: ['memberLike'],
          modifiers: ['override'],
          format: ['snake_case'],
        },
      ],
      errors: [
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Accessor',
            name: 'someGetterOverride',
            formats: 'snake_case',
          },
        },
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Accessor',
            name: 'someSetterOverride',
            formats: 'snake_case',
          },
        },
      ],
    },
    {
      code: `
        class foo {
          private firstPrivateField = 1;
          // ❌ error
          private first_private_field = 1;
          // ❌ error
          #secondPrivateField = 1;
          #second_private_field = 1;
        }
      `,
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: ['memberLike'],
          modifiers: ['#private'],
          format: ['snake_case'],
        },
      ],
      errors: [
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Class Property',
            name: 'first_private_field',
            formats: 'camelCase',
          },
        },
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Class Property',
            name: 'secondPrivateField',
            formats: 'snake_case',
          },
        },
      ],
    },
    {
      code: `
        class foo {
          private firstPrivateMethod() {}
          // ❌ error
          private first_private_method() {}
          // ❌ error
          #secondPrivateMethod() {}
          #second_private_method() {}
        }
      `,
      parserOptions,
      options: [
        {
          selector: 'memberLike',
          format: ['camelCase'],
        },
        {
          selector: ['memberLike'],
          modifiers: ['#private'],
          format: ['snake_case'],
        },
      ],
      errors: [
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Class Method',
            name: 'first_private_method',
            formats: 'camelCase',
          },
        },
        {
          messageId: 'doesNotMatchFormat',
          data: {
            type: 'Class Method',
            name: 'secondPrivateMethod',
            formats: 'snake_case',
          },
        },
      ],
    },
  ],
});
