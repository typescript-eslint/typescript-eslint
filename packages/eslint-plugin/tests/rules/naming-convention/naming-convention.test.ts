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
  tsconfigRootDir: rootDir,
};

ruleTester.run('naming-convention', rule, {
  invalid: [
    {
      // make sure we handle no options and apply defaults
      code: 'const x_x = 1;',
      errors: [{ messageId: 'doesNotMatchFormat' }],
    },
    {
      // make sure we handle empty options and apply defaults
      code: 'const x_x = 1;',
      errors: [{ messageId: 'doesNotMatchFormat' }],
      options: [],
    },
    {
      code: `
        const child_process = require('child_process');
      `,
      errors: [{ messageId: 'doesNotMatchFormat' }],
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
      errors: Array(19).fill({ messageId: 'doesNotMatchFormatTrimmed' }),
      languageOptions: { parserOptions },
      options: [
        {
          format: ['UPPER_CASE'],
          modifiers: ['const'],
          prefix: ['any_'],
          selector: 'variable',
        },
        {
          format: ['snake_case'],
          prefix: ['string_'],
          selector: 'variable',
          types: ['string'],
        },
        {
          format: ['snake_case'],
          prefix: ['number_'],
          selector: 'variable',
          types: ['number'],
        },
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
        declare const function_camelCase2: (() => void) | null;
        declare const function_camelCase3: (() => void) | null | undefined;
        declare const function_camelCase4:
          | (() => void)
          | (() => string)
          | null
          | undefined;
      `,
      errors: Array(4).fill({ messageId: 'doesNotMatchFormatTrimmed' }),
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
      errors: Array(8).fill({ messageId: 'doesNotMatchFormatTrimmed' }),
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
        const _unused_foo = 1;
        interface IFoo {}
        class IBar {}
        function fooBar() {}
      `,
      errors: [
        {
          data: {
            name: 'unused_foo',
            regex: '/^unused_\\w/u',
            regexMatch: 'not match',
            type: 'Variable',
          },
          line: 2,
          messageId: 'satisfyCustom',
        },
        {
          data: {
            name: '_unused_foo',
            regex: '/^unused_\\w/u',
            regexMatch: 'not match',
            type: 'Variable',
          },
          line: 3,
          messageId: 'satisfyCustom',
        },
        {
          data: {
            name: 'IFoo',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
            type: 'Interface',
          },
          line: 4,
          messageId: 'satisfyCustom',
        },
        {
          data: {
            name: 'IBar',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
            type: 'Class',
          },
          line: 5,
          messageId: 'satisfyCustom',
        },
        {
          data: {
            name: 'fooBar',
            regex: '/function/u',
            regexMatch: 'match',
            type: 'Function',
          },
          line: 6,
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
        const _unused_foo = 1;
        function foo_bar() {}
        interface IFoo {}
        class IBar {}
      `,
      errors: [
        {
          data: {
            formats: 'camelCase',
            name: 'unused_foo',
            type: 'Variable',
          },
          line: 2,
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            formats: 'camelCase',
            name: '_unused_foo',
            processedName: 'unused_foo',
            type: 'Variable',
          },
          line: 3,
          messageId: 'doesNotMatchFormatTrimmed',
        },
        {
          data: {
            formats: 'camelCase',
            name: 'foo_bar',
            type: 'Function',
          },
          line: 4,
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            name: 'IFoo',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
            type: 'Interface',
          },
          line: 5,
          messageId: 'satisfyCustom',
        },
        {
          data: {
            name: 'IBar',
            regex: '/^I[A-Z]/u',
            regexMatch: 'not match',
            type: 'Class',
          },
          line: 6,
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
          data: {
            formats: 'strictCamelCase',
            name: 'Property Name',
            type: 'Object Literal Property',
          },
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
        function fun(myfoo: string) {}
        class foo {
          Myfoo: string;
        }
      `,
      errors: Array(3).fill({ messageId: 'doesNotMatchFormatTrimmed' }),
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
      errors: [{ messageId: 'doesNotMatchFormat' }],
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
      errors: [{ messageId: 'doesNotMatchFormatTrimmed' }],
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
        export enum PascalCaseEnum {}
        export class PascalCaseClass {}
        export function PascalCaseFunction() {}
        export interface PascalCaseInterface {}
        export type PascalCaseType = {};
      `,
      errors: Array(6).fill({ messageId: 'doesNotMatchFormat' }),
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
      errors: Array(6).fill({ messageId: 'doesNotMatchFormat' }),
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
        function PascalCaseFunction() {}
        declare function PascalCaseDeclaredFunction();
      `,
      errors: Array(3).fill({ messageId: 'doesNotMatchFormat' }),
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
        const { some_name2 = 2 } = {};
        const { ignored: IgnoredDueToModifiers1 } = {};
        const { ignored: IgnoredDueToModifiers2 = 3 } = {};
        const IgnoredDueToModifiers3 = 1;
      `,
      errors: Array(2).fill({ messageId: 'doesNotMatchFormat' }),
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
          { anotherName = 1 },
          { ignored: IgnoredDueToModifiers1 },
          { ignored: IgnoredDueToModifiers1 = 2 },
          IgnoredDueToModifiers2,
        ) {}
      `,
      errors: Array(2).fill({ messageId: 'doesNotMatchFormat' }),
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
      errors: [{ messageId: 'doesNotMatchFormat' }],
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
      errors: [{ messageId: 'doesNotMatchFormat' }],
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
      errors: [{ messageId: 'doesNotMatchFormat' }],
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
      errors: [{ messageId: 'doesNotMatchFormat' }],
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
      errors: [{ messageId: 'doesNotMatchFormat' }],
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
      errors: Array(7).fill({ messageId: 'doesNotMatchFormat' }),
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
      errors: Array(13).fill({ messageId: 'doesNotMatchFormat' }),
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
      errors: [
        {
          data: {
            formats: 'snake_case',
            name: 'asyncBar',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            formats: 'snake_case',
            name: 'AsyncBar2',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            formats: 'snake_case',
            name: 'AsyncBar3',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            formats: 'snake_case',
            name: 'ASYNC_BAR',
            type: 'Class Method',
          },
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
      errors: [
        {
          data: {
            formats: 'snake_case',
            name: 'AsyncBar',
            type: 'Object Literal Method',
          },
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            formats: 'snake_case',
            name: 'AsyncBar2',
            type: 'Object Literal Method',
          },
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            formats: 'snake_case',
            name: 'AsyncBar3',
            type: 'Object Literal Method',
          },
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
        // ❌ error
        const asyncBar5 = async function async_bar6() {};
      `,
      errors: [
        {
          data: {
            formats: 'snake_case',
            name: 'AsyncBar1',
            type: 'Variable',
          },
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            formats: 'snake_case',
            name: 'asyncBar5',
            type: 'Variable',
          },
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
        const async_bar3 = async function async_bar4() {};
        async function async_bar2() {}
        // ❌ error
        const async_bar3 = async function ASYNC_BAR4() {};
      `,
      errors: [
        {
          data: {
            formats: 'snake_case',
            name: 'asyncBar2',
            type: 'Function',
          },
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            formats: 'snake_case',
            name: 'ASYNC_BAR4',
            type: 'Function',
          },
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
          data: {
            formats: 'snake_case',
            name: 'someAttributeOverride',
            type: 'Class Property',
          },
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
          data: {
            formats: 'snake_case',
            name: 'someMethodOverride',
            type: 'Class Method',
          },
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
          public set someSetter(val: string);
          public override set some_setter_override(val: string);
          // ❌ error
          public override set someSetterOverride(val: string);
        }
      `,
      errors: [
        {
          data: {
            formats: 'snake_case',
            name: 'someGetterOverride',
            type: 'Classic Accessor',
          },
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            formats: 'snake_case',
            name: 'someSetterOverride',
            type: 'Classic Accessor',
          },
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
          // ❌ error
          #secondPrivateField = 1;
          #second_private_field = 1;
        }
      `,
      errors: [
        {
          data: {
            formats: 'camelCase',
            name: 'first_private_field',
            type: 'Class Property',
          },
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            formats: 'snake_case',
            name: 'secondPrivateField',
            type: 'Class Property',
          },
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
          // ❌ error
          #secondPrivateMethod() {}
          #second_private_method() {}
        }
      `,
      errors: [
        {
          data: {
            formats: 'camelCase',
            name: 'first_private_method',
            type: 'Class Method',
          },
          messageId: 'doesNotMatchFormat',
        },
        {
          data: {
            formats: 'snake_case',
            name: 'secondPrivateMethod',
            type: 'Class Method',
          },
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
          data: {
            formats: 'PascalCase',
            name: 'fooBar',
            type: 'Import',
          },
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
          data: {
            formats: 'camelCase',
            name: 'FooBar',
            type: 'Import',
          },
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
          data: {
            formats: 'camelCase',
            name: 'foo_bar',
            type: 'Import',
          },
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
          data: {
            formats: 'PascalCase',
            name: 'foo',
            type: 'Import',
          },
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
