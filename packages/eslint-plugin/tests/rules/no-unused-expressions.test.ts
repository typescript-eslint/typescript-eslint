import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unused-expressions';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 6,
    },
  },
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
    `
      import('./foo');
    `,
    `
      import('./foo').then(() => {});
    `,
    `
      class Foo<T> {}
      new Foo<string>();
    `,
    {
      code: 'foo && foo?.();',
      options: [{ allowShortCircuit: true }],
    },
    {
      code: "foo && import('./foo');",
      options: [{ allowShortCircuit: true }],
    },
    {
      code: "foo ? import('./foo') : import('./bar');",
      options: [{ allowTernary: true }],
    },
  ],
  invalid: [
    {
      code: 'if (0) 0;',
      errors: [
        {
          column: 8,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: '(f(0), {});',
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: '(a, b());',
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
a() &&
  function namedFunctionInExpressionContext() {
    f();
  };
      `,
      errors: [
        {
          column: 1,
          endColumn: 5,
          endLine: 5,
          line: 2,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: 'a?.b;',
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: '(a?.b).c;',
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: "a?.['b'];",
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: "(a?.['b']).c;",
      errors: [
        {
          column: 1,
          endColumn: 14,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: 'a?.b()?.c;',
      errors: [
        {
          column: 1,
          endColumn: 11,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: '(a?.b()).c;',
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: 'one[2]?.[3][4];',
      errors: [
        {
          column: 1,
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: 'one.two?.three.four;',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
module Foo {
  const foo = true;
  ('use strict');
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 16,
          endLine: 4,
          line: 4,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
namespace Foo {
  export class Foo {}
  export class Bar {}

  ('use strict');
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 16,
          endLine: 6,
          line: 6,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
function foo() {
  const foo = true;

  ('use strict');
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 5,
          line: 5,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: 'foo && foo?.bar;',
      errors: [
        {
          column: 1,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
      options: [{ allowShortCircuit: true }],
    },
    {
      code: 'foo ? foo?.bar : bar.baz;',
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
      options: [{ allowTernary: true }],
    },
    {
      code: `
class Foo<T> {}
Foo<string>;
      `,
      errors: [
        {
          column: 1,
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: 'Map<string, string>;',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
declare const foo: number | undefined;
foo;
      `,
      errors: [
        {
          column: 1,
          endColumn: 5,
          endLine: 3,
          line: 3,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
declare const foo: number | undefined;
foo as any;
      `,
      errors: [
        {
          column: 1,
          endColumn: 12,
          endLine: 3,
          line: 3,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: noFormat`
declare const foo: number | undefined;
<any>foo;
      `,
      errors: [
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
          messageId: 'unusedExpression',
        },
      ],
    },
    {
      code: `
declare const foo: number | undefined;
foo!;
      `,
      errors: [
        {
          column: 1,
          endColumn: 6,
          endLine: 3,
          line: 3,
          messageId: 'unusedExpression',
        },
      ],
    },
  ],
});
