import rule from '../../src/rules/prefer-readonly-parameter-types';
import { RuleTester, getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

const primitives = [
  'boolean',
  'true',
  'string',
  "'a'",
  'number',
  '1',
  'any',
  'unknown',
  'never',
  'null',
  'undefined',
];

ruleTester.run('prefer-readonly-parameter-types', rule, {
  valid: [
    // primitives
    ...primitives.map(type => `function foo(arg: ${type}) {}`),

    // arrays
    'function foo(arg: readonly string[]) {}',
    'function foo(arg: Readonly<string[]>) {}',
    'function foo(arg: ReadonlyArray<string>) {}',
    'function foo(arg: ReadonlyArray<string> | ReadonlyArray<number>) {}',

    // functions
    'function foo(arg: () => void) {}',
    `
      interface ImmutablePropFunction {
        (): void
        readonly immutable: boolean
      }
      function foo(arg: ImmutablePropFunction) {}
    `,

    // unions
    'function foo(arg: string | null) {}',
    'function foo(arg: string | ReadonlyArray<string>) {}',
    'function foo(arg: string | (() => void)) {}',
  ],
  invalid: [
    {
      code: 'function foo(arg: string[]) {}',
      errors: [
        {
          messageId: 'shouldBeReadonly',
          data: {
            type: 'Parameters',
          },
        },
      ],
    },
    {
      code: `
        interface MutablePropFunction {
          (): void
          mutable: boolean
        }
        function foo(arg: MutablePropFunction) {}
      `,
      errors: [],
    },
  ],
});
