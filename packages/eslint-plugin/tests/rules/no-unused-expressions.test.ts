import { TSESLint } from '@typescript-eslint/experimental-utils';
import rule from '../../src/rules/no-unused-expressions';
import { noFormat, RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
  },
  parser: '@typescript-eslint/parser',
});

type TestCaseError = Omit<TSESLint.TestCaseError<string>, 'messageId'>;

// the base rule doesn't have messageIds
function error(
  messages: TestCaseError[],
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
          line: 2,
          column: 8,
        },
      ]),
    },
    {
      code: `
f(0), {};
      `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
a, b();
      `,
      errors: error([
        {
          line: 2,
          column: 1,
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
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
a?.b;
      `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
(a?.b).c;
      `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
a?.['b'];
      `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
(a?.['b']).c;
      `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
a?.b()?.c;
      `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
(a?.b()).c;
      `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
one[2]?.[3][4];
      `,
      errors: error([
        {
          line: 2,
          column: 1,
        },
      ]),
    },
    {
      code: `
one.two?.three.four;
      `,
      errors: error([
        {
          line: 2,
          column: 1,
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
          line: 4,
          endLine: 4,
          column: 3,
          endColumn: 16,
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
          line: 6,
          endLine: 6,
          column: 3,
          endColumn: 16,
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
          line: 5,
          endLine: 5,
          column: 3,
          endColumn: 16,
        },
      ]),
    },
    {
      code: 'foo && foo?.bar;',
      options: [{ allowShortCircuit: true }],
      errors: error([
        {
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 17,
        },
      ]),
    },
    {
      code: 'foo ? foo?.bar : bar.baz;',
      options: [{ allowTernary: true }],
      errors: error([
        {
          line: 1,
          endLine: 1,
          column: 1,
          endColumn: 26,
        },
      ]),
    },
  ],
});
