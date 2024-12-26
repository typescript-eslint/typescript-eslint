import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-namespace';

const ruleTester = new RuleTester();

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
      code: `
export declare namespace foo {
  export namespace bar {
    namespace baz {}
  }
}
      `,
      options: [{ allowDeclarations: true }],
    },
    {
      code: 'namespace foo {}',
      filename: 'test.d.ts',
      options: [{ allowDefinitionFiles: true }],
    },
    {
      code: 'module foo {}',
      filename: 'test.d.ts',
      options: [{ allowDefinitionFiles: true }],
    },
  ],
  invalid: [
    {
      code: 'module foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
    },
    {
      code: 'namespace foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
    },
    {
      code: 'module foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: false }],
    },
    {
      code: 'namespace foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: false }],
    },
    {
      code: 'module foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: 'namespace foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: 'declare module foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
    },
    {
      code: 'declare namespace foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
    },
    {
      code: 'declare module foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: false }],
    },
    {
      code: 'declare namespace foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: false }],
    },
    {
      code: 'namespace foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      filename: 'test.d.ts',
      options: [{ allowDefinitionFiles: false }],
    },
    {
      code: 'module foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      filename: 'test.d.ts',
      options: [{ allowDefinitionFiles: false }],
    },
    {
      code: 'declare module foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      filename: 'test.d.ts',
      options: [{ allowDefinitionFiles: false }],
    },
    {
      code: 'declare namespace foo {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      filename: 'test.d.ts',
      options: [{ allowDefinitionFiles: false }],
    },
    {
      code: 'namespace Foo.Bar {}',
      errors: [
        {
          column: 1,
          line: 1,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: false }],
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
          column: 1,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
        {
          column: 3,
          line: 3,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
    },
    {
      code: `
namespace A {
  namespace B {
    declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
        {
          column: 3,
          line: 3,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
namespace A {
  namespace B {
    export declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
        {
          column: 3,
          line: 3,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
namespace A {
  declare namespace B {
    namespace C {}
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
namespace A {
  export declare namespace B {
    namespace C {}
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
namespace A {
  export declare namespace B {
    declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
namespace A {
  export declare namespace B {
    export declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
namespace A {
  declare namespace B {
    export declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
namespace A {
  export namespace B {
    export declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 1,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
        {
          column: 10,
          line: 3,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
export namespace A {
  namespace B {
    declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 8,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
        {
          column: 3,
          line: 3,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
export namespace A {
  namespace B {
    export declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 8,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
        {
          column: 3,
          line: 3,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
export namespace A {
  declare namespace B {
    namespace C {}
  }
}
      `,
      errors: [
        {
          column: 8,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
export namespace A {
  export declare namespace B {
    namespace C {}
  }
}
      `,
      errors: [
        {
          column: 8,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
export namespace A {
  export declare namespace B {
    declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 8,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
export namespace A {
  export declare namespace B {
    export declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 8,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
export namespace A {
  declare namespace B {
    export declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 8,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
    {
      code: `
export namespace A {
  export namespace B {
    export declare namespace C {}
  }
}
      `,
      errors: [
        {
          column: 8,
          line: 2,
          messageId: 'moduleSyntaxIsPreferred',
        },
        {
          column: 10,
          line: 3,
          messageId: 'moduleSyntaxIsPreferred',
        },
      ],
      options: [{ allowDeclarations: true }],
    },
  ],
});
