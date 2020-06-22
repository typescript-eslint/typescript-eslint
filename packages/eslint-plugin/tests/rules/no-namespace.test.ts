import rule from '../../src/rules/no-namespace';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-namespace', rule, {
  valid: [
    'declare global {}',
    "declare module 'foo' {}",
    {
      code: 'declare module foo {}',
      options: [{ allowDeclarations: true }],
    },
    {
      code: 'declare namespace foo {}',
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
declare global {
  namespace foo {}
}
      `,
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
declare module foo {
  namespace bar {}
}
      `,
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
declare global {
  namespace foo {
    namespace bar {}
  }
}
      `,
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
declare namespace foo {
  namespace bar {
    namespace baz {}
  }
}
      `,
      options: [{ allowDeclarations: true }],
    },
    {
      filename: 'test.d.ts',
      code: 'namespace foo {}',
      options: [{ allowDefinitionFiles: true }],
    },
    {
      filename: 'test.d.ts',
      code: 'module foo {}',
      options: [{ allowDefinitionFiles: true }],
    },
  ],
  invalid: [
    {
      code: 'module foo {}',
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'namespace foo {}',
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'module foo {}',
      options: [{ allowDeclarations: false }],
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'namespace foo {}',
      options: [{ allowDeclarations: false }],
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'module foo {}',
      options: [{ allowDeclarations: true }],
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'namespace foo {}',
      options: [{ allowDeclarations: true }],
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'declare module foo {}',
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'declare namespace foo {}',
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'declare module foo {}',
      options: [{ allowDeclarations: false }],
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'declare namespace foo {}',
      options: [{ allowDeclarations: false }],
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      filename: 'test.d.ts',
      code: 'namespace foo {}',
      options: [{ allowDefinitionFiles: false }],
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      filename: 'test.d.ts',
      code: 'module foo {}',
      options: [{ allowDefinitionFiles: false }],
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      filename: 'test.d.ts',
      code: 'declare module foo {}',
      options: [{ allowDefinitionFiles: false }],
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      filename: 'test.d.ts',
      code: 'declare namespace foo {}',
      options: [{ allowDefinitionFiles: false }],
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: 'namespace Foo.Bar {}',
      options: [{ allowDeclarations: false }],
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `
namespace Foo.Bar {
  namespace Baz.Bas {
    interface X {}
  }
}
      `,
      errors: [
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 2,
          column: 1,
        },
        {
          messageId: 'moduleSyntaxIsPreferred',
          line: 3,
          column: 3,
        },
      ],
    },
  ],
});
