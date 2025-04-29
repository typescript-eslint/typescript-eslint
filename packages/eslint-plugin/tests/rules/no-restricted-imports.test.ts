import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import rule from '../../src/rules/no-restricted-imports';

const ruleTester = new RuleTester();

ruleTester.run('no-restricted-imports', rule, {
  valid: [
    "import foo from 'foo';",
    "import foo = require('foo');",
    "import 'foo';",
    {
      code: "import foo from 'foo';",
      options: ['import1', 'import2'],
    },
    {
      code: "import foo = require('foo');",
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
      code: "import 'foo';",
      options: ['import1', 'import2'],
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
              message: 'Please use import-bar instead.',
              name: 'import-foo',
            },
            {
              message: 'Please use import-quux instead.',
              name: 'import-baz',
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
              message: 'Please use import-bar instead.',
              name: 'import-foo',
            },
            {
              message: 'Please use import-quux instead.',
              name: 'import-baz',
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
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              name: 'import-foo',
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
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              name: 'import-foo',
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
      code: "import foo = require('foo');",
      options: [
        {
          paths: [
            {
              importNames: ['foo'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              name: 'foo',
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
              allowTypeImports: true,
              message: 'Please use import-bar instead.',
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "import type _ = require('import-foo');",
      options: [
        {
          paths: [
            {
              allowTypeImports: true,
              message: 'Please use import-bar instead.',
              name: 'import-foo',
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
              allowTypeImports: true,
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              name: 'import-foo',
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
              allowTypeImports: true,
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              name: 'import-foo',
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
              allowTypeImports: true,
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
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
              allowTypeImports: true,
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
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
      code: "import type { MyType } from './types';",
      options: [
        {
          patterns: [
            {
              allowTypeImports: true,
              group: ['fail'],
              message: "Please do not load from 'fail'.",
            },
          ],
        },
      ],
    },
    {
      code: `
import type { foo } from 'import1/private/bar';
import type { foo } from 'import2/private/bar';
      `,
      options: [
        {
          patterns: [
            {
              allowTypeImports: true,
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
            },
            {
              allowTypeImports: true,
              group: ['import2/private/*'],
              message: 'usage of import2 private modules not allowed.',
            },
          ],
        },
      ],
    },
    {
      code: `
import type { foo } from 'import1/private/bar';
import type { foo } from 'import2/private/bar';
      `,
      options: [
        {
          patterns: [
            {
              allowTypeImports: true,
              message: 'usage of import1 private modules not allowed.',
              regex: 'import1/.*',
            },
            {
              allowTypeImports: true,
              message: 'usage of import2 private modules not allowed.',
              regex: 'import2/.*',
            },
          ],
        },
      ],
    },
    {
      code: "import { foo } from 'import1/private';",
      options: [
        {
          patterns: [
            {
              allowTypeImports: true,
              caseSensitive: true,
              message: 'usage of import1 private modules not allowed.',
              regex: 'import1/[A-Z]+',
            },
          ],
        },
      ],
    },
    {
      code: "import { type Bar } from 'import-foo';",
      options: [
        {
          paths: [
            {
              allowTypeImports: true,
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "export { type Bar } from 'import-foo';",
      options: [
        {
          paths: [
            {
              allowTypeImports: true,
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "import foo from 'foo';",
      options: [],
    },
    {
      code: "import foo from 'foo';",
      options: [
        {
          paths: [],
        },
      ],
    },
    {
      code: "import foo from 'foo';",
      options: [
        {
          patterns: [],
        },
      ],
    },
    {
      code: "import foo from 'foo';",
      options: [
        {
          paths: [],
          patterns: [],
        },
      ],
    },
  ],
  invalid: [
    {
      code: "import foo from 'import1';",
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: ['import1', 'import2'],
    },
    {
      code: "import foo = require('import1');",
      errors: [
        {
          messageId: 'path',
        },
      ],
      options: ['import1', 'import2'],
    },
    {
      code: "export { foo } from 'import1';",
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
      options: ['import1', 'import2'],
    },
    {
      code: "import foo from 'import1';",
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [{ paths: ['import1', 'import2'] }],
    },
    {
      code: "export { foo } from 'import1';",
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
      options: [{ paths: ['import1', 'import2'] }],
    },
    {
      code: "import foo from 'import1/private/foo';",
      errors: [
        {
          messageId: 'patterns',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [
        {
          paths: ['import1', 'import2'],
          patterns: ['import1/private/*', 'import2/*', '!import2/good'],
        },
      ],
    },
    {
      code: "export { foo } from 'import1/private/foo';",
      errors: [
        {
          messageId: 'patterns',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
      options: [
        {
          paths: ['import1', 'import2'],
          patterns: ['import1/private/*', 'import2/*', '!import2/good'],
        },
      ],
    },
    {
      code: "import foo from 'import-foo';",
      errors: [
        {
          messageId: 'pathWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [
        {
          paths: [
            {
              message: 'Please use import-bar instead.',
              name: 'import-foo',
            },
            {
              message: 'Please use import-quux instead.',
              name: 'import-baz',
            },
          ],
        },
      ],
    },
    {
      code: "export { foo } from 'import-foo';",
      errors: [
        {
          messageId: 'pathWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
      options: [
        {
          paths: [
            {
              message: 'Please use import-bar instead.',
              name: 'import-foo',
            },
            {
              message: 'Please use import-quux instead.',
              name: 'import-baz',
            },
          ],
        },
      ],
    },
    {
      code: "import { Bar } from 'import-foo';",
      errors: [
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [
        {
          paths: [
            {
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "export { Bar } from 'import-foo';",
      errors: [
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
      options: [
        {
          paths: [
            {
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "import foo from 'import1/private/foo';",
      errors: [
        {
          messageId: 'patternWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
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
      code: "export { foo } from 'import1/private/foo';",
      errors: [
        {
          messageId: 'patternWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
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
      code: "import 'import-foo';",
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [
        {
          paths: [
            {
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "import 'import-foo';",
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [
        {
          paths: [
            {
              allowTypeImports: true,
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "import foo from 'import-foo';",
      errors: [
        {
          messageId: 'pathWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [
        {
          paths: [
            {
              allowTypeImports: true,
              message: 'Please use import-bar instead.',
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "import foo = require('import-foo');",
      errors: [
        {
          messageId: 'pathWithCustomMessage',
        },
      ],
      options: [
        {
          paths: [
            {
              allowTypeImports: true,
              message: 'Please use import-bar instead.',
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "import { Bar } from 'import-foo';",
      errors: [
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [
        {
          paths: [
            {
              allowTypeImports: true,
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "export { Bar } from 'import-foo';",
      errors: [
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
      options: [
        {
          paths: [
            {
              allowTypeImports: true,
              importNames: ['Bar'],
              message: 'Please use Bar from /import-bar/baz/ instead.',
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "import foo from 'import1/private/bar';",
      errors: [
        {
          messageId: 'patternWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [
        {
          patterns: [
            {
              allowTypeImports: true,
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
            },
          ],
        },
      ],
    },
    {
      code: "export { foo } from 'import1/private/bar';",
      errors: [
        {
          messageId: 'patternWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
      options: [
        {
          patterns: [
            {
              allowTypeImports: true,
              group: ['import1/private/*'],
              message: 'usage of import1 private modules not allowed.',
            },
          ],
        },
      ],
    },
    {
      code: "export { foo } from 'import1/private/bar';",
      errors: [
        {
          messageId: 'patternWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
      options: [
        {
          patterns: [
            {
              allowTypeImports: true,
              message: 'usage of import1 private modules not allowed.',
              regex: 'import1/.*',
            },
          ],
        },
      ],
    },
    {
      code: "import { foo } from 'import1/private-package';",
      errors: [
        {
          messageId: 'patternWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [
        {
          patterns: [
            {
              allowTypeImports: true,
              caseSensitive: true,
              message: 'usage of import1 private modules not allowed.',
              regex: 'import1/private-[a-z]*',
            },
          ],
        },
      ],
    },
    {
      code: "export * from 'import1';",
      errors: [
        {
          messageId: 'path',
          type: AST_NODE_TYPES.ExportAllDeclaration,
        },
      ],
      options: ['import1'],
    },
    {
      code: "import type { InvalidTestCase } from '@typescript-eslint/utils/dist/ts-eslint';",
      errors: [
        {
          messageId: 'patterns',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [
        {
          patterns: ['@typescript-eslint/utils/dist/*'],
        },
      ],
    },
    {
      code: "import { Bar, type Baz } from 'import-foo';",
      errors: [
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ImportDeclaration,
        },
      ],
      options: [
        {
          paths: [
            {
              allowTypeImports: true,
              importNames: ['Bar', 'Baz'],
              message: 'Please use Bar and Baz from /import-bar/baz/ instead.',
              name: 'import-foo',
            },
          ],
        },
      ],
    },
    {
      code: "export { Bar, type Baz } from 'import-foo';",
      errors: [
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
        {
          messageId: 'importNameWithCustomMessage',
          type: AST_NODE_TYPES.ExportNamedDeclaration,
        },
      ],
      options: [
        {
          paths: [
            {
              allowTypeImports: true,
              importNames: ['Bar', 'Baz'],
              message: 'Please use Bar and Baz from /import-bar/baz/ instead.',
              name: 'import-foo',
            },
          ],
        },
      ],
    },
  ],
});
