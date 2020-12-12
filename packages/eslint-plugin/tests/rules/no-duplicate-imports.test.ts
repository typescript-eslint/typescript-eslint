import rule from '../../src/rules/no-duplicate-imports';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-duplicate-imports', rule, {
  valid: [
    {
      code: "import type foo from 'foo';",
    },
    {
      code: "import type { foo } from 'foo';",
    },
    {
      code: `
        import type { foo } from 'foo';
        import type Bar from 'foo';
      `,
    },
    {
      code: `
        import type Foo from 'foo';
        import type { bar } from 'foo';
      `,
    },
    {
      code: `
        import type Foo from 'foo';
        import type { bar as Bar } from 'foo';
      `,
    },
    {
      code: `
        import foo from 'foo';
        import type bar from 'foo';
      `,
    },
    {
      code: `
        import { foo } from 'foo';
        import type { bar } from 'foo';
      `,
    },
    {
      code: `
        import type { foo } from 'foo';
        export type foo = foo;
      `,
    },
    {
      code: `
        import type { foo } from 'foo';
        export type { foo };
      `,
    },
    {
      code: `
        export { foo } from 'foo';
        export type { foo } from 'foo';
      `,
    },
    {
      code: `
        export type * as foo from 'foo';
        export type * as bar from 'foo';
      `,
    },
    {
      code: `
        import type { bar } from 'foo';
        export type { foo } from 'foo';
      `,
    },
    {
      code: `
        import type { foo } from 'foo';
        export type { bar } from 'bar';
      `,
      options: [{ includeExports: true }],
    },
    {
      code: `
        import type { foo } from 'foo';
        export type { bar };
      `,
      options: [{ includeExports: true }],
    },
    {
      code: `
        import type Foo from 'foo';
        import type { bar } from 'foo';
        export type { bar };
      `,
      options: [{ includeExports: true }],
    },
  ],
  invalid: [
    {
      code: `
        import type foo from 'foo';
        import type bar from 'foo';
      `,
      errors: [
        {
          messageId: 'importType',
          data: {
            module: 'foo',
          },
        },
      ],
    },
    {
      code: `
        import type { foo } from 'foo';
        import type { bar } from 'foo';
      `,
      errors: [{ messageId: 'importType' }],
    },
    {
      code: `
        export type { foo } from 'foo';
        import type { bar } from 'foo';
      `,
      options: [{ includeExports: true }],
      errors: [{ messageId: 'importTypeAs' }],
    },
    {
      code: `
        import type foo from 'foo';
        export type * from 'foo';
      `,
      options: [{ includeExports: true }],
      errors: [{ messageId: 'exportTypeAs' }],
    },
    {
      code: `
        import type { foo } from 'foo';
        export type { foo } from 'foo';
      `,
      options: [{ includeExports: true }],
      errors: [{ messageId: 'exportTypeAs' }],
    },
    {
      code: `
        import type Foo from 'foo';
        import type { bar } from 'foo';
        export type { bar } from 'foo';
      `,
      options: [{ includeExports: true }],
      errors: [{ messageId: 'exportTypeAs' }],
    },
    {
      code: `
        export type * as foo from 'foo';
        export type * as bar from 'foo';
      `,
      options: [{ includeExports: true }],
      errors: [{ messageId: 'exportType' }],
    },

    // check base rule
    {
      code: `
        import foo from 'foo';
        import bar from 'foo';
      `,
      errors: [{ messageId: 'import' }],
    },
    {
      code: `
        import foo from 'foo';
        export * from 'foo';
      `,
      options: [{ includeExports: true }],
      errors: [{ messageId: 'exportAs' }],
    },
    {
      code: `
        import foo from 'foo';
        export { foo } from 'foo';
      `,
      options: [{ includeExports: true }],
      errors: [{ messageId: 'exportAs' }],
    },
  ],
});
