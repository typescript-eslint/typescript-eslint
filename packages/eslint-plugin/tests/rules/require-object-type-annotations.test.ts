import rule from '../../src/rules/require-object-type-annotations';
import { getFixturesRootDir, RuleTester } from '../RuleTester';

const rootDir = getFixturesRootDir();

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: rootDir,
    project: './tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('require-object-type-annotations', rule, {
  valid: [
    {
      code: `
        const x = {};
      `,
    },
    {
      code: `
        const x: { prop: number } = { prop: 1 };
      `,
    },
    {
      code: `
        const x: { [key: string]: any } = { prop: { prop: 1 } };
      `,
    },
    {
      code: `
        const x: { [key: string]: unknown } = { prop: { prop: 1 } };
      `,
    },
    {
      code: `
        const xs: Array<{ prop: number }> = [{ prop: 1 }];
      `,
    },
    {
      code: `
        const fn: () => { prop: number } = () => ({ prop: 1 });
      `,
    },
    {
      code: `
        const fn = (): { prop: number } => ({ prop: 1 });
      `,
    },
    {
      code: `
        declare const f: (x: { prop: number }) => unknown;
        f({ prop: 1 });
      `,
    },
    {
      code: `
        declare const f: { g: (x: { prop: number }) => unknown };
        f.g({ prop: 1 });
      `,
    },
    {
      code: `
        declare const f: <T>(x: { [key: string]: T }) => T;
        f({ prop: 1 });
      `,
    },
    {
      code: `
        declare const mk: <T>() => (t: T) => unknown;
        const f = mk<{ prop: number }>();
        f({ prop: 1 });
      `,
    },
    {
      code: `
        declare const f: (arg: () => { prop: number }) => unknown;
        f(() => ({ prop: 1 }));
      `,
    },
    {
      code: `
        interface Base {}

        type MyType = Base & {
          prop: string;
        };

        interface A extends MyType {}
        interface B extends MyType {}

        type Union = A | B;

        declare const union: Union;
        const v: MyType = { ...union };
      `,
    },
  ],
  invalid: [
    {
      code: `
        const x = { prop: 1 };
      `,
      errors: [{ messageId: 'forbidden' }],
    },
    {
      code: `
        const xs = [{ prop: 1 }];
      `,
      errors: [{ messageId: 'forbidden' }],
    },
    {
      code: `
        const fn = () => ({ prop: 1 });
      `,
      errors: [{ messageId: 'forbidden' }],
    },
    {
      code: `
        declare const f: <T>(x: T) => T;
        f({ prop: 1 });
      `,
      errors: [{ messageId: 'forbidden' }],
    },
    {
      code: `
        declare const f: <T>(x: T) => T;
        const x: { prop: number } = f({ prop: 1 });
      `,
      errors: [{ messageId: 'forbidden' }],
    },
    {
      code: `
        declare const f: <T extends { prop: number }>(x: T) => T;
        f({ prop: 1 });
      `,
      errors: [{ messageId: 'forbidden' }],
    },
    {
      code: `
        declare const f: <T>(x: { [key: string]: T }) => T;
        f({ prop: { prop: 1 } });
      `,
      errors: [{ messageId: 'forbidden' }],
    },
  ],
});
