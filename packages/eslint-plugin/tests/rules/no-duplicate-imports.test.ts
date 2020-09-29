import rule from '../../src/rules/no-duplicate-imports';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-dupe-class-members', rule, {
  valid: [
    {
      code: "import type foo from 'foo';",
    },
    {
      code: "import type { foo } from 'foo';",
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
  ],
});
