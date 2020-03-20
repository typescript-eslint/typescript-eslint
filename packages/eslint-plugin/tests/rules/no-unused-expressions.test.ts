import rule from '../../src/rules/no-unused-expressions';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('no-unused-expressions', rule, {
  valid: [
    `
      test.age?.toLocaleString();
    `,
    `
      let a = (a?.b).c;
    `,
    `
      let b = a?.['b'];
    `,
    `
      let c = one[2]?.[3][4];
    `,
    `
      one[2]?.[3][4]?.();
    `,
    `
      a?.['b']?.c();
    `,
    `
      module Foo {
        'use strict';
      }
    `,
    `
      namespace Foo {
        'use strict';

        export class Foo {}
        export class Bar {}
      }
    `,
    `
      function foo() {
        'use strict';

        return null;
      }
    `,
  ],
  invalid: [
    {
      code: `
if(0) 0
      `,
      errors: [
        {
          line: 2,
          column: 7,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
f(0), {}
      `,
      errors: [
        {
          line: 2,
          column: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
a, b()
      `,
      errors: [
        {
          line: 2,
          column: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
a() && function namedFunctionInExpressionContext () {f();}
      `,
      errors: [
        {
          line: 2,
          column: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
a?.b
      `,
      errors: [
        {
          line: 2,
          column: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
(a?.b).c
      `,
      errors: [
        {
          line: 2,
          column: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
a?.['b']
      `,
      errors: [
        {
          line: 2,
          column: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
(a?.['b']).c
        `,
      errors: [
        {
          line: 2,
          column: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
a?.b()?.c
        `,
      errors: [
        {
          line: 2,
          column: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
(a?.b()).c
        `,
      errors: [
        {
          line: 2,
          column: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
one[2]?.[3][4];
        `,
      errors: [
        {
          line: 2,
          column: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
one.two?.three.four;
        `,
      errors: [
        {
          line: 2,
          column: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
module Foo {
  const foo = true;
  'use strict';
}
      `,
      errors: [
        {
          line: 4,
          endLine: 4,
          column: 3,
          endColumn: 16,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
namespace Foo {
  export class Foo {}
  export class Bar {}

  'use strict';
}
      `,
      errors: [
        {
          line: 6,
          endLine: 6,
          column: 3,
          endColumn: 16,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
function foo() {
  const foo = true;

  'use strict';
}
      `,
      errors: [
        {
          line: 5,
          endLine: 5,
          column: 3,
          endColumn: 16,
          messageId: 'unusedExpression',
        },
      ],
    },
  ],
});
