/**
 * @fileoverview Warns when a namespace qualifier is unnecessary.
 * @author Benjamin Lichtman
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------
const path = require('path');

const rule = require('../../../lib/rules/no-unnecessary-qualifier'),
  RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const rootPath = path.join(process.cwd(), 'tests/fixtures/');

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json'
  }
});

ruleTester.run('no-unnecessary-qualifier', rule, {
  valid: [
    `
namespace X {
    export type T = number;
    namespace Y {
        type T = string;
        const x: X.T = 0;
    }
}`
  ],

  invalid: [
    {
      code: `
namespace A {
  export type B = number;
  const x: A.B = 3;
}`,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: 'Identifier'
        }
      ],
      output: `
namespace A {
  export type B = number;
  const x: B = 3;
}`
    },
    {
      code: `
namespace A {
  export const x = 3;
  export const y = A.x;
}`,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: 'Identifier'
        }
      ],
      output: `
namespace A {
  export const x = 3;
  export const y = x;
}`
    },
    {
      code: `
namespace A {
  export type T = number;
  export namespace B {
    const x: A.T = 3;
  }
}`,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: 'Identifier'
        }
      ],
      output: `
namespace A {
  export type T = number;
  export namespace B {
    const x: T = 3;
  }
}`
    },
    {
      code: `
namespace A {
  export namespace B {
    export type T = number;
    const x: A.B.T = 3;
  }
}`,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: 'TSQualifiedName'
        }
      ],
      output: `
namespace A {
  export namespace B {
    export type T = number;
    const x: T = 3;
  }
}`
    },
    {
      code: `
namespace A {
  export namespace B {
    export const x = 3;
    const y = A.B.x;
  }
}`,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: 'MemberExpression'
        }
      ],
      output: `
namespace A {
  export namespace B {
    export const x = 3;
    const y = x;
  }
}`
    },
    {
      code: `
enum A {
  B,
  C = A.B
}`,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: 'Identifier'
        }
      ],
      output: `
enum A {
  B,
  C = B
}`
    },
    {
      code: `
namespace Foo {
  export enum A {
    B,
    C = Foo.A.B
  }
}`,
      errors: [
        {
          messageId: 'unnecessaryQualifier',
          type: 'MemberExpression'
        }
      ],
      output: `
namespace Foo {
  export enum A {
    B,
    C = B
  }
}`
    }
  ]
});
