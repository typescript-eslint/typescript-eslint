import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

ruleTester.run('prefer-optional-chain-or-empty-object', rule, {
  invalid: [
    {
      code: '(foo || {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo?.bar;' },
          ],
        },
      ],
    },
    {
      code: noFormat`(foo || ({})).bar;`,
      errors: [
        {
          column: 1,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo?.bar;' },
          ],
        },
      ],
    },
    {
      code: noFormat`(await foo || {}).bar;`,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(await foo)?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: '(foo1?.foo2 || {}).foo3;',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo1?.foo2?.foo3;',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(foo1?.foo2 || ({})).foo3;`,
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo1?.foo2?.foo3;',
            },
          ],
        },
      ],
    },
    {
      code: '((() => foo())() || {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(() => foo())()?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: 'const foo = (bar || {}).baz;',
      errors: [
        {
          column: 13,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'const foo = bar?.baz;',
            },
          ],
        },
      ],
    },
    {
      code: '(foo.bar || {})[baz];',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo.bar?.[baz];' },
          ],
        },
      ],
    },
    {
      code: '((foo1 || {}).foo2 || {}).foo3;',
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(foo1 || {}).foo2?.foo3;',
            },
          ],
        },
        {
          column: 2,
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(foo1?.foo2 || {}).foo3;',
            },
          ],
        },
      ],
    },
    {
      code: '(foo || undefined || {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(foo || undefined)?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: '(foo() || bar || {}).baz;',
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(foo() || bar)?.baz;',
            },
          ],
        },
      ],
    },
    {
      code: '((foo1 ? foo2 : foo3) || {}).foo4;',
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(foo1 ? foo2 : foo3)?.foo4;',
            },
          ],
        },
      ],
    },
    {
      code: `
if (foo) {
  (foo || {}).bar;
}
      `,
      errors: [
        {
          column: 3,
          endColumn: 18,
          endLine: 3,
          line: 3,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
if (foo) {
  foo?.bar;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: `
if ((foo || {}).bar) {
  foo.bar;
}
      `,
      errors: [
        {
          column: 5,
          endColumn: 20,
          endLine: 2,
          line: 2,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
if (foo?.bar) {
  foo.bar;
}
      `,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(undefined && foo || {}).bar;`,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(undefined && foo)?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: '(foo ?? {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 16,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo?.bar;' },
          ],
        },
      ],
    },
    {
      code: noFormat`(foo ?? ({})).bar;`,
      errors: [
        {
          column: 1,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo?.bar;' },
          ],
        },
      ],
    },
    {
      code: noFormat`(await foo ?? {}).bar;`,
      errors: [
        {
          column: 1,
          endColumn: 22,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(await foo)?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: '(foo1?.foo2 ?? {}).foo3;',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo1?.foo2?.foo3;',
            },
          ],
        },
      ],
    },
    {
      code: '((() => foo())() ?? {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(() => foo())()?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: 'const foo = (bar ?? {}).baz;',
      errors: [
        {
          column: 13,
          endColumn: 28,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'const foo = bar?.baz;',
            },
          ],
        },
      ],
    },
    {
      code: '(foo.bar ?? {})[baz];',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo.bar?.[baz];' },
          ],
        },
      ],
    },
    {
      code: '((foo1 ?? {}).foo2 ?? {}).foo3;',
      errors: [
        {
          column: 1,
          endColumn: 31,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(foo1 ?? {}).foo2?.foo3;',
            },
          ],
        },
        {
          column: 2,
          endColumn: 19,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(foo1?.foo2 ?? {}).foo3;',
            },
          ],
        },
      ],
    },
    {
      code: '(foo ?? undefined ?? {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(foo ?? undefined)?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: '(foo() ?? bar ?? {}).baz;',
      errors: [
        {
          column: 1,
          endColumn: 25,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(foo() ?? bar)?.baz;',
            },
          ],
        },
      ],
    },
    {
      code: '((foo1 ? foo2 : foo3) ?? {}).foo4;',
      errors: [
        {
          column: 1,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(foo1 ? foo2 : foo3)?.foo4;',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`if (foo) { (foo ?? {}).bar; }`,
      errors: [
        {
          column: 12,
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'if (foo) { foo?.bar; }',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`if ((foo ?? {}).bar) { foo.bar; }`,
      errors: [
        {
          column: 5,
          endColumn: 20,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'if (foo?.bar) { foo.bar; }',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(undefined && foo ?? {}).bar;`,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(undefined && foo)?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: '(a > b || {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: '(a > b)?.bar;' },
          ],
        },
      ],
    },
    {
      code: noFormat`(((typeof x) as string) || {}).bar;`,
      errors: [
        {
          column: 1,
          endColumn: 35,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '((typeof x) as string)?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: '(void foo() || {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(void foo())?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: '((a ? b : c) || {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 24,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(a ? b : c)?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`((a instanceof Error) || {}).bar;`,
      errors: [
        {
          column: 1,
          endColumn: 33,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '(a instanceof Error)?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`((a << b) || {}).bar;`,
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: '(a << b)?.bar;' },
          ],
        },
      ],
    },
    {
      code: noFormat`((foo ** 2) || {}).bar;`,
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: '(foo ** 2)?.bar;' },
          ],
        },
      ],
    },
    {
      code: '(foo ** 2 || {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: '(foo ** 2)?.bar;' },
          ],
        },
      ],
    },
    {
      code: '(foo++ || {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 18,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: '(foo++)?.bar;' },
          ],
        },
      ],
    },
    {
      code: '(+foo || {}).bar;',
      errors: [
        {
          column: 1,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: '(+foo)?.bar;' },
          ],
        },
      ],
    },
    {
      code: '(this || {}).foo;',
      errors: [
        {
          column: 1,
          endColumn: 17,
          endLine: 1,
          line: 1,
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'this?.foo;' },
          ],
        },
      ],
    },
  ],
  valid: [
    'foo || {};',
    'foo || ({} as any);',
    '(foo || {})?.bar;',
    '(foo || { bar: 1 }).bar;',
    '(undefined && (foo || {})).bar;',
    'foo ||= bar || {};',
    'foo ||= bar?.baz || {};',
    '(foo1 ? foo2 : foo3 || {}).foo4;',
    '(foo = 2 || {}).bar;',
    'func(foo || {}).bar;',
    'foo ?? {};',
    '(foo ?? {})?.bar;',
    'foo ||= bar ?? {};',
    // https://github.com/typescript-eslint/typescript-eslint/issues/8380
    `
const a = null;
const b = 0;
a === undefined || b === null || b === undefined;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/8380
    `
const a = 0;
const b = 0;
a === undefined || b === undefined || b === null;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/8380
    `
const a = 0;
const b = 0;
b === null || a === undefined || b === undefined;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/8380
    `
const b = 0;
b === null || b === undefined;
    `,
    // https://github.com/typescript-eslint/typescript-eslint/issues/8380
    `
const a = 0;
const b = 0;
b != null && a !== null && a !== undefined;
    `,
  ],
});
