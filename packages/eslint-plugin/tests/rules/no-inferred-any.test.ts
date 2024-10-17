import { RuleTester } from '@typescript-eslint/rule-tester';

import type {
  MessageIds,
  OptionsObjectType,
} from '../../src/rules/no-inferred-any';

import rule from '../../src/rules/no-inferred-any';
import { getFixturesRootDir } from '../RuleTester';

const testCases = (
  {
    messageIds,
    options,
  }: {
    messageIds?: MessageIds[];
    options?: OptionsObjectType;
  },
  cases: string[],
): {
  code: string;
  errors: { messageId: MessageIds }[];
  options: [OptionsObjectType];
}[] =>
  cases.map(code => ({
    code,
    errors: (messageIds ?? []).map(messageId => ({ messageId })),
    options: [
      {
        checkExports: false,
        checkReturnTypes: false,
        checkVariables: false,
        ...options,
      },
    ] as const,
  }));

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    //parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
      //ecmaVersion: 2018,
      //ecmaFeatures: {
      //jsx: true,
      //},
      // Needed to use import statements in test cases
      //sourceType: 'module',
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

ruleTester.run('no-inferred-any', rule, {
  valid: [
    ...testCases(
      {
        options: {
          checkReturnTypes: true,
        },
      },
      [
        `
      function f(): any {
        return (0 as any);
      }
      `,

        `
      function f(): any {
        return 0;
      }
      `,

        `
      function f() {
        return 0;
      }
      `,

        `
      type F = () => any;

      const f: F = function() { return (0 as any); };
      `,

        `
      type F = () => () => any;

      const f: F = function() { return function() { return (0 as any); } };
      `,

        `
      type F = () => () => any;

      const f: F = () => () => (0 as any);
      `,

        `
      const f = () => (): () => number => () => (0 as any);
      `,

        `
      function f(): () => number {
        return () => (0 as any);
      }
      `,

        `
      const x = (): any => function () {
        return (0 as any);
      };
      `,

        `
      class Test {
        public test(): any {
          return (0 as any);
        }
      }
      `,
      ],
    ),

    ...testCases(
      {
        options: {
          checkVariables: true,
        },
      },
      [
        `
      const x: any = (0 as any);
      `,
      ],
    ),

    ...testCases(
      {
        options: {
          checkExports: true,
        },
      },
      [
        `
      export const x: any = (0 as any);
      `,

        `
      type T = unknown;

      export { T };
      `,

        `
      import { good } from './no-inferred-any/exports-any';

      export { good };
      `,

        `
      export { good } from './no-inferred-any/exports-any';
      `,
      ],
    ),

    ...testCases({}, [
      `
      const x = (0 as any);
      `,
    ]),
  ],
  invalid: [
    ...testCases(
      {
        messageIds: ['returnedAny'],
        options: {
          checkReturnTypes: true,
        },
      },
      [
        `
      function f() {
        return (0 as any);
      }
      `,

        `
      function f() {
        const x: any = {};
        return x;
      }
      `,

        `
      const f = () => () => () => (0 as any);
      `,

        `
      class Test {
        public test() {
          return (0 as any);
        }
      }
      `,
      ],
    ),

    ...testCases(
      {
        messageIds: ['variableAny'],
        options: {
          checkVariables: true,
        },
      },
      [
        `
      const x = (0 as any);
      `,

        `
      const f = (): any => (0 as any);

      const x = f();
      `,
      ],
    ),

    ...testCases(
      {
        messageIds: ['exportedAny'],
        options: {
          checkExports: true,
        },
      },
      [
        `
      export const x = (0 as any);
      `,

        `
      const x = (0 as any);

      export { x };
      `,

        `
      import { good, bad } from './no-inferred-any/exports-any';

      export { good, bad };
      `,

        `
      export { good, bad } from './no-inferred-any/exports-any';
      `,
      ],
    ),

    ...testCases(
      {
        messageIds: ['exportedAnyFunc'],
        options: {
          checkExports: true,
        },
      },
      [
        `
      export const f = () => (0 as any);
      `,

        `
      export const f = () => () => (0 as any);
      `,

        `
      export const f = () => () => () => (0 as any);
      `,

        `
      export const f = () => () => () => () => (0 as any);
      `,
        `
      export const f = () => () => () => () => () => (0 as any);
      `,

        `
      export const f = () => () => function () { return 0 as any; };
      `,

        `
      export const f = () => (0 as any);

      export { f };
      `,
      ],
    ),
  ],
});
