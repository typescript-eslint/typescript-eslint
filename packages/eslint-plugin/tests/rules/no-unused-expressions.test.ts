import type { TestCaseError } from '@typescript-eslint/rule-tester';

import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-unused-expressions';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 6,
    },
  },
});

type RuleTestCaseError = Omit<TestCaseError<string>, 'messageId'>;

// the base rule doesn't have messageIds
function error(
  messages: RuleTestCaseError[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] {
  return messages.map(message => ({
    ...message,
    message:
      'Expected an assignment or function call and instead saw an expression.',
  }));
}

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
      code: `
if (0) 0;
      `,
      errors: error([
        {
          column: 8,
          line: 2,
        },
      ]),
    },
    {
      code: `
f(0), {};
      `,
      errors: error([
        {
          column: 1,
          line: 2,
        },
      ]),
    },
    {
      code: `
a, b();
      `,
      errors: error([
        {
          column: 1,
          line: 2,
        },
      ]),
    },
    {
      code: `
a() &&
  function namedFunctionInExpressionContext() {
    f();
  };
      `,
      errors: error([
        {
          column: 1,
          line: 2,
        },
      ]),
    },
    {
      code: `
a?.b;
      `,
      errors: error([
        {
          column: 1,
          line: 2,
        },
      ]),
    },
    {
      code: `
(a?.b).c;
      `,
      errors: error([
        {
          column: 1,
          line: 2,
        },
      ]),
    },
    {
      code: `
a?.['b'];
      `,
      errors: error([
        {
          column: 1,
          line: 2,
        },
      ]),
    },
    {
      code: `
(a?.['b']).c;
      `,
      errors: error([
        {
          column: 1,
          line: 2,
        },
      ]),
    },
    {
      code: `
a?.b()?.c;
      `,
      errors: error([
        {
          column: 1,
          line: 2,
        },
      ]),
    },
    {
      code: `
(a?.b()).c;
      `,
      errors: error([
        {
          column: 1,
          line: 2,
        },
      ]),
    },
    {
      code: `
one[2]?.[3][4];
      `,
      errors: error([
        {
          column: 1,
          line: 2,
        },
      ]),
    },
    {
      code: `
one.two?.three.four;
      `,
      errors: error([
        {
          column: 1,
          line: 2,
        },
      ]),
    },
    {
      code: `
module Foo {
  const foo = true;
  'use strict';
}
      `,
      errors: error([
        {
          column: 3,
          endColumn: 16,
          endLine: 4,
          line: 4,
        },
      ]),
    },
    {
      code: `
namespace Foo {
  export class Foo {}
  export class Bar {}

  'use strict';
}
      `,
      errors: error([
        {
          column: 3,
          endColumn: 16,
          endLine: 6,
          line: 6,
        },
      ]),
    },
    {
      code: noFormat`
function foo() {
  const foo = true;

  'use strict';
}
      `,
      errors: error([
        {
          column: 3,
          endColumn: 16,
          endLine: 5,
          line: 5,
        },
      ]),
    },
    {
      code: 'foo && foo?.bar;',
      errors: error([
        {
          column: 1,
          endColumn: 17,
          endLine: 1,
          line: 1,
        },
      ]),
      options: [{ allowShortCircuit: true }],
    },
    {
      code: 'foo ? foo?.bar : bar.baz;',
      errors: error([
        {
          column: 1,
          endColumn: 26,
          endLine: 1,
          line: 1,
        },
      ]),
      options: [{ allowTernary: true }],
    },
    {
      code: `
class Foo<T> {}
Foo<string>;
      `,
      errors: error([
        {
          column: 1,
          endColumn: 13,
          endLine: 3,
          line: 3,
        },
      ]),
    },
    {
      code: 'Map<string, string>;',
      errors: error([
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
        },
      ]),
    },
    {
      code: `
declare const foo: number | undefined;
foo;
      `,
      errors: error([
        {
          column: 1,
          endColumn: 5,
          endLine: 3,
          line: 3,
        },
      ]),
    },
    {
      code: `
declare const foo: number | undefined;
foo as any;
      `,
      errors: error([
        {
          column: 1,
          endColumn: 12,
          endLine: 3,
          line: 3,
        },
      ]),
    },
    {
      code: `
declare const foo: number | undefined;
<any>foo;
      `,
      errors: error([
        {
          column: 1,
          endColumn: 10,
          endLine: 3,
          line: 3,
        },
      ]),
    },
    {
      code: `
declare const foo: number | undefined;
foo!;
      `,
      errors: error([
        {
          column: 1,
          endColumn: 6,
          endLine: 3,
          line: 3,
        },
      ]),
    },
  ],
});
