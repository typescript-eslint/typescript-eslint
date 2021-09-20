import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/no-restricted-imports';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-restricted-imports', rule, {
  valid: [
    {
      code: "import foo from 'foo';",
      options: ['import1', 'import2'],
    },
    {
      code: "export { foo } from 'foo';",
      options: ['import1', 'import2'],
    },
    {
      code: "import foo from 'foo';",
      options: [{ paths: ['import1', 'import2'] }],
    },
    {
      code: "export { foo } from 'foo';",
      options: [{ paths: ['import1', 'import2'] }],
    },
    {
      code: "import foo from 'foo';",
      options: [
        {
          paths: ['import1', 'import2'],
          patterns: ['import1/private/*', 'import2/*', '!import2/good'],
        },
      ],
    },
    {
      code: "export { foo } from 'foo';",
      options: [
        {
          paths: ['import1', 'import2'],
          patterns: ['import1/private/*', 'import2/*', '!import2/good'],
        },
      ],
    },
    {
      code: "import foo from 'foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              message: 'Please use import-bar instead.',
            },
            {
              name: 'import-baz',
              message: 'Please use import-quux instead.',
            },
          ],
        },
      ],
    },
    {
      code: "export { foo } from 'foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              message: 'Please use import-bar instead.',
            },
            {
              name: 'import-baz',
              message: 'Please use import-quux instead.',
            },
          ],
        },
      ],
    },
    {
      code: "import foo from 'foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
            },
          ],
        },
      ],
    },
    {
      code: "export { foo } from 'foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
            },
          ],
        },
      ],
    },
    {
      code: "import foo from 'foo';",
      options: [
        {
          patterns: [
            {
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
            },
            {
              group: ['import2/*', '!import2/good'],
              message:
                'import2 is deprecated, except the modules in import2/good.',
            },
          ],
        },
      ],
    },
    {
      code: "export { foo } from 'foo';",
      options: [
        {
          patterns: [
            {
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
            },
            {
              group: ['import2/*', '!import2/good'],
              message:
                'import2 is deprecated, except the modules in import2/good.',
            },
          ],
        },
      ],
    },
    {
      code: "import type foo from 'import-foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              message: 'Please use import-bar instead.',
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
    {
      code: "import type { Bar } from 'import-foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
    {
      code: "export type { Bar } from 'import-foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
    {
      code: "import type foo from 'import1/private/bar';",
      options: [
        {
          patterns: [
            {
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
    {
      code: "export type { foo } from 'import1/private/bar';",
      options: [
        {
          patterns: [
            {
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
    {
      code: "export * from 'foo';",
      options: ['import1'],
    },
    {
      code: 'export { foo } from foo;',
      options: ['import1', 'import2'],
    },
    {
      code: 'import { foo } from foo;',
      options: ['import1', 'import2'],
    },
  ],
  invalid: [
    {
      code: "import foo from 'import1';",
      options: ['import1', 'import2'],
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
    },
    {
      code: "export { foo } from 'import1';",
      options: ['import1', 'import2'],
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
    },
    {
      code: "import foo from 'import1';",
      options: [{ paths: ['import1', 'import2'] }],
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
    },
    {
      code: "export { foo } from 'import1';",
      options: [{ paths: ['import1', 'import2'] }],
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
    },
    {
      code: "import foo from 'import1/private/foo';",
      options: [
        {
          paths: ['import1', 'import2'],
          patterns: ['import1/private/*', 'import2/*', '!import2/good'],
        },
      ],
      errors: [
        {
          messageId: 'patterns',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
    },
    {
      code: "export { foo } from 'import1/private/foo';",
      options: [
        {
          paths: ['import1', 'import2'],
          patterns: ['import1/private/*', 'import2/*', '!import2/good'],
        },
      ],
      errors: [
        {
          messageId: 'patterns',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
    },
    {
      code: "import foo from 'import-foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              message: 'Please use import-bar instead.',
            },
            {
              name: 'import-baz',
              message: 'Please use import-quux instead.',
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'pathWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
    },
    {
      code: "export { foo } from 'import-foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              message: 'Please use import-bar instead.',
            },
            {
              name: 'import-baz',
              message: 'Please use import-quux instead.',
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'pathWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
    },
    {
      code: "import { Bar } from 'import-foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
    },
    {
      code: "export { Bar } from 'import-foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
    },
    {
      code: "import foo from 'import1/private/foo';",
      options: [
        {
          patterns: [
            {
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
            },
            {
              group: ['import2/*', '!import2/good'],
              message:
                'import2 is deprecated, except the modules in import2/good.',
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'patternWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
    },
    {
      code: "export { foo } from 'import1/private/foo';",
      options: [
        {
          patterns: [
            {
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
            },
            {
              group: ['import2/*', '!import2/good'],
              message:
                'import2 is deprecated, except the modules in import2/good.',
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'patternWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
    },
    {
      code: "import foo from 'import-foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              message: 'Please use import-bar instead.',
              allowTypeImports: true,
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'pathWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
    },
    {
      code: "import { Bar } from 'import-foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              allowTypeImports: true,
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
    },
    {
      code: "export { Bar } from 'import-foo';",
      options: [
        {
          paths: [
            {
              name: 'import-foo',
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              allowTypeImports: true,
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
    },
    {
      code: "import foo from 'import1/private/bar';",
      options: [
        {
          patterns: [
            {
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
              allowTypeImports: true,
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'patternWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
    },
    {
      code: "export { foo } from 'import1/private/bar';",
      options: [
        {
          patterns: [
            {
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
              allowTypeImports: true,
            },
          ],
        },
      ],
      errors: [
        {
          messageId: 'patternWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
    },
    {
      code: "export * from 'import1';",
      options: ['import1'],
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ExportAllDeclaration,
        },
      ],
    },
  ],
});
