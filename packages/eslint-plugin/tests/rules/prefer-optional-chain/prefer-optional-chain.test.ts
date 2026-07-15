import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

describe('|| {}', () => {
  ruleTester.run('prefer-optional-chain', rule, {
    invalid: [
      {
        code: '(foo || {}).bar;',
        errors: [
          {
            column: 1,
            endColumn: 16,
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
            column: 13,
            endColumn: 28,
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
            column: 15,
            endColumn: 30,
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
});

describe('chain ending with comparison', () => {
  ruleTester.run('prefer-optional-chain', rule, {
    invalid: [
      {
        code: 'foo && foo.bar == 0;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar == 0;` },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar == 1;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar == 1;` },
            ],
          },
        ],
      },
      {
        code: "foo && foo.bar == '123';",
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar == '123';`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar == {};',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar == {};` },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar == false;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar == false;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar == true;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar == true;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar === 0;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar === 0;` },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar === 1;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar === 1;` },
            ],
          },
        ],
      },
      {
        code: "foo && foo.bar === '123';",
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar === '123';`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar === {};',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar === {};` },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar === false;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar === false;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar === true;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar === true;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar === null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar === null;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar !== undefined;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar !== undefined;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo && foo.bar != undefined;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != undefined;`,
      },
      {
        code: 'foo && foo.bar != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != null;`,
      },
      {
        code: 'foo != null && foo.bar == 0;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar == 0;` },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar == 1;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar == 1;` },
            ],
          },
        ],
      },
      {
        code: "foo != null && foo.bar == '123';",
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar == '123';`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar == {};',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar == {};` },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar == false;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar == false;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar == true;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar == true;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar === 0;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar === 0;` },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar === 1;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar === 1;` },
            ],
          },
        ],
      },
      {
        code: "foo != null && foo.bar === '123';",
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar === '123';`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar === {};',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar === {};` },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar === false;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar === false;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar === true;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar === true;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar === null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar === null;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar !== undefined;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar !== undefined;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar != undefined;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != undefined;`,
      },
      {
        code: 'foo != null && foo.bar != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != null;`,
      },
      {
        code: `
          declare const foo: { bar: number };
          foo && foo.bar != null;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar != null;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          foo != null && foo.bar != null;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar != null;
        `,
      },
      {
        code: '!foo || foo.bar != 0;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar != 0;` },
            ],
          },
        ],
      },
      {
        code: '!foo || foo.bar != 1;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar != 1;` },
            ],
          },
        ],
      },
      {
        code: "!foo || foo.bar != '123';",
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar != '123';`,
              },
            ],
          },
        ],
      },
      {
        code: '!foo || foo.bar != {};',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar != {};` },
            ],
          },
        ],
      },
      {
        code: '!foo || foo.bar != false;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar != false;`,
              },
            ],
          },
        ],
      },
      {
        code: '!foo || foo.bar != true;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar != true;`,
              },
            ],
          },
        ],
      },
      {
        code: '!foo || foo.bar === undefined;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar === undefined;`,
              },
            ],
          },
        ],
      },
      {
        code: '!foo || foo.bar == undefined;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == undefined;`,
      },
      {
        code: '!foo || foo.bar == null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == null;`,
      },
      {
        code: '!foo || foo.bar !== 0;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar !== 0;` },
            ],
          },
        ],
      },
      {
        code: '!foo || foo.bar !== 1;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar !== 1;` },
            ],
          },
        ],
      },
      {
        code: "!foo || foo.bar !== '123';",
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar !== '123';`,
              },
            ],
          },
        ],
      },
      {
        code: '!foo || foo.bar !== {};',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar !== {};` },
            ],
          },
        ],
      },
      {
        code: '!foo || foo.bar !== false;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar !== false;`,
              },
            ],
          },
        ],
      },
      {
        code: '!foo || foo.bar !== true;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar !== true;`,
              },
            ],
          },
        ],
      },
      {
        code: '!foo || foo.bar !== null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar !== null;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar != 0;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar != 0;` },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar != 1;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar != 1;` },
            ],
          },
        ],
      },
      {
        code: "foo == null || foo.bar != '123';",
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar != '123';`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar != {};',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar != {};` },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar != false;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar != false;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar != true;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar != true;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar === undefined;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar === undefined;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar == undefined;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == undefined;`,
      },
      {
        code: 'foo == null || foo.bar == null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == null;`,
      },
      {
        code: 'foo == null || foo.bar !== 0;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar !== 0;` },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar !== 1;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar !== 1;` },
            ],
          },
        ],
      },
      {
        code: "foo == null || foo.bar !== '123';",
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar !== '123';`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar !== {};',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: `foo?.bar !== {};` },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar !== false;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar !== false;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar !== true;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar !== true;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo == null || foo.bar !== null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `foo?.bar !== null;`,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar == null;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar == null;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar == undefined;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar == undefined;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar === undefined;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar === undefined;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== 0;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== 0;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== 1;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== 1;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== '123';
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== '123';
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== {};
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== {};
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== false;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== false;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== true;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== true;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== null;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== null;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != 0;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar != 0;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != 1;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar != 1;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != '123';
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar != '123';
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != {};
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar != {};
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != false;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar != false;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != true;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar != true;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar == null;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar == null;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar == undefined;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar == undefined;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar === undefined;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar === undefined;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== 0;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== 0;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== 1;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== 1;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== '123';
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== '123';
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== {};
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== {};
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== false;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== false;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== true;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== true;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== null;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number };
          foo?.bar !== null;
        `,
              },
            ],
          },
        ],
      },
      // yoda case
      {
        code: "foo != null && null != foo.bar && '123' == foo.bar.baz;",
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `'123' == foo?.bar?.baz;`,
              },
            ],
          },
        ],
      },
      {
        code: "foo != null && null != foo.bar && '123' === foo.bar.baz;",
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `'123' === foo?.bar?.baz;`,
              },
            ],
          },
        ],
      },
      {
        code: 'foo != null && null != foo.bar && undefined !== foo.bar.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `undefined !== foo?.bar?.baz;`,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a != null && a.b === foo.three;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a?.b === foo.three;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a != null && a.b() === foo.three;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a?.b() === foo.three;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a != null && a.b == foo.three;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a?.b == foo.three;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a != null && a.b() == foo.three;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a?.b() == foo.three;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a != null && a.b !== foo.three;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a?.b !== foo.three;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a != null && a.b() != foo.three;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a?.b() != foo.three;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a === null || a.b !== foo.three;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a?.b !== foo.three;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a === null || a.b() != foo.three;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a?.b() != foo.three;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a === null || a.b == foo.three;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a?.b == foo.three;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a === null || a.b() === foo.three;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a?.b() === foo.three;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a != null && foo.three === a.b;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          foo.three === a?.b;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a != null && foo.three === a.b();
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          foo.three === a?.b();
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a != null && foo.three == a.b;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          foo.three == a?.b;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a != null && foo.three == a.b();
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          foo.three == a?.b();
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a != null && foo.three !== a.b;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          foo.three !== a?.b;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a != null && foo.three != a.b();
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          foo.three != a?.b();
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a == null || foo.three !== a.b;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          foo.three !== a?.b;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          type Branch = { id: string } & { name: string };
          declare const a: Branch | null;
          declare const b: Branch;
          !a || b.id !== a.id;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          type Branch = { id: string } & { name: string };
          declare const a: Branch | null;
          declare const b: Branch;
          b.id !== a?.id;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a == null || foo.three != a.b();
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          foo.three != a?.b();
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a == null || foo.three == a.b;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          foo.three == a?.b;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a == null || foo.three === a.b();
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          foo.three === a?.b();
        `,
              },
            ],
          },
        ],
      },
      {
        code: noFormat`foo && (foo.bar == 0)`,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              { messageId: 'optionalChainSuggest', output: 'foo?.bar == 0' },
            ],
          },
        ],
      },
    ],
    valid: [
      'foo && foo.bar == undeclaredVar;',
      'foo && foo.bar == null;',
      'foo && foo.bar == undefined;',
      'foo && foo.bar === undeclaredVar;',
      'foo && foo.bar === undefined;',
      'foo && foo.bar === too.bar;',
      'foo && foo.bar === foo.baz;',
      'foo && foo.bar !== 0;',
      'foo && foo.bar !== 1;',
      "foo && foo.bar !== '123';",
      'foo && foo.bar !== {};',
      'foo && foo.bar !== false;',
      'foo && foo.bar !== true;',
      'foo && foo.bar !== null;',
      'foo && foo.bar !== undeclaredVar;',
      'foo && foo.bar !== too.bar;',
      'foo && foo.bar !== foo.baz;',
      'foo && foo.bar != 0;',
      'foo && foo.bar != 1;',
      "foo && foo.bar != '123';",
      'foo && foo.bar != {};',
      'foo && foo.bar != false;',
      'foo && foo.bar != true;',
      'foo && foo.bar != undeclaredVar;',
      'foo && foo.bar != too.bar;',
      'foo && foo.bar != foo.baz;',
      'foo != null && foo.bar == undeclaredVar;',
      'foo != null && foo.bar == null;',
      'foo != null && foo.bar == undefined;',
      'foo != null && foo.bar === undeclaredVar;',
      'foo != null && foo.bar === undefined;',
      'foo != null && foo.bar !== 0;',
      'foo != null && foo.bar !== 1;',
      "foo != null && foo.bar !== '123';",
      'foo != null && foo.bar !== {};',
      'foo != null && foo.bar !== false;',
      'foo != null && foo.bar !== true;',
      'foo != null && foo.bar !== null;',
      'foo != null && foo.bar !== undeclaredVar;',
      'foo != null && foo.bar != 0;',
      'foo != null && foo.bar != 1;',
      "foo != null && foo.bar != '123';",
      'foo != null && foo.bar != {};',
      'foo != null && foo.bar != false;',
      'foo != null && foo.bar != true;',
      'foo != null && foo.bar != undeclaredVar;',
      `
        declare const foo: { bar: number; baz: number } | null;
        foo != null && foo.bar == foo.baz;
      `,
      `
        declare const foo: { bar: number; baz: () => number } | null;
        foo != null && foo.bar == foo.baz();
      `,
      `
        declare const foo: { bar: number; baz: number } | null;
        foo != null && foo.bar === foo.baz;
      `,
      `
        declare const foo: { bar: number; baz: () => number } | null;
        foo != null && foo.bar === foo.baz();
      `,
      `
        declare const foo: { bar: number; baz: undefined } | null;
        foo != null && foo.bar != foo.baz;
      `,
      `
        declare const foo: { bar: number; baz: () => undefined } | null;
        foo != null && foo.bar != foo.baz();
      `,
      `
        declare const foo: { bar: number; baz: undefined } | null;
        foo != null && foo.bar !== foo.baz;
      `,
      `
        declare const foo: { bar: number; baz: () => undefined } | null;
        foo != null && foo.bar !== foo.baz();
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar == undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar == null;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar == undefined;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar === undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar === undefined;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar !== 0;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar !== 1;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar !== '123';
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar !== {};
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar !== false;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar !== true;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar !== null;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar !== undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar != 0;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar != 1;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar != '123';
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar != {};
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar != false;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar != true;
      `,
      `
        declare const foo: { bar: number };
        foo && foo.bar != undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar == undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar == null;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar == undefined;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar === undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar === undefined;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar !== 0;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar !== 1;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar !== '123';
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar !== {};
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar !== false;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar !== true;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar !== null;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar !== undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar != 0;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar != 1;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar != '123';
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar != {};
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar != false;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar != true;
      `,
      `
        declare const foo: { bar: number };
        foo != null && foo.bar != undeclaredVar;
      `,
      `
        declare const foo: { bar: number } | 1;
        foo && foo.bar == undeclaredVar;
      `,
      `
        declare const foo: { bar: number } | 0;
        foo != null && foo.bar == undeclaredVar;
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar == undeclaredVar;
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar == null;
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar == undefined;
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar === undeclaredVar;
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar === undefined;
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar !== 0;
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar !== 1;
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar !== '123';
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar !== {};
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar !== false;
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar !== true;
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar !== null;
      `,
      `
        declare const foo: { bar: number } | null;
        foo && foo.bar !== undeclaredVar;
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar == undeclaredVar;
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar == null;
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar == undefined;
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar === undeclaredVar;
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar === undefined;
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar !== 0;
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar !== 1;
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar !== '123';
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar !== {};
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar !== false;
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar !== true;
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar !== null;
      `,
      `
        declare const foo: { bar: number } | null;
        foo != null && foo.bar !== undeclaredVar;
      `,
      `
        declare const foo: { bar: number } | null;
        foo !== null && foo !== undefined && foo.bar == null;
      `,
      `
        declare const foo: { bar: number } | null;
        foo !== null && foo !== undefined && foo.bar === undefined;
      `,
      `
        declare const foo: { bar: number } | null;
        foo !== null && foo !== undefined && foo.bar !== 1;
      `,
      `
        declare const foo: { bar: number } | null;
        foo !== null && foo !== undefined && foo.bar != 1;
      `,

      `
        declare const foo: { bar: number } | undefined;
        foo !== null && foo !== undefined && foo.bar == null;
      `,
      `
        declare const foo: { bar: number } | undefined;
        foo !== null && foo !== undefined && foo.bar === undefined;
      `,
      `
        declare const foo: { bar: number } | undefined;
        foo !== null && foo !== undefined && foo.bar !== 1;
      `,
      `
        declare const foo: { bar: number } | undefined;
        foo !== null && foo !== undefined && foo.bar != 1;
      `,
      `
        declare const foo: { bar: number } | null;
        foo !== undefined && foo !== undefined && foo.bar == null;
      `,
      `
        declare const foo: { bar: number } | null;
        foo !== undefined && foo !== undefined && foo.bar === undefined;
      `,
      `
        declare const foo: { bar: number } | null;
        foo !== undefined && foo !== undefined && foo.bar !== 1;
      `,
      `
        declare const foo: { bar: number } | null;
        foo !== undefined && foo !== undefined && foo.bar != 1;
      `,

      `
        declare const foo: { bar: number } | undefined;
        foo !== undefined && foo !== undefined && foo.bar == null;
      `,
      `
        declare const foo: { bar: number } | undefined;
        foo !== undefined && foo !== undefined && foo.bar === undefined;
      `,
      `
        declare const foo: { bar: number } | undefined;
        foo !== undefined && foo !== undefined && foo.bar !== 1;
      `,
      `
        declare const foo: { bar: number } | undefined;
        foo !== undefined && foo !== undefined && foo.bar != 1;
      `,
      `
        declare const foo: { bar: number };
        !foo || foo.bar == undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        !foo || foo.bar === undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        !foo || foo.bar !== undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        !foo || foo.bar != null;
      `,
      `
        declare const foo: { bar: number };
        !foo || foo.bar != undeclaredVar;
      `,
      '!foo && foo.bar == 0;',
      '!foo && foo.bar == 1;',
      "!foo && foo.bar == '123';",
      '!foo && foo.bar == {};',
      '!foo && foo.bar == false;',
      '!foo && foo.bar == true;',
      '!foo && foo.bar === 0;',
      '!foo && foo.bar === 1;',
      "!foo && foo.bar === '123';",
      '!foo && foo.bar === {};',
      '!foo && foo.bar === false;',
      '!foo && foo.bar === true;',
      '!foo && foo.bar === null;',
      '!foo && foo.bar !== undefined;',
      '!foo && foo.bar != undefined;',
      '!foo && foo.bar != null;',
      'foo == null && foo.bar == 0;',
      'foo == null && foo.bar == 1;',
      "foo == null && foo.bar == '123';",
      'foo == null && foo.bar == {};',
      'foo == null && foo.bar == false;',
      'foo == null && foo.bar == true;',
      'foo == null && foo.bar === 0;',
      'foo == null && foo.bar === 1;',
      "foo == null && foo.bar === '123';",
      'foo == null && foo.bar === {};',
      'foo == null && foo.bar === false;',
      'foo == null && foo.bar === true;',
      'foo == null && foo.bar === null;',
      'foo == null && foo.bar !== undefined;',
      'foo == null && foo.bar != null;',
      'foo == null && foo.bar != undefined;',
      `
        declare const foo: false | { a: string };
        foo && foo.a == undeclaredVar;
      `,
      `
        declare const foo: '' | { a: string };
        foo && foo.a == undeclaredVar;
      `,
      `
        declare const foo: 0 | { a: string };
        foo && foo.a == undeclaredVar;
      `,
      `
        declare const foo: 0n | { a: string };
        foo && foo.a;
      `,
      '!foo || foo.bar != undeclaredVar;',
      '!foo || foo.bar != null;',
      '!foo || foo.bar != undefined;',
      '!foo || foo.bar === 0;',
      '!foo || foo.bar === 1;',
      "!foo || foo.bar === '123';",
      '!foo || foo.bar === {};',
      '!foo || foo.bar === false;',
      '!foo || foo.bar === true;',
      '!foo || foo.bar === null;',
      '!foo || foo.bar === undeclaredVar;',
      '!foo || foo.bar == 0;',
      '!foo || foo.bar == 1;',
      "!foo || foo.bar == '123';",
      '!foo || foo.bar == {};',
      '!foo || foo.bar == false;',
      '!foo || foo.bar == true;',
      '!foo || foo.bar == undeclaredVar;',
      '!foo || foo.bar !== undeclaredVar;',
      '!foo || foo.bar !== undefined;',
      `
        declare const foo: { bar: number };
        foo == null || foo.bar == undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        foo == null || foo.bar === undeclaredVar;
      `,
      `
        declare const foo: { bar: number };
        foo == null || foo.bar !== undeclaredVar;
      `,
      'foo == null || foo.bar != undeclaredVar;',
      'foo == null || foo.bar != null;',
      'foo == null || foo.bar != undefined;',
      'foo == null || foo.bar === 0;',
      'foo == null || foo.bar === 1;',
      "foo == null || foo.bar === '123';",
      'foo == null || foo.bar === {};',
      'foo == null || foo.bar === false;',
      'foo == null || foo.bar === true;',
      'foo == null || foo.bar === null;',
      'foo == null || foo.bar === undeclaredVar;',
      'foo == null || foo.bar == 0;',
      'foo == null || foo.bar == 1;',
      "foo == null || foo.bar == '123';",
      'foo == null || foo.bar == {};',
      'foo == null || foo.bar == false;',
      'foo == null || foo.bar == true;',
      'foo == null || foo.bar == undeclaredVar;',
      'foo == null || foo.bar !== undeclaredVar;',
      'foo == null || foo.bar !== undefined;',
      `
        declare const foo: { bar: number; baz: number } | null;
        foo == null || foo.bar != foo.baz;
      `,
      `
        declare const foo: { bar: number; baz: () => number } | null;
        foo == null || foo.bar != foo.baz();
      `,
      `
        declare const foo: { bar: number; baz: undefined } | null;
        foo == null || foo.bar === foo.baz;
      `,
      `
        declare const foo: { bar: number; baz: () => undefined } | null;
        foo == null || foo.bar === foo.baz();
      `,
      `
        declare const foo: { bar: number; baz: undefined } | null;
        foo == null || foo.bar == foo.baz;
      `,
      `
        declare const foo: { bar: number; baz: () => undefined } | null;
        foo == null || foo.bar == foo.baz();
      `,
      `
        declare const foo: { bar: number; baz: number } | null;
        foo == null || foo.bar !== foo.baz;
      `,
      `
        declare const foo: { bar: number; baz: () => number } | null;
        foo == null || foo.bar !== foo.baz();
      `,
      'foo || foo.bar != 0;',
      'foo || foo.bar != 1;',
      "foo || foo.bar != '123';",
      'foo || foo.bar != {};',
      'foo || foo.bar != false;',
      'foo || foo.bar != true;',
      'foo || foo.bar === undefined;',
      'foo || foo.bar == undefined;',
      'foo || foo.bar == null;',
      'foo || foo.bar !== 0;',
      'foo || foo.bar !== 1;',
      "foo || foo.bar !== '123';",
      'foo || foo.bar !== {};',
      'foo || foo.bar !== false;',
      'foo || foo.bar !== true;',
      'foo || foo.bar !== null;',
      'foo != null || foo.bar != 0;',
      'foo != null || foo.bar != 1;',
      "foo != null || foo.bar != '123';",
      'foo != null || foo.bar != {};',
      'foo != null || foo.bar != false;',
      'foo != null || foo.bar != true;',
      'foo != null || foo.bar === undefined;',
      'foo != null || foo.bar == undefined;',
      'foo != null || foo.bar == null;',
      'foo != null || foo.bar !== 0;',
      'foo != null || foo.bar !== 1;',
      "foo != null || foo.bar !== '123';",
      'foo != null || foo.bar !== {};',
      'foo != null || foo.bar !== false;',
      'foo != null || foo.bar !== true;',
      'foo != null || foo.bar !== null;',
      `
        declare const record: Record<string, { kind: string }>;
        record['key'] && record['key'].kind !== '1';
      `,
      `
        declare const array: { b?: string }[];
        !array[1] || array[1].b === 'foo';
      `,
    ],
  });
});

describe('hand-crafted cases', () => {
  ruleTester.run('prefer-optional-chain', rule, {
    invalid: [
      // two  errors
      {
        code: noFormat`foo && foo.bar && foo.bar.baz || baz && baz.bar && baz.bar.foo`,
        errors: [
          { messageId: 'preferOptionalChain', suggestions: null },
          { messageId: 'preferOptionalChain', suggestions: null },
        ],
        output: 'foo?.bar?.baz || baz?.bar?.foo',
      },
      // case with inconsistent checks should "break" the chain
      {
        code: 'foo && foo.bar != null && foo.bar.baz !== undefined && foo.bar.baz.buzz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: 'foo?.bar?.baz !== undefined && foo.bar.baz.buzz;',
              },
            ],
          },
        ],
      },
      {
        code: `
          foo.bar &&
            foo.bar.baz != null &&
            foo.bar.baz.qux !== undefined &&
            foo.bar.baz.qux.buzz;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          foo.bar?.baz?.qux !== undefined &&
            foo.bar.baz.qux.buzz;
        `,
              },
            ],
          },
        ],
      },
      // ensure essential whitespace isn't removed
      {
        code: 'foo && foo.bar(baz => <This Requires Spaces />);',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        filename: 'react.tsx',
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
        output: 'foo?.bar(baz => <This Requires Spaces />);',
      },
      {
        code: 'foo && foo.bar(baz => typeof baz);',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.bar(baz => typeof baz);',
      },
      {
        code: "foo && foo['some long string'] && foo['some long string'].baz;",
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: "foo?.['some long string']?.baz;",
      },
      {
        code: 'foo && foo[`some long string`] && foo[`some long string`].baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.[`some long string`]?.baz;',
      },
      {
        code: 'foo && foo[`some ${long} string`] && foo[`some ${long} string`].baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.[`some ${long} string`]?.baz;',
      },
      // complex computed properties should be handled correctly
      {
        code: 'foo && foo[bar as string] && foo[bar as string].baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.[bar as string]?.baz;',
      },
      {
        code: 'foo && foo[1 + 2] && foo[1 + 2].baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.[1 + 2]?.baz;',
      },
      {
        code: 'foo && foo[typeof bar] && foo[typeof bar].baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.[typeof bar]?.baz;',
      },
      {
        code: 'foo && foo.bar(a) && foo.bar(a, b).baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.bar(a) && foo.bar(a, b).baz;',
      },
      {
        code: 'foo() && foo()(bar);',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo()?.(bar);',
      },
      // type parameters are considered
      {
        code: 'foo && foo<string>() && foo<string>().bar;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.<string>()?.bar;',
      },
      {
        code: 'foo && foo<string>() && foo<string, number>().bar;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.<string>() && foo<string, number>().bar;',
      },
      // should preserve comments in a call expression
      {
        code: noFormat`
          foo && foo.bar(/* comment */a,
            // comment2
            b, );
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          foo?.bar(/* comment */a,
            // comment2
            b, );
        `,
      },
      // ensure binary expressions that are the last expression do not get removed
      // these get autofixers because the trailing binary means the type doesn't matter
      {
        code: 'foo && foo.bar != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.bar != null;',
      },
      {
        code: 'foo && foo.bar != undefined;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.bar != undefined;',
      },
      {
        code: 'foo && foo.bar != null && baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.bar != null && baz;',
      },
      // case with this keyword at the start of expression
      {
        code: 'this.bar && this.bar.baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'this.bar?.baz;',
      },
      // other weird cases
      {
        code: 'foo && foo?.();',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.();',
      },
      {
        code: 'foo.bar && foo.bar?.();',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo.bar?.();',
      },
      {
        code: 'foo && foo.bar(baz => <This Requires Spaces />);',
        errors: [
          {
            column: 1,
            line: 1,
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
        filename: 'react.tsx',
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
        output: 'foo?.bar(baz => <This Requires Spaces />);',
      },
      // case with this keyword at the start of expression
      {
        code: '!this.bar || !this.bar.baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: '!this.bar?.baz;',
      },
      {
        code: '!a.b || !a.b();',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: '!a.b?.();',
      },
      {
        code: '!foo.bar || !foo.bar.baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: '!foo.bar?.baz;',
      },
      {
        code: '!foo[bar] || !foo[bar]?.[baz];',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: '!foo[bar]?.[baz];',
      },
      {
        code: '!foo || !foo?.bar.baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: '!foo?.bar.baz;',
      },
      // two  errors
      {
        code: '(!foo || !foo.bar || !foo.bar.baz) && (!baz || !baz.bar || !baz.bar.foo);',
        errors: [
          { messageId: 'preferOptionalChain', suggestions: null },
          { messageId: 'preferOptionalChain', suggestions: null },
        ],
        output: '(!foo?.bar?.baz) && (!baz?.bar?.foo);',
      },
      {
        code: `
          class Foo {
            constructor() {
              new.target && new.target.length;
            }
          }
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          class Foo {
            constructor() {
              new.target?.length;
            }
          }
        `,
              },
            ],
          },
        ],
        output: null,
      },
      {
        code: 'import.meta && import.meta?.baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'import.meta?.baz;',
      },
      {
        code: '!import.meta || !import.meta?.baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: '!import.meta?.baz;',
      },
      {
        code: 'import.meta && import.meta?.() && import.meta?.().baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'import.meta?.()?.baz;',
      },
      // non-null expressions
      {
        code: '!foo() || !foo().bar;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: '!foo()?.bar;',
      },
      {
        code: '!foo!.bar || !foo!.bar.baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: '!foo!.bar?.baz;',
      },
      {
        code: '!foo!.bar!.baz || !foo!.bar!.baz!.paz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: '!foo!.bar!.baz?.paz;',
      },
      {
        code: '!foo.bar!.baz || !foo.bar!.baz!.paz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: '!foo.bar!.baz?.paz;',
      },
      {
        code: 'foo != null && foo.bar != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.bar != null;',
      },
      {
        code: `
          declare const foo: { bar: string | null } | null;
          foo !== null && foo.bar != null;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: string | null } | null;
          foo?.bar != null;
        `,
      },
      // https://github.com/typescript-eslint/typescript-eslint/issues/6332
      {
        code: 'unrelated != null && foo != null && foo.bar != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'unrelated != null && foo?.bar != null;',
      },
      {
        code: 'unrelated1 != null && unrelated2 != null && foo != null && foo.bar != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'unrelated1 != null && unrelated2 != null && foo?.bar != null;',
      },
      // https://github.com/typescript-eslint/typescript-eslint/issues/1461
      {
        code: 'foo1 != null && foo1.bar != null && foo2 != null && foo2.bar != null;',
        errors: [
          { messageId: 'preferOptionalChain', suggestions: null },
          { messageId: 'preferOptionalChain', suggestions: null },
        ],
        output: 'foo1?.bar != null && foo2?.bar != null;',
      },
      {
        code: 'foo && foo.a && bar && bar.a;',
        errors: [
          { messageId: 'preferOptionalChain', suggestions: null },
          { messageId: 'preferOptionalChain', suggestions: null },
        ],
        output: 'foo?.a && bar?.a;',
      },
      // randomly placed optional chain tokens are ignored
      {
        code: 'foo.bar.baz != null && foo?.bar?.baz.bam != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo.bar.baz?.bam != null;',
      },
      {
        code: 'foo?.bar.baz != null && foo.bar?.baz.bam != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.bar.baz?.bam != null;',
      },
      {
        code: 'foo?.bar?.baz != null && foo.bar.baz.bam != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.bar?.baz?.bam != null;',
      },
      // randomly placed non-null assertions are retained as long as they're in an earlier operand
      {
        code: 'foo.bar.baz != null && foo!.bar!.baz.bam != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo.bar.baz?.bam != null;',
      },
      {
        code: 'foo!.bar.baz != null && foo.bar!.baz.bam != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo!.bar.baz?.bam != null;',
      },
      {
        code: 'foo!.bar!.baz != null && foo.bar.baz.bam != null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo!.bar!.baz?.bam != null;',
      },
      // mixed binary checks are followed and flagged
      {
        code: `
          a &&
            a.b != null &&
            a.b.c !== undefined &&
            a.b.c !== null &&
            a.b.c.d != null &&
            a.b.c.d.e !== null &&
            a.b.c.d.e !== undefined &&
            a.b.c.d.e.f != undefined &&
            typeof a.b.c.d.e.f.g !== 'undefined' &&
            a.b.c.d.e.f.g !== null &&
            a.b.c.d.e.f.g.h;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          a?.b?.c?.d?.e?.f?.g?.h;
        `,
      },
      {
        code: `
          !a ||
            a.b == null ||
            a.b.c === undefined ||
            a.b.c === null ||
            a.b.c.d == null ||
            a.b.c.d.e === null ||
            a.b.c.d.e === undefined ||
            a.b.c.d.e.f == undefined ||
            typeof a.b.c.d.e.f.g === 'undefined' ||
            a.b.c.d.e.f.g === null ||
            !a.b.c.d.e.f.g.h;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          !a?.b?.c?.d?.e?.f?.g?.h;
        `,
      },
      {
        code: `
          !a ||
            a.b == null ||
            a.b.c === null ||
            a.b.c === undefined ||
            a.b.c.d == null ||
            a.b.c.d.e === null ||
            a.b.c.d.e === undefined ||
            a.b.c.d.e.f == undefined ||
            typeof a.b.c.d.e.f.g === 'undefined' ||
            a.b.c.d.e.f.g === null ||
            !a.b.c.d.e.f.g.h;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          !a?.b?.c?.d?.e?.f?.g?.h;
        `,
      },
      // yoda checks are flagged
      {
        code: 'undefined !== foo && null !== foo && null != foo.bar && foo.bar.baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.bar?.baz;',
      },
      {
        code: `
          null != foo &&
            'undefined' !== typeof foo.bar &&
            null !== foo.bar &&
            foo.bar.baz;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          foo?.bar?.baz;
        `,
      },
      {
        code: `
          null != foo &&
            'undefined' !== typeof foo.bar &&
            null !== foo.bar &&
            null != foo.bar.baz;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          null != foo?.bar?.baz;
        `,
      },
      // We should retain the split strict equals check if it's the last operand
      {
        code: `
          null != foo &&
            'undefined' !== typeof foo.bar &&
            null !== foo.bar &&
            null !== foo.bar.baz &&
            'undefined' !== typeof foo.bar.baz;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          null !== foo?.bar?.baz &&
            'undefined' !== typeof foo.bar.baz;
        `,
              },
            ],
          },
        ],
        output: null,
      },
      {
        code: `
          foo != null &&
            typeof foo.bar !== 'undefined' &&
            foo.bar !== null &&
            foo.bar.baz !== null &&
            typeof foo.bar.baz !== 'undefined';
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          foo?.bar?.baz !== null &&
            typeof foo.bar.baz !== 'undefined';
        `,
              },
            ],
          },
        ],
        output: null,
      },
      {
        code: `
          null != foo &&
            'undefined' !== typeof foo.bar &&
            null !== foo.bar &&
            null !== foo.bar.baz &&
            undefined !== foo.bar.baz;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          null !== foo?.bar?.baz &&
            undefined !== foo.bar.baz;
        `,
              },
            ],
          },
        ],
        output: null,
      },
      {
        code: `
          foo != null &&
            typeof foo.bar !== 'undefined' &&
            foo.bar !== null &&
            foo.bar.baz !== null &&
            foo.bar.baz !== undefined;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          foo?.bar?.baz !== null &&
            foo.bar.baz !== undefined;
        `,
              },
            ],
          },
        ],
        output: null,
      },
      {
        code: `
          null != foo &&
            'undefined' !== typeof foo.bar &&
            null !== foo.bar &&
            undefined !== foo.bar.baz &&
            null !== foo.bar.baz;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          undefined !== foo?.bar?.baz &&
            null !== foo.bar.baz;
        `,
      },
      {
        code: `
          foo != null &&
            typeof foo.bar !== 'undefined' &&
            foo.bar !== null &&
            foo.bar.baz !== undefined &&
            foo.bar.baz !== null;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          foo?.bar?.baz !== undefined &&
            foo.bar.baz !== null;
        `,
      },
      // await
      {
        code: '(await foo).bar && (await foo).bar.baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: '(await foo).bar?.baz;',
      },
      // TODO - should we handle this case and expand the range, or should we leave this as is?
      {
        code: `
          !a ||
            a.b == null ||
            a.b.c === undefined ||
            a.b.c === null ||
            a.b.c.d == null ||
            a.b.c.d.e === null ||
            a.b.c.d.e === undefined ||
            a.b.c.d.e.f == undefined ||
            a.b.c.d.e.f.g == null ||
            a.b.c.d.e.f.g.h;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          a?.b?.c?.d?.e?.f?.g == null ||
            a.b.c.d.e.f.g.h;
        `,
      },

      {
        code: `
          declare const foo: { bar: number } | null | undefined;
          foo && foo.bar != null;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number } | null | undefined;
          foo?.bar != null;
        `,
      },
      {
        code: `
          declare const foo: { bar: number } | undefined;
          foo && typeof foo.bar !== 'undefined';
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number } | undefined;
          typeof foo?.bar !== 'undefined';
        `,
      },
      {
        code: `
          declare const foo: { bar: number } | undefined;
          foo && 'undefined' !== typeof foo.bar;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number } | undefined;
          'undefined' !== typeof foo?.bar;
        `,
      },

      // requireNullish
      {
        code: `
          declare const thing1: string | null;
          thing1 && thing1.toString();
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const thing1: string | null;
          thing1?.toString();
        `,
              },
            ],
          },
        ],
        options: [{ requireNullish: true }],
        output: null,
      },
      {
        code: `
          declare const thing1: string | null;
          thing1 && thing1.toString() && true;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const thing1: string | null;
          thing1?.toString() && true;
        `,
              },
            ],
          },
        ],
        options: [{ requireNullish: true }],
        output: null,
      },
      {
        code: `
          declare const foo: string | null;
          foo && foo.toString() && foo.toString();
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: string | null;
          foo?.toString() && foo.toString();
        `,
              },
            ],
          },
        ],
        options: [{ requireNullish: true }],
        output: null,
      },
      {
        code: `
          declare const foo: { bar: string | null | undefined } | null | undefined;
          foo && foo.bar && foo.bar.toString();
        `,
        errors: [{ messageId: 'preferOptionalChain' }],
        options: [{ requireNullish: true }],
        output: `
          declare const foo: { bar: string | null | undefined } | null | undefined;
          foo?.bar?.toString();
        `,
      },
      {
        code: `
          declare const foo: { bar: string | null | undefined } | null | undefined;
          foo && foo.bar && foo.bar.toString() && foo.bar.toString();
        `,
        errors: [{ messageId: 'preferOptionalChain' }],
        options: [{ requireNullish: true }],
        output: `
          declare const foo: { bar: string | null | undefined } | null | undefined;
          foo?.bar?.toString() && foo.bar.toString();
        `,
      },
      {
        code: `
          declare const foo: string | null;
          (foo || {}).toString();
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: string | null;
          foo?.toString();
        `,
              },
            ],
          },
        ],
        options: [{ requireNullish: true }],
        output: null,
      },
      {
        code: `
          declare const foo: string;
          (foo || undefined || {}).toString();
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: string;
          (foo || undefined)?.toString();
        `,
              },
            ],
          },
        ],
        options: [{ requireNullish: true }],
        output: null,
      },
      {
        code: `
          declare const foo: string | null;
          (foo || undefined || {}).toString();
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: string | null;
          (foo || undefined)?.toString();
        `,
              },
            ],
          },
        ],
        options: [{ requireNullish: true }],
        output: null,
      },

      // allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing
      {
        code: `
          declare const foo: { bar: number } | null | undefined;
          foo != undefined && foo.bar;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        options: [
          {
            allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: true,
          },
        ],
        output: `
          declare const foo: { bar: number } | null | undefined;
          foo?.bar;
        `,
      },
      {
        code: `
          declare const foo: { bar: number } | null | undefined;
          foo != undefined && foo.bar;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: number } | null | undefined;
          foo?.bar;
        `,
              },
            ],
          },
        ],
        options: [
          {
            allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: false,
          },
        ],
        output: null,
      },
      {
        code: `
          declare const foo: { bar: boolean } | null | undefined;
          declare function acceptsBoolean(arg: boolean): void;
          acceptsBoolean(foo != null && foo.bar);
        `,
        errors: [{ messageId: 'preferOptionalChain' }],
        options: [
          {
            allowPotentiallyUnsafeFixesThatModifyTheReturnTypeIKnowWhatImDoing: true,
          },
        ],
        output: `
          declare const foo: { bar: boolean } | null | undefined;
          declare function acceptsBoolean(arg: boolean): void;
          acceptsBoolean(foo?.bar);
        `,
      },
      {
        code: `
          function foo(globalThis?: { Array: Function }) {
            typeof globalThis !== 'undefined' && globalThis.Array();
          }
        `,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: `
          function foo(globalThis?: { Array: Function }) {
            globalThis?.Array();
          }
        `,
      },
      {
        code: `
          typeof globalThis !== 'undefined' && globalThis.Array && globalThis.Array();
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          typeof globalThis !== 'undefined' && globalThis.Array?.();
        `,
              },
            ],
          },
        ],
        output: null,
      },
      // parenthesis
      {
        code: noFormat`a && (a.b && a.b.c)`,
        errors: [
          {
            column: 1,
            endColumn: 20,
            messageId: 'preferOptionalChain',
          },
        ],
        output: 'a?.b?.c',
      },
      {
        code: noFormat`(a && a.b) && a.b.c`,
        errors: [
          {
            column: 1,
            endColumn: 20,
            messageId: 'preferOptionalChain',
          },
        ],
        output: 'a?.b?.c',
      },
      {
        code: noFormat`((a && a.b)) && a.b.c`,
        errors: [
          {
            column: 1,
            endColumn: 22,
            messageId: 'preferOptionalChain',
          },
        ],
        output: 'a?.b?.c',
      },
      {
        code: noFormat`foo(a && (a.b && a.b.c))`,
        errors: [
          {
            column: 5,
            endColumn: 24,
            messageId: 'preferOptionalChain',
          },
        ],
        output: 'foo(a?.b?.c)',
      },
      {
        code: noFormat`foo(a && a.b && a.b.c)`,
        errors: [
          {
            column: 5,
            endColumn: 22,
            messageId: 'preferOptionalChain',
          },
        ],
        output: 'foo(a?.b?.c)',
      },
      {
        code: noFormat`!foo || !foo.bar || ((((!foo.bar.baz || !foo.bar.baz()))));`,
        errors: [
          {
            column: 1,
            endColumn: 59,
            messageId: 'preferOptionalChain',
          },
        ],
        output: '!foo?.bar?.baz?.();',
      },
      {
        code: noFormat`a !== undefined && ((a !== null && a.prop));`,
        errors: [
          {
            column: 1,
            endColumn: 44,
            messageId: 'preferOptionalChain',
          },
        ],
        output: 'a?.prop;',
      },
      {
        code: `
declare const foo: {
  bar: undefined | (() => void);
};

foo.bar && foo.bar();
        `,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: `
declare const foo: {
  bar: undefined | (() => void);
};

foo.bar?.();
        `,
      },
      {
        code: `
declare const foo: { bar: string };

const baz = foo && foo.bar;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
declare const foo: { bar: string };

const baz = foo?.bar;
        `,
              },
            ],
          },
        ],
        options: [{ checkString: false }],
      },
      {
        code: noFormat`foo && (foo.bar)`,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: 'foo?.bar',
      },
      {
        code: noFormat`foo && (foo.bar && baz)`,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: 'foo?.bar && baz',
      },
      {
        code: noFormat`foo && (((foo.bar && baz)))`,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: 'foo?.bar && baz',
      },
      {
        code: noFormat`foo && (foo.bar && (foo.bar as any).baz)`,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: 'foo?.bar && (foo.bar as any).baz',
      },
      {
        code: noFormat`foo && /* inline comment ((( */ (foo.bar && (foo.bar as any).baz)`,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: 'foo?.bar && (foo.bar as any).baz',
      },
      {
        code: noFormat`foo && (foo.bar && (foo.bar as any).baz) /* inline comment ))) */`,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: 'foo?.bar && (foo.bar as any).baz /* inline comment ))) */',
      },
      {
        code: noFormat`foo && (foo.bar/* inline comment ))) */ && (foo.bar as any).baz)`,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: 'foo?.bar/* inline comment ))) */ && (foo.bar as any).baz',
      },
      {
        code: noFormat`foo && (foo.bar && bar) && (baz)`,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: 'foo?.bar && bar && (baz)',
      },
      {
        code: noFormat`foo && (foo.bar && bar) && (bar.baz)`,
        errors: [
          {
            column: 1,
            endColumn: 16,
            messageId: 'preferOptionalChain',
          },
          {
            column: 20,
            endColumn: 37,
            messageId: 'preferOptionalChain',
          },
        ],
        output: ['foo?.bar && bar && (bar.baz)', 'foo?.bar && bar?.baz'],
      },
      {
        code: noFormat`foo && (foo.bar && (baz))`,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: 'foo?.bar && (baz)',
      },
      {
        code: noFormat`foo && (foo.bar && (a && b) && c)`,
        errors: [{ messageId: 'preferOptionalChain' }],
        output: 'foo?.bar && (a && b) && c',
      },
    ],
    valid: [
      '!a || !b;',
      '!a || a.b;',
      '!a && a.b;',
      '!a && !a.b;',
      '!a.b || a.b?.();',
      '!a.b || a.b();',
      'foo ||= bar;',
      'foo ||= bar?.baz;',
      'foo ||= bar?.baz?.buzz;',
      'foo && bar;',
      'foo && foo;',
      'foo || bar;',
      'foo ?? bar;',
      'foo || foo.bar;',
      'foo ?? foo.bar;',
      "file !== 'index.ts' && file.endsWith('.ts');",
      'nextToken && sourceCode.isSpaceBetweenTokens(prevToken, nextToken);',
      'result && this.options.shouldPreserveNodeMaps;',
      'foo && fooBar.baz;',
      'match && match$1 !== undefined;',
      "typeof foo === 'number' && foo.toFixed();",
      "foo === 'undefined' && foo.length;",
      'foo == bar && foo.bar == null;',
      'foo === 1 && foo.toFixed();',
      // call arguments are considered
      'foo.bar(a) && foo.bar(a, b).baz;',
      // type parameters are considered
      'foo.bar<a>() && foo.bar<a, b>().baz;',
      // array elements are considered
      '[1, 2].length && [1, 2, 3].length.toFixed();',
      noFormat`[1,].length && [1, 2].length.toFixed();`,
      // short-circuiting chains are considered
      '(foo?.a).b && foo.a.b.c;',
      '(foo?.a)() && foo.a().b;',
      '(foo?.a)() && foo.a()();',
      // looks like a chain, but isn't actually a chain - just a pair of strict nullish checks
      'foo !== null && foo !== undefined;',
      "x['y'] !== undefined && x['y'] !== null;",
      // private properties
      'this.#a && this.#b;',
      '!this.#a || !this.#b;',
      'a.#foo?.bar;',
      '!a.#foo?.bar;',
      '!foo().#a || a;',
      '!a.b.#a || a;',
      '!new A().#b || a;',
      '!(await a).#b || a;',
      "!(foo as any).bar || 'anything';",
      // computed properties should be interrogated and correctly ignored
      '!foo[1 + 1] || !foo[1 + 2];',
      '!foo[1 + 1] || !foo[1 + 2].foo;',
      // currently do not handle 'this' as the first part of a chain
      'this && this.foo;',
      '!this || !this.foo;',
      '!entity.__helper!.__initialized || options.refresh;',
      'import.meta || true;',
      'import.meta || import.meta.foo;',
      '!import.meta && false;',
      '!import.meta && !import.meta.foo;',
      'new.target || new.target.length;',
      '!new.target || true;',
      // Do not handle direct optional chaining on private properties because this TS limitation (https://github.com/microsoft/TypeScript/issues/42734)
      'foo && foo.#bar;',
      '!foo || !foo.#bar;',
      // weird non-constant cases are ignored
      '({}) && {}.toString();',
      '[] && [].length;',
      '(() => {}) && (() => {}).name;',
      '(function () {}) && function () {}.name;',
      '(class Foo {}) && class Foo {}.constructor;',
      "new Map().get('a') && new Map().get('a').what;",
      // https://github.com/typescript-eslint/typescript-eslint/issues/7654
      'data && data.value !== null;',
      {
        code: '<div /> && (<div />).wtf;',
        filename: 'react.tsx',
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      },
      {
        code: '<></> && (<></>).wtf;',
        filename: 'react.tsx',
        languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      },
      'foo[x++] && foo[x++].bar;',
      'foo[yield x] && foo[yield x].bar;',
      'a = b && (a = b).wtf;',
      // TODO - should we handle this?
      '(x || y) != null && (x || y).foo;',
      // TODO - should we handle this?
      '(await foo) && (await foo).bar;',
      `
        declare const foo: { bar: string } | null;
        foo !== null && foo.bar !== null;
      `,
      `
        declare const foo: { bar: string | null } | null;
        foo != null && foo.bar !== null;
      `,
      {
        code: `
          declare const x: string;
          x && x.length;
        `,
        options: [{ requireNullish: true }],
      },
      {
        code: `
          declare const foo: string;
          foo && foo.toString();
        `,
        options: [{ requireNullish: true }],
      },
      {
        code: `
          declare const x: string | number | boolean | object;
          x && x.toString();
        `,
        options: [{ requireNullish: true }],
      },
      {
        code: `
          declare const foo: { bar: string };
          foo && foo.bar && foo.bar.toString();
        `,
        options: [{ requireNullish: true }],
      },
      {
        code: `
          declare const foo: string;
          foo && foo.toString() && foo.toString();
        `,
        options: [{ requireNullish: true }],
      },
      {
        code: `
          declare const foo: { bar: string };
          foo && foo.bar && foo.bar.toString() && foo.bar.toString();
        `,
        options: [{ requireNullish: true }],
      },
      {
        code: `
          declare const foo1: { bar: string | null };
          foo1 && foo1.bar;
        `,
        options: [{ requireNullish: true }],
      },
      {
        code: `
          declare const foo: string;
          (foo || {}).toString();
        `,
        options: [{ requireNullish: true }],
      },

      {
        code: `
          declare const foo: string | null;
          (foo || 'a' || {}).toString();
        `,
        options: [{ requireNullish: true }],
      },
      {
        code: `
          declare const x: any;
          x && x.length;
        `,
        options: [{ checkAny: false }],
      },
      {
        code: `
          declare const x: bigint;
          x && x.length;
        `,
        options: [{ checkBigInt: false }],
      },
      {
        code: `
          declare const x: boolean;
          x && x.length;
        `,
        options: [{ checkBoolean: false }],
      },
      {
        code: `
          declare const x: number;
          x && x.length;
        `,
        options: [{ checkNumber: false }],
      },
      {
        code: `
          declare const x: string;
          x && x.length;
        `,
        options: [{ checkString: false }],
      },
      {
        code: `
          declare const x: unknown;
          x && x.length;
        `,
        options: [{ checkUnknown: false }],
      },
      '(x = {}) && (x.y = true) != null && x.y.toString();',
      "('x' as `${'x'}`) && ('x' as `${'x'}`).length;",
      '`x` && `x`.length;',
      '`x${a}` && `x${a}`.length;',

      // falsy unions should be ignored
      `
        declare const x: false | { a: string };
        x && x.a;
      `,
      `
        declare const x: false | { a: string };
        !x || x.a;
      `,
      `
        declare const x: '' | { a: string };
        x && x.a;
      `,
      `
        declare const x: '' | { a: string };
        !x || x.a;
      `,
      `
        declare const x: 0 | { a: string };
        x && x.a;
      `,
      `
        declare const x: 0 | { a: string };
        !x || x.a;
      `,
      `
        declare const x: 0n | { a: string };
        x && x.a;
      `,
      `
        declare const x: 0n | { a: string };
        !x || x.a;
      `,
      "typeof globalThis !== 'undefined' && globalThis.Array();",
      `
        declare const x: void | (() => void);
        x && x();
      `,
    ],
  });
});

describe('base cases', () => {
  describe('and', () => {
    describe('boolean', () => {
      ruleTester.run('prefer-optional-chain', rule, {
        invalid: [
          {
            code: `
declare const foo: { bar: number } | null | undefined;
foo && foo.bar;
            `,
            errors: [
              {
                column: 1,
                endColumn: 15,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar && foo.bar.baz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz;
            `,
          },
          {
            code: `
declare const foo: (() => number) | null | undefined;
foo && foo();
            `,
            errors: [
              {
                column: 1,
                endColumn: 13,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: (() => number) | null | undefined;
foo?.();
            `,
          },
          {
            code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar && foo.bar();
            `,
            errors: [
              {
                column: 1,
                endColumn: 21,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.();
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 50,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
            `,
          },
          {
            code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar && foo.bar.baz && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 43,
                endLine: 5,
                line: 5,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 35,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 28,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 58,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar?.baz?.buzz;
            `,
          },
          {
            code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar] && foo[bar].baz && foo[bar].baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz;
            `,
          },
          {
            code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar].baz && foo[bar].baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz;
            `,
          },
          {
            code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo && foo[bar.baz] && foo[bar.baz].buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
                endLine: 7,
                line: 7,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo?.[bar.baz]?.buzz;
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 52,
                endLine: 11,
                line: 11,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz();
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 72,
                endLine: 13,
                line: 13,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz?.();
            `,
          },
          {
            code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
                endLine: 8,
                line: 8,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.baz?.buzz?.();
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 37,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz();
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar && foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 30,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz();
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz && foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 57,
                endLine: 11,
                line: 11,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.();
            `,
          },
          {
            code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar &&
  foo.bar() &&
  foo.bar().baz &&
  foo.bar().baz.buzz &&
  foo.bar().baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
                endLine: 12,
                line: 8,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.()?.baz?.buzz?.();
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz]();
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]();
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz] && foo.bar.baz[buzz]();
            `,
            errors: [
              {
                column: 1,
                endColumn: 74,
                endLine: 17,
                line: 17,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.();
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo?.bar && foo?.bar.baz && foo?.bar.baz[buzz] && foo?.bar.baz[buzz]();
            `,
            errors: [
              {
                column: 1,
                endColumn: 78,
                endLine: 17,
                line: 17,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.();
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo && foo?.bar.baz && foo?.bar.baz[buzz];
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
                endLine: 7,
                line: 7,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo?.bar.baz?.[buzz];
            `,
          },
          {
            code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo && foo?.() && foo?.().bar;
            `,
            errors: [
              {
                column: 1,
                endColumn: 30,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo?.()?.bar;
            `,
          },
          {
            code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar && foo.bar?.() && foo.bar?.().baz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz;
            `,
          },
          // it should ignore parts of the expression that aren't part of the expression chain
          {
            code: `
declare const foo: { bar: number } | null | undefined;
foo && foo.bar && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 15,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar && foo.bar.baz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz && bing;
            `,
          },
          {
            code: `
declare const foo: (() => number) | null | undefined;
foo && foo() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 13,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: (() => number) | null | undefined;
foo?.() && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar && foo.bar() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 21,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.() && bing;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 50,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz && bing;
            `,
          },
          {
            code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar && foo.bar.baz && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 43,
                endLine: 5,
                line: 5,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz && bing;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 35,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 28,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz && bing;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz && bing;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 58,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar?.baz?.buzz && bing;
            `,
          },
          {
            code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar] && foo[bar].baz && foo[bar].baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz && bing;
            `,
          },
          {
            code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar].baz && foo[bar].baz.buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz && bing;
            `,
          },
          {
            code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo && foo[bar.baz] && foo[bar.baz].buzz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
                endLine: 7,
                line: 7,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo?.[bar.baz]?.buzz && bing;
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 52,
                endLine: 11,
                line: 11,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz() && bing;
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 72,
                endLine: 13,
                line: 13,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz?.() && bing;
            `,
          },
          {
            code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
                endLine: 8,
                line: 8,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.baz?.buzz?.() && bing;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 37,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz() && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar && foo.bar.baz.buzz() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 30,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz() && bing;
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz && foo.bar.baz.buzz() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 57,
                endLine: 11,
                line: 11,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.() && bing;
            `,
          },
          {
            code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar &&
  foo.bar() &&
  foo.bar().baz &&
  foo.bar().baz.buzz &&
  foo.bar().baz.buzz() &&
  bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
                endLine: 12,
                line: 8,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.()?.baz?.buzz?.() &&
  bing;
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz]() && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]() && bing;
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo.bar &&
  foo.bar.baz &&
  foo.bar.baz[buzz] &&
  foo.bar.baz[buzz]() &&
  bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 22,
                endLine: 21,
                line: 17,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.() &&
  bing;
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo?.bar &&
  foo?.bar.baz &&
  foo?.bar.baz[buzz] &&
  foo?.bar.baz[buzz]() &&
  bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
                endLine: 21,
                line: 17,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.() &&
  bing;
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo && foo?.bar.baz && foo?.bar.baz[buzz] && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
                endLine: 7,
                line: 7,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo?.bar.baz?.[buzz] && bing;
            `,
          },
          {
            code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo && foo?.() && foo?.().bar && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 30,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo?.()?.bar && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar && foo.bar?.() && foo.bar?.().baz && bing;
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz && bing;
            `,
          },
          {
            code: `
declare const foo: { bar: number } | null | undefined;
foo && foo.bar && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 15,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar && bing.bong;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar && foo.bar.baz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz && bing.bong;
            `,
          },
          {
            code: `
declare const foo: (() => number) | null | undefined;
foo && foo() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 13,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: (() => number) | null | undefined;
foo?.() && bing.bong;
            `,
          },
          {
            code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar && foo.bar() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 21,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.() && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 50,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar && foo.bar.baz && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 43,
                endLine: 5,
                line: 5,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 35,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 28,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 58,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar?.baz?.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar] && foo[bar].baz && foo[bar].baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar].baz && foo[bar].baz.buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo && foo[bar.baz] && foo[bar.baz].buzz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 41,
                endLine: 7,
                line: 7,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo?.[bar.baz]?.buzz && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 52,
                endLine: 11,
                line: 11,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz() && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo.bar &&
  foo.bar.baz &&
  foo.bar.baz.buzz &&
  foo.bar.baz.buzz() &&
  bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 21,
                endLine: 17,
                line: 13,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz?.() &&
  bing.bong;
            `,
          },
          {
            code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 65,
                endLine: 8,
                line: 8,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.baz?.buzz?.() && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 37,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz() && bing.bong;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar && foo.bar.baz.buzz() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 30,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz() && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz.buzz && foo.bar.baz.buzz() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 57,
                endLine: 11,
                line: 11,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.() && bing.bong;
            `,
          },
          {
            code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar &&
  foo.bar() &&
  foo.bar().baz &&
  foo.bar().baz.buzz &&
  foo.bar().baz.buzz() &&
  bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
                endLine: 12,
                line: 8,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.()?.baz?.buzz?.() &&
  bing.bong;
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz]() && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 53,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]() && bing.bong;
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo.bar &&
  foo.bar.baz &&
  foo.bar.baz[buzz] &&
  foo.bar.baz[buzz]() &&
  bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 22,
                endLine: 21,
                line: 17,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.() &&
  bing.bong;
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo?.bar &&
  foo?.bar.baz &&
  foo?.bar.baz[buzz] &&
  foo?.bar.baz[buzz]() &&
  bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
                endLine: 21,
                line: 17,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.() &&
  bing.bong;
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo && foo?.bar.baz && foo?.bar.baz[buzz] && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
                endLine: 7,
                line: 7,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo?.bar.baz?.[buzz] && bing.bong;
            `,
          },
          {
            code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo && foo?.() && foo?.().bar && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 30,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo?.()?.bar && bing.bong;
            `,
          },
          {
            code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar && foo.bar?.() && foo.bar?.().baz && bing.bong;
            `,
            errors: [
              {
                column: 1,
                endColumn: 42,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz && bing.bong;
            `,
          },
        ],
        valid: [],
      });
    });

    describe('strict nullish equality checks', () => {
      describe('!== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          // with the `| null | undefined` type - `!== null` doesn't cover the
          // `undefined` case - so optional chaining is not a valid conversion
          valid: [
            {
              code: `
declare const foo: { bar: number } | null | undefined;
foo !== null && foo.bar;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar !== null && foo.bar.baz;
              `,
            },
            {
              code: `
declare const foo: (() => number) | null | undefined;
foo !== null && foo();
              `,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar !== null && foo.bar();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo !== null && foo.bar !== null && foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar !== null && foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== null && foo[bar] !== null && foo[bar].baz !== null && foo[bar].baz.buzz;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== null && foo[bar].baz !== null && foo[bar].baz.buzz;
              `,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo !== null && foo[bar.baz] !== null && foo[bar.baz].buzz;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz !== null &&
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz !== null &&
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo !== null && foo.bar !== null && foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar !== null && foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz.buzz !== null &&
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar !== null &&
  foo.bar() !== null &&
  foo.bar().baz !== null &&
  foo.bar().baz.buzz !== null &&
  foo.bar().baz.buzz();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz[buzz] !== null &&
  foo.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== null &&
  foo?.bar !== null &&
  foo?.bar.baz !== null &&
  foo?.bar.baz[buzz] !== null &&
  foo?.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo !== null && foo?.bar.baz !== null && foo?.bar.baz[buzz];
              `,
            },
            {
              code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo !== null && foo?.() !== null && foo?.().bar;
              `,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar !== null && foo.bar?.() !== null && foo.bar?.().baz;
              `,
            },
          ],
          // but if the type is just `| null` - then it covers the cases and is
          // a valid conversion
          invalid: [
            {
              code: `
declare const foo: { bar: number } | null;
foo !== null && foo.bar;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 24,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: number } | null;
foo?.bar;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null };
foo.bar !== null && foo.bar.baz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 32,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: number } | null };
foo.bar?.baz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: (() => number) | null;
foo !== null && foo();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 22,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: (() => number) | null;
foo?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null };
foo.bar !== null && foo.bar();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 30,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: (() => number) | null };
foo.bar?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 77,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo?.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null } | null;
};
foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 61,
                  endLine: 5,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: number } | null } | null;
};
foo.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null } | null;
foo !== null && foo.bar !== null && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 53,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } } | null } | null;
foo?.bar?.baz.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null };
foo.bar !== null && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 37,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } } | null };
foo.bar?.baz.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 19,
                  endLine: 7,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo?.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 19,
                  endLine: 6,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo !== null && foo[bar] !== null && foo[bar].baz !== null && foo[bar].baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 80,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo?.[bar]?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo !== null && foo[bar].baz !== null && foo[bar].baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 59,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo?.[bar].baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | null } | null;
foo !== null && foo[bar.baz] !== null && foo[bar.baz].buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 59,
                  endLine: 4,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | null } | null;
foo?.[bar.baz]?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: () => number } | null } | null;
} | null;
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 79,
                  endLine: 5,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: () => number } | null } | null;
} | null;
foo?.bar?.baz?.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: {
    baz: { buzz: (() => number) | null } | null;
  } | null;
} | null;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz !== null &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 11,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: {
    baz: { buzz: (() => number) | null } | null;
  } | null;
} | null;
foo?.bar?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz.buzz !== null &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null } | null;
foo !== null && foo.bar !== null && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 55,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null } | null;
foo?.bar?.baz.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null };
foo.bar !== null && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 39,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null };
foo.bar?.baz.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | null } } | null;
} | null;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz.buzz !== null &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | null } } | null;
} | null;
foo?.bar?.baz.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: () => { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar !== null &&
  foo.bar() !== null &&
  foo.bar().baz !== null &&
  foo.bar().baz.buzz !== null &&
  foo.bar().baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 23,
                  endLine: 9,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: () => { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar?.()?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo: {
  bar: { baz: { [k: string]: () => number } | null } | null;
} | null;
foo !== null && foo.bar !== null && foo.bar.baz !== null && foo.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 80,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo: {
  bar: { baz: { [k: string]: () => number } | null } | null;
} | null;
foo?.bar?.baz?.[buzz]();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo !== null &&
  foo.bar !== null &&
  foo.bar.baz !== null &&
  foo.bar.baz[buzz] !== null &&
  foo.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 22,
                  endLine: 12,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo?.bar?.baz?.[buzz]?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo !== null &&
  foo?.bar !== null &&
  foo?.bar.baz !== null &&
  foo?.bar.baz[buzz] !== null &&
  foo?.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 23,
                  endLine: 12,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo?.bar?.baz?.[buzz]?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo: { bar: { baz: { [k: string]: number } | null } } | null;
foo !== null && foo?.bar.baz !== null && foo?.bar.baz[buzz];
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 60,
                  endLine: 4,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo: { bar: { baz: { [k: string]: number } | null } } | null;
foo?.bar.baz?.[buzz];
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: (() => { bar: number } | null) | null;
foo !== null && foo?.() !== null && foo?.().bar;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 48,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: (() => { bar: number } | null) | null;
foo?.()?.bar;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | null };
foo.bar !== null && foo.bar?.() !== null && foo.bar?.().baz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 60,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: () => { baz: number } | null };
foo.bar?.()?.baz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
          ],
        });
      });

      describe('!= null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          invalid: [
            {
              code: `
declare const foo: { bar: number } | null | undefined;
foo != null && foo.bar;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 23,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar != null && foo.bar.baz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 31,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: (() => number) | null | undefined;
foo != null && foo();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: (() => number) | null | undefined;
foo?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar != null && foo.bar();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 29,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo != null && foo.bar != null && foo.bar.baz != null && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 74,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar != null && foo.bar.baz != null && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 59,
                  endLine: 5,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo != null && foo.bar != null && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 51,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar != null && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 36,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo != null &&
  foo.bar != null &&
  foo.bar.baz != null &&
  foo.bar.baz != null &&
  foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 19,
                  endLine: 10,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar != null &&
  foo.bar.baz != null &&
  foo.bar.baz != null &&
  foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 19,
                  endLine: 9,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != null && foo[bar] != null && foo[bar].baz != null && foo[bar].baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 77,
                  endLine: 12,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != null && foo[bar].baz != null && foo[bar].baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 57,
                  endLine: 12,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo != null && foo[bar.baz] != null && foo[bar.baz].buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 57,
                  endLine: 7,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo?.[bar.baz]?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != null && foo.bar != null && foo.bar.baz != null && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 76,
                  endLine: 11,
                  line: 11,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != null &&
  foo.bar != null &&
  foo.bar.baz != null &&
  foo.bar.baz.buzz != null &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 17,
                  line: 13,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar != null &&
  foo.bar.baz != null &&
  foo.bar.baz.buzz != null &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 11,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo != null && foo.bar != null && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 53,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar != null && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 38,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != null &&
  foo.bar != null &&
  foo.bar.baz.buzz != null &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 14,
                  line: 11,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar != null &&
  foo.bar() != null &&
  foo.bar().baz != null &&
  foo.bar().baz.buzz != null &&
  foo.bar().baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 23,
                  endLine: 12,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.()?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != null && foo.bar != null && foo.bar.baz != null && foo.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 77,
                  endLine: 12,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != null &&
  foo.bar != null &&
  foo.bar.baz != null &&
  foo.bar.baz[buzz] != null &&
  foo.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 22,
                  endLine: 21,
                  line: 17,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != null &&
  foo?.bar != null &&
  foo?.bar.baz != null &&
  foo?.bar.baz[buzz] != null &&
  foo?.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 23,
                  endLine: 21,
                  line: 17,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo != null && foo?.bar.baz != null && foo?.bar.baz[buzz];
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 58,
                  endLine: 7,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo?.bar.baz?.[buzz];
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo != null && foo?.() != null && foo?.().bar;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 46,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo?.()?.bar;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar != null && foo.bar?.() != null && foo.bar?.().baz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 58,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
          ],
          valid: [],
        });
      });

      describe('!== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          // with the `| null | undefined` type - `!== undefined` doesn't cover the
          // `null` case - so optional chaining is not a valid conversion
          valid: [
            {
              code: `
declare const foo: { bar: number } | null | undefined;
foo !== undefined && foo.bar;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar !== undefined && foo.bar.baz;
              `,
            },
            {
              code: `
declare const foo: (() => number) | null | undefined;
foo !== undefined && foo();
              `,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar !== undefined && foo.bar();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar !== undefined && foo.bar.baz !== undefined && foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo !== undefined && foo.bar !== undefined && foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar !== undefined && foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== undefined &&
  foo[bar] !== undefined &&
  foo[bar].baz !== undefined &&
  foo[bar].baz.buzz;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== undefined && foo[bar].baz !== undefined && foo[bar].baz.buzz;
              `,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo !== undefined && foo[bar.baz] !== undefined && foo[bar.baz].buzz;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo !== undefined && foo.bar !== undefined && foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar !== undefined && foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz[buzz] !== undefined &&
  foo.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo !== undefined &&
  foo?.bar !== undefined &&
  foo?.bar.baz !== undefined &&
  foo?.bar.baz[buzz] !== undefined &&
  foo?.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo !== undefined && foo?.bar.baz !== undefined && foo?.bar.baz[buzz];
              `,
            },
            {
              code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo !== undefined && foo?.() !== undefined && foo?.().bar;
              `,
            },
          ],
          // but if the type is just `| undefined` - then it covers the cases and is
          // a valid conversion
          invalid: [
            {
              code: `
declare const foo: { bar: number } | undefined;
foo !== undefined && foo.bar;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 29,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: number } | undefined;
foo?.bar;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | undefined };
foo.bar !== undefined && foo.bar.baz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 37,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: number } | undefined };
foo.bar?.baz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: (() => number) | undefined;
foo !== undefined && foo();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 27,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: (() => number) | undefined;
foo?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: (() => number) | undefined };
foo.bar !== undefined && foo.bar();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: (() => number) | undefined };
foo.bar?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 19,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo?.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | undefined } | undefined;
};
foo.bar !== undefined && foo.bar.baz !== undefined && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 71,
                  endLine: 5,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: number } | undefined } | undefined;
};
foo.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | undefined } | undefined;
foo !== undefined && foo.bar !== undefined && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 63,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } } | undefined } | undefined;
foo?.bar?.baz.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | undefined };
foo.bar !== undefined && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 42,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } } | undefined };
foo.bar?.baz.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 19,
                  endLine: 9,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo?.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 19,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo !== undefined &&
  foo[bar] !== undefined &&
  foo[bar].baz !== undefined &&
  foo[bar].baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 20,
                  endLine: 11,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo?.[bar]?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo !== undefined && foo[bar].baz !== undefined && foo[bar].baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 69,
                  endLine: 8,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo?.[bar].baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | undefined } | undefined;
foo !== undefined && foo[bar.baz] !== undefined && foo[bar.baz].buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 69,
                  endLine: 4,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | undefined } | undefined;
foo?.[bar.baz]?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | {
      bar: { baz: { buzz: () => number } | undefined } | undefined;
    }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 10,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | {
      bar: { baz: { buzz: () => number } | undefined } | undefined;
    }
  | undefined;
foo?.bar?.baz?.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 15,
                  line: 11,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo?.bar?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
};
foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
};
foo.bar?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | undefined }
  | undefined;
foo !== undefined && foo.bar !== undefined && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 65,
                  endLine: 5,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | undefined }
  | undefined;
foo?.bar?.baz.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | undefined };
foo.bar !== undefined && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 44,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: () => number } } | undefined };
foo.bar?.baz.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | {
      bar: { baz: { buzz: (() => number) | undefined } } | undefined;
    }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz.buzz !== undefined &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 10,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | {
      bar: { baz: { buzz: (() => number) | undefined } } | undefined;
    }
  | undefined;
foo?.bar?.baz.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | undefined } | undefined }
    | undefined;
};
foo.bar !== undefined &&
  foo.bar() !== undefined &&
  foo.bar().baz !== undefined &&
  foo.bar().baz.buzz !== undefined &&
  foo.bar().baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 23,
                  endLine: 11,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | undefined } | undefined }
    | undefined;
};
foo.bar?.()?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar: { baz: { [k: string]: () => number } | undefined } | undefined;
    }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 22,
                  endLine: 11,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | {
      bar: { baz: { [k: string]: () => number } | undefined } | undefined;
    }
  | undefined;
foo?.bar?.baz?.[buzz]();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo !== undefined &&
  foo.bar !== undefined &&
  foo.bar.baz !== undefined &&
  foo.bar.baz[buzz] !== undefined &&
  foo.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 22,
                  endLine: 16,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo?.bar?.baz?.[buzz]?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo !== undefined &&
  foo?.bar !== undefined &&
  foo?.bar.baz !== undefined &&
  foo?.bar.baz[buzz] !== undefined &&
  foo?.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 23,
                  endLine: 16,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo?.bar?.baz?.[buzz]?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | undefined } }
  | undefined;
foo !== undefined && foo?.bar.baz !== undefined && foo?.bar.baz[buzz];
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 70,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | undefined } }
  | undefined;
foo?.bar.baz?.[buzz];
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: (() => { bar: number } | undefined) | undefined;
foo !== undefined && foo?.() !== undefined && foo?.().bar;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 58,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: (() => { bar: number } | undefined) | undefined;
foo?.()?.bar;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | undefined };
foo.bar !== undefined && foo.bar?.() !== undefined && foo.bar?.().baz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 70,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: () => { baz: number } | undefined };
foo.bar?.()?.baz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
                declare const foo: {
                  bar: () =>
                    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
                    | null
                    | undefined;
                };
                foo.bar !== undefined &&
                  foo.bar() !== undefined &&
                  foo.bar().baz !== undefined &&
                  foo.bar().baz.buzz !== undefined &&
                  foo.bar().baz.buzz();
              `,
              errors: [
                {
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
                declare const foo: {
                  bar: () =>
                    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
                    | null
                    | undefined;
                };
                foo.bar?.() !== undefined &&
                  foo.bar().baz !== undefined &&
                  foo.bar().baz.buzz !== undefined &&
                  foo.bar().baz.buzz();
              `,
                    },
                  ],
                },
              ],
            },
            {
              code: `
                declare const foo: { bar: () => { baz: number } | null | undefined };
                foo.bar !== undefined && foo.bar?.() !== undefined && foo.bar?.().baz;
              `,
              errors: [
                {
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
                declare const foo: { bar: () => { baz: number } | null | undefined };
                foo.bar?.() !== undefined && foo.bar?.().baz;
              `,
                    },
                  ],
                },
              ],
            },
          ],
        });
      });

      describe('!= undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          invalid: [
            {
              code: `
declare const foo: { bar: number } | null | undefined;
foo != undefined && foo.bar;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 28,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar != undefined && foo.bar.baz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 36,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: (() => number) | null | undefined;
foo != undefined && foo();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 26,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: (() => number) | null | undefined;
foo?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar != undefined && foo.bar();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 19,
                  endLine: 9,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar != undefined && foo.bar.baz != undefined && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 69,
                  endLine: 5,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo != undefined && foo.bar != undefined && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 61,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar != undefined && foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 41,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 19,
                  endLine: 10,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 19,
                  endLine: 9,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != undefined &&
  foo[bar] != undefined &&
  foo[bar].baz != undefined &&
  foo[bar].baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 20,
                  endLine: 15,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != undefined && foo[bar].baz != undefined && foo[bar].baz.buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 67,
                  endLine: 12,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo != undefined && foo[bar.baz] != undefined && foo[bar.baz].buzz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 67,
                  endLine: 7,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo?.[bar.baz]?.buzz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 14,
                  line: 11,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz.buzz != undefined &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 17,
                  line: 13,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz.buzz != undefined &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 11,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo != undefined && foo.bar != undefined && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 63,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar != undefined && foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 43,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz.buzz != undefined &&
  foo.bar.baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 21,
                  endLine: 14,
                  line: 11,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar != undefined &&
  foo.bar() != undefined &&
  foo.bar().baz != undefined &&
  foo.bar().baz.buzz != undefined &&
  foo.bar().baz.buzz();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 23,
                  endLine: 12,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.()?.baz?.buzz?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 22,
                  endLine: 15,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != undefined &&
  foo.bar != undefined &&
  foo.bar.baz != undefined &&
  foo.bar.baz[buzz] != undefined &&
  foo.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 22,
                  endLine: 21,
                  line: 17,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo != undefined &&
  foo?.bar != undefined &&
  foo?.bar.baz != undefined &&
  foo?.bar.baz[buzz] != undefined &&
  foo?.bar.baz[buzz]();
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 23,
                  endLine: 21,
                  line: 17,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.();
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo != undefined && foo?.bar.baz != undefined && foo?.bar.baz[buzz];
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 68,
                  endLine: 7,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo?.bar.baz?.[buzz];
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo != undefined && foo?.() != undefined && foo?.().bar;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 56,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo?.()?.bar;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar != undefined && foo.bar?.() != undefined && foo.bar?.().baz;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 68,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
          ],
          valid: [],
        });
      });
    });
  });

  describe('or', () => {
    describe('boolean', () => {
      ruleTester.run('prefer-optional-chain', rule, {
        invalid: [
          {
            code: `
declare const foo: { bar: number } | null | undefined;
!foo || !foo.bar;
            `,
            errors: [
              {
                column: 1,
                endColumn: 17,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: number } | null | undefined;
!foo?.bar;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: number } | null | undefined };
!foo.bar || !foo.bar.baz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 25,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: number } | null | undefined };
!foo.bar?.baz;
            `,
          },
          {
            code: `
declare const foo: (() => number) | null | undefined;
!foo || !foo();
            `,
            errors: [
              {
                column: 1,
                endColumn: 15,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: (() => number) | null | undefined;
!foo?.();
            `,
          },
          {
            code: `
declare const foo: { bar: (() => number) | null | undefined };
!foo.bar || !foo.bar();
            `,
            errors: [
              {
                column: 1,
                endColumn: 23,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: (() => number) | null | undefined };
!foo.bar?.();
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 54,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
!foo?.bar?.baz?.buzz;
            `,
          },
          {
            code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
!foo.bar || !foo.bar.baz || !foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 46,
                endLine: 5,
                line: 5,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
!foo.bar?.baz?.buzz;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 38,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
!foo?.bar?.baz.buzz;
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
!foo.bar || !foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 30,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
!foo.bar?.baz.buzz;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz || !foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 70,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
!foo?.bar?.baz?.buzz;
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
!foo.bar || !foo.bar.baz || !foo.bar.baz || !foo.bar.baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 62,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
!foo.bar?.baz?.buzz;
            `,
          },
          {
            code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo || !foo[bar] || !foo[bar].baz || !foo[bar].baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 57,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo?.[bar]?.baz?.buzz;
            `,
          },
          {
            code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo || !foo[bar].baz || !foo[bar].baz.buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 44,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo?.[bar].baz?.buzz;
            `,
          },
          {
            code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
!foo || !foo[bar.baz] || !foo[bar.baz].buzz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 44,
                endLine: 7,
                line: 7,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
!foo?.[bar.baz]?.buzz;
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 56,
                endLine: 11,
                line: 11,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo?.bar?.baz?.buzz();
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz.buzz || !foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 77,
                endLine: 13,
                line: 13,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo?.bar?.baz?.buzz?.();
            `,
          },
          {
            code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
!foo.bar || !foo.bar.baz || !foo.bar.baz.buzz || !foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 69,
                endLine: 8,
                line: 8,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
!foo.bar?.baz?.buzz?.();
            `,
          },
          {
            code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 40,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
!foo?.bar?.baz.buzz();
            `,
          },
          {
            code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
!foo.bar || !foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 32,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
!foo.bar?.baz.buzz();
            `,
          },
          {
            code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz.buzz || !foo.bar.baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 61,
                endLine: 11,
                line: 11,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo?.bar?.baz.buzz?.();
            `,
          },
          {
            code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
!foo.bar ||
  !foo.bar() ||
  !foo.bar().baz ||
  !foo.bar().baz.buzz ||
  !foo.bar().baz.buzz();
            `,
            errors: [
              {
                column: 1,
                endColumn: 24,
                endLine: 12,
                line: 8,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
!foo.bar?.()?.baz?.buzz?.();
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz[buzz]();
            `,
            errors: [
              {
                column: 1,
                endColumn: 57,
                endLine: 12,
                line: 12,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo?.bar?.baz?.[buzz]();
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo || !foo.bar || !foo.bar.baz || !foo.bar.baz[buzz] || !foo.bar.baz[buzz]();
            `,
            errors: [
              {
                column: 1,
                endColumn: 79,
                endLine: 17,
                line: 17,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo?.bar?.baz?.[buzz]?.();
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo ||
  !foo?.bar ||
  !foo?.bar.baz ||
  !foo?.bar.baz[buzz] ||
  !foo?.bar.baz[buzz]();
            `,
            errors: [
              {
                column: 1,
                endColumn: 24,
                endLine: 21,
                line: 17,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
!foo?.bar?.baz?.[buzz]?.();
            `,
          },
          {
            code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
!foo || !foo?.bar.baz || !foo?.bar.baz[buzz];
            `,
            errors: [
              {
                column: 1,
                endColumn: 45,
                endLine: 7,
                line: 7,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
!foo?.bar.baz?.[buzz];
            `,
          },
          {
            code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
!foo || !foo?.() || !foo?.().bar;
            `,
            errors: [
              {
                column: 1,
                endColumn: 33,
                endLine: 6,
                line: 6,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
!foo?.()?.bar;
            `,
          },
          {
            code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
!foo.bar || !foo.bar?.() || !foo.bar?.().baz;
            `,
            errors: [
              {
                column: 1,
                endColumn: 45,
                endLine: 3,
                line: 3,
                messageId: 'preferOptionalChain',
                suggestions: null,
              },
            ],
            output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
!foo.bar?.()?.baz;
            `,
          },
        ],
        valid: [],
      });
    });

    describe('strict nullish equality checks', () => {
      describe('=== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          // with the `| null | undefined` type - `=== null` doesn't cover the
          // `undefined` case - so optional chaining is not a valid conversion
          valid: [
            {
              code: `
declare const foo: { bar: number } | null | undefined;
foo === null || foo.bar;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar === null || foo.bar.baz;
              `,
            },
            {
              code: `
declare const foo: (() => number) | null | undefined;
foo === null || foo();
              `,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar === null || foo.bar();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo === null || foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo === null || foo.bar === null || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar === null || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null || foo[bar] === null || foo[bar].baz === null || foo[bar].baz.buzz;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null || foo[bar].baz === null || foo[bar].baz.buzz;
              `,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo === null || foo[bar.baz] === null || foo[bar.baz].buzz;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null || foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo === null || foo.bar === null || foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar === null || foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null ||
  foo.bar === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar === null ||
  foo.bar() === null ||
  foo.bar().baz === null ||
  foo.bar().baz.buzz === null ||
  foo.bar().baz.buzz();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null || foo.bar === null || foo.bar.baz === null || foo.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz[buzz] === null ||
  foo.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === null ||
  foo?.bar === null ||
  foo?.bar.baz === null ||
  foo?.bar.baz[buzz] === null ||
  foo?.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo === null || foo?.bar.baz === null || foo?.bar.baz[buzz];
              `,
            },
            {
              code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo === null || foo?.() === null || foo?.().bar;
              `,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar === null || foo.bar?.() === null || foo.bar?.().baz;
              `,
            },
          ],
          // but if the type is just `| null` - then it covers the cases and is
          // a valid conversion
          invalid: [
            {
              code: `
declare const foo: { bar: number } | null;
foo === null || foo.bar === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 33,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: number } | null;
foo?.bar === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null };
foo.bar === null || foo.bar.baz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 41,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: number } | null };
foo.bar?.baz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: (() => number) | null;
foo === null || foo() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 31,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: (() => number) | null;
foo?.() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null };
foo.bar === null || foo.bar() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 39,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: (() => number) | null };
foo.bar?.() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 28,
                  endLine: 6,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo?.bar?.baz?.buzz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null } | null;
};
foo.bar === null || foo.bar.baz === null || foo.bar.baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 70,
                  endLine: 5,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: number } | null } | null;
};
foo.bar?.baz?.buzz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null } | null;
foo === null || foo.bar === null || foo.bar.baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 62,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } } | null } | null;
foo?.bar?.baz.buzz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null };
foo.bar === null || foo.bar.baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 46,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } } | null };
foo.bar?.baz.buzz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 28,
                  endLine: 7,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo?.bar?.baz?.buzz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 28,
                  endLine: 6,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: number } | null } | null } | null;
foo.bar?.baz?.buzz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo === null ||
  foo[bar] === null ||
  foo[bar].baz === null ||
  foo[bar].baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 29,
                  endLine: 9,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo?.[bar]?.baz?.buzz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo === null || foo[bar].baz === null || foo[bar].baz.buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 68,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: string;
declare const foo: {
  [k: string]: { baz: { buzz: number } | null } | null;
} | null;
foo?.[bar].baz?.buzz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | null } | null;
foo === null || foo[bar.baz] === null || foo[bar.baz].buzz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 68,
                  endLine: 4,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | null } | null;
foo?.[bar.baz]?.buzz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: () => number } | null } | null;
} | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 30,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: () => number } | null } | null;
} | null;
foo?.bar?.baz?.buzz() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: {
    baz: { buzz: (() => number) | null } | null;
  } | null;
} | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 30,
                  endLine: 11,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: {
    baz: { buzz: (() => number) | null } | null;
  } | null;
} | null;
foo?.bar?.baz?.buzz?.() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 30,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar?.baz?.buzz?.() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null } | null;
foo === null || foo.bar === null || foo.bar.baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 64,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null } | null;
foo?.bar?.baz.buzz() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null };
foo.bar === null || foo.bar.baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 48,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null };
foo.bar?.baz.buzz() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | null } } | null;
} | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz.buzz === null ||
  foo.bar.baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 30,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | null } } | null;
} | null;
foo?.bar?.baz.buzz?.() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: {
  bar: () => { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar === null ||
  foo.bar() === null ||
  foo.bar().baz === null ||
  foo.bar().baz.buzz === null ||
  foo.bar().baz.buzz() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 32,
                  endLine: 9,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: {
  bar: () => { baz: { buzz: (() => number) | null } | null } | null;
};
foo.bar?.()?.baz?.buzz?.() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo: {
  bar: { baz: { [k: string]: () => number } | null } | null;
} | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz[buzz]() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 31,
                  endLine: 9,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo: {
  bar: { baz: { [k: string]: () => number } | null } | null;
} | null;
foo?.bar?.baz?.[buzz]() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo === null ||
  foo.bar === null ||
  foo.bar.baz === null ||
  foo.bar.baz[buzz] === null ||
  foo.bar.baz[buzz]() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 31,
                  endLine: 12,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo?.bar?.baz?.[buzz]?.() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo === null ||
  foo?.bar === null ||
  foo?.bar.baz === null ||
  foo?.bar.baz[buzz] === null ||
  foo?.bar.baz[buzz]() === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 32,
                  endLine: 12,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo: {
  bar: {
    baz: { [k: string]: (() => number) | null } | null;
  } | null;
} | null;
foo?.bar?.baz?.[buzz]?.() === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const buzz: string;
declare const foo: { bar: { baz: { [k: string]: number } | null } } | null;
foo === null || foo?.bar.baz === null || foo?.bar.baz[buzz] === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 69,
                  endLine: 4,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const buzz: string;
declare const foo: { bar: { baz: { [k: string]: number } | null } } | null;
foo?.bar.baz?.[buzz] === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: (() => { bar: number } | null) | null;
foo === null || foo?.() === null || foo?.().bar === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 57,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: (() => { bar: number } | null) | null;
foo?.()?.bar === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | null };
foo.bar === null || foo.bar?.() === null || foo.bar?.().baz === null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 69,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
declare const foo: { bar: () => { baz: number } | null };
foo.bar?.()?.baz === null;
              `,
                    },
                  ],
                },
              ],
              output: null,
            },
          ],
        });
      });

      describe('== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          invalid: [
            {
              code: `
declare const foo: { bar: number } | null | undefined;
foo == null || foo.bar == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 31,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar == null;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar == null || foo.bar.baz == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 39,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz == null;
              `,
            },
            {
              code: `
declare const foo: (() => number) | null | undefined;
foo == null || foo() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 29,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: (() => number) | null | undefined;
foo?.() == null;
              `,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar == null || foo.bar() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 37,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.() == null;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 27,
                  endLine: 9,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz == null;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar == null || foo.bar.baz == null || foo.bar.baz.buzz == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 67,
                  endLine: 5,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz == null;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo == null || foo.bar == null || foo.bar.baz.buzz == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 59,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz == null;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar == null || foo.bar.baz.buzz == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 44,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz == null;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 27,
                  endLine: 10,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz == null;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 27,
                  endLine: 9,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar?.baz?.buzz == null;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo[bar] == null ||
  foo[bar].baz == null ||
  foo[bar].baz.buzz == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 28,
                  endLine: 15,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz == null;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null || foo[bar].baz == null || foo[bar].baz.buzz == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 65,
                  endLine: 12,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz == null;
              `,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo == null || foo[bar.baz] == null || foo[bar.baz].buzz == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 65,
                  endLine: 7,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo?.[bar.baz]?.buzz == null;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 29,
                  endLine: 14,
                  line: 11,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz() == null;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz == null ||
  foo.bar.baz.buzz() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 29,
                  endLine: 17,
                  line: 13,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz?.() == null;
              `,
            },
            {
              code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz.buzz == null ||
  foo.bar.baz.buzz() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 29,
                  endLine: 11,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.baz?.buzz?.() == null;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo == null || foo.bar == null || foo.bar.baz.buzz() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 61,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz() == null;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar == null || foo.bar.baz.buzz() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 46,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz() == null;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz.buzz == null ||
  foo.bar.baz.buzz() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 29,
                  endLine: 14,
                  line: 11,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.() == null;
              `,
            },
            {
              code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar == null ||
  foo.bar() == null ||
  foo.bar().baz == null ||
  foo.bar().baz.buzz == null ||
  foo.bar().baz.buzz() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 31,
                  endLine: 12,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.()?.baz?.buzz?.() == null;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz[buzz]() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 30,
                  endLine: 15,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]() == null;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo.bar == null ||
  foo.bar.baz == null ||
  foo.bar.baz[buzz] == null ||
  foo.bar.baz[buzz]() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 30,
                  endLine: 21,
                  line: 17,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.() == null;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == null ||
  foo?.bar == null ||
  foo?.bar.baz == null ||
  foo?.bar.baz[buzz] == null ||
  foo?.bar.baz[buzz]() == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 31,
                  endLine: 21,
                  line: 17,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.() == null;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo == null || foo?.bar.baz == null || foo?.bar.baz[buzz] == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 66,
                  endLine: 7,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo?.bar.baz?.[buzz] == null;
              `,
            },
            {
              code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo == null || foo?.() == null || foo?.().bar == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 54,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo?.()?.bar == null;
              `,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar == null || foo.bar?.() == null || foo.bar?.().baz == null;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 66,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz == null;
              `,
            },
          ],
          valid: [],
        });
      });

      describe('=== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          // with the `| null | undefined` type - `=== undefined` doesn't cover the
          // `null` case - so optional chaining is not a valid conversion
          valid: [
            {
              code: `
declare const foo: { bar: number } | null | undefined;
foo === undefined || foo.bar;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar === undefined || foo.bar.baz;
              `,
            },
            {
              code: `
declare const foo: (() => number) | null | undefined;
foo === undefined || foo();
              `,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar === undefined || foo.bar();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar === undefined || foo.bar.baz === undefined || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo === undefined || foo.bar === undefined || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar === undefined || foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === undefined ||
  foo[bar] === undefined ||
  foo[bar].baz === undefined ||
  foo[bar].baz.buzz;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === undefined || foo[bar].baz === undefined || foo[bar].baz.buzz;
              `,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo === undefined || foo[bar.baz] === undefined || foo[bar.baz].buzz;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined ||
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined ||
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo === undefined || foo.bar === undefined || foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar === undefined || foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz.buzz === undefined ||
  foo.bar.baz.buzz();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz[buzz] === undefined ||
  foo.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo === undefined ||
  foo?.bar === undefined ||
  foo?.bar.baz === undefined ||
  foo?.bar.baz[buzz] === undefined ||
  foo?.bar.baz[buzz]();
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo === undefined || foo?.bar.baz === undefined || foo?.bar.baz[buzz];
              `,
            },
            {
              code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo === undefined || foo?.() === undefined || foo?.().bar;
              `,
            },
          ],
          // but if the type is just `| undefined` - then it covers the cases and is
          // a valid conversion
          invalid: [
            {
              code: `
declare const foo: { bar: number } | undefined;
foo === undefined || foo.bar === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 43,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: number } | undefined;
foo?.bar === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | undefined };
foo.bar === undefined || foo.bar.baz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 51,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: number } | undefined };
foo.bar?.baz === undefined;
              `,
            },
            {
              code: `
declare const foo: (() => number) | undefined;
foo === undefined || foo() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 41,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: (() => number) | undefined;
foo?.() === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: (() => number) | undefined };
foo.bar === undefined || foo.bar() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 49,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: (() => number) | undefined };
foo.bar?.() === undefined;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 33,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo?.bar?.baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | undefined } | undefined;
};
foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 33,
                  endLine: 7,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: {
  bar: { baz: { buzz: number } | undefined } | undefined;
};
foo.bar?.baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | undefined } | undefined;
foo === undefined || foo.bar === undefined || foo.bar.baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 77,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: { buzz: number } } | undefined } | undefined;
foo?.bar?.baz.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | undefined };
foo.bar === undefined || foo.bar.baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 56,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: { buzz: number } } | undefined };
foo.bar?.baz.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 33,
                  endLine: 9,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo?.bar?.baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 33,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | undefined } | undefined }
  | undefined;
foo.bar?.baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo === undefined ||
  foo[bar] === undefined ||
  foo[bar].baz === undefined ||
  foo[bar].baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
                  endLine: 11,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo?.[bar]?.baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo === undefined ||
  foo[bar].baz === undefined ||
  foo[bar].baz.buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
                  endLine: 10,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]: { baz: { buzz: number } | undefined } | undefined;
    }
  | undefined;
foo?.[bar].baz?.buzz === undefined;
              `,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | undefined } | undefined;
foo === undefined ||
  foo[bar.baz] === undefined ||
  foo[bar.baz].buzz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
                  endLine: 6,
                  line: 4,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const bar: { baz: string };
declare const foo: { [k: string]: { buzz: number } | undefined } | undefined;
foo?.[bar.baz]?.buzz === undefined;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar: { baz: { buzz: () => number } | undefined } | undefined;
    }
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 10,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | {
      bar: { baz: { buzz: () => number } | undefined } | undefined;
    }
  | undefined;
foo?.bar?.baz?.buzz() === undefined;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined ||
  foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 15,
                  line: 11,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo?.bar?.baz?.buzz?.() === undefined;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
};
foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz.buzz === undefined ||
  foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 8,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: {
  bar: { baz: { buzz: (() => number) | undefined } | undefined } | undefined;
};
foo.bar?.baz?.buzz?.() === undefined;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | undefined }
  | undefined;
foo === undefined || foo.bar === undefined || foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 79,
                  endLine: 5,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | undefined }
  | undefined;
foo?.bar?.baz.buzz() === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | undefined };
foo.bar === undefined || foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 58,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: { buzz: () => number } } | undefined };
foo.bar?.baz.buzz() === undefined;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar: { baz: { buzz: (() => number) | undefined } } | undefined;
    }
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz.buzz === undefined ||
  foo.bar.baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 10,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | {
      bar: { baz: { buzz: (() => number) | undefined } } | undefined;
    }
  | undefined;
foo?.bar?.baz.buzz?.() === undefined;
              `,
            },
            {
              code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | undefined } | undefined }
    | undefined;
};
foo.bar === undefined ||
  foo.bar() === undefined ||
  foo.bar().baz === undefined ||
  foo.bar().baz.buzz === undefined ||
  foo.bar().baz.buzz() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 37,
                  endLine: 11,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | undefined } | undefined }
    | undefined;
};
foo.bar?.()?.baz?.buzz?.() === undefined;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar: { baz: { [k: string]: () => number } | undefined } | undefined;
    }
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz[buzz]() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 36,
                  endLine: 11,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | {
      bar: { baz: { [k: string]: () => number } | undefined } | undefined;
    }
  | undefined;
foo?.bar?.baz?.[buzz]() === undefined;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo === undefined ||
  foo.bar === undefined ||
  foo.bar.baz === undefined ||
  foo.bar.baz[buzz] === undefined ||
  foo.bar.baz[buzz]() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 36,
                  endLine: 16,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo?.bar?.baz?.[buzz]?.() === undefined;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo === undefined ||
  foo?.bar === undefined ||
  foo?.bar.baz === undefined ||
  foo?.bar.baz[buzz] === undefined ||
  foo?.bar.baz[buzz]() === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 37,
                  endLine: 16,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz: { [k: string]: (() => number) | undefined } | undefined;
          }
        | undefined;
    }
  | undefined;
foo?.bar?.baz?.[buzz]?.() === undefined;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | undefined } }
  | undefined;
foo === undefined ||
  foo?.bar.baz === undefined ||
  foo?.bar.baz[buzz] === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 8,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | undefined } }
  | undefined;
foo?.bar.baz?.[buzz] === undefined;
              `,
            },
            {
              code: `
declare const foo: (() => { bar: number } | undefined) | undefined;
foo === undefined || foo?.() === undefined || foo?.().bar === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 72,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: (() => { bar: number } | undefined) | undefined;
foo?.()?.bar === undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | undefined };
foo.bar === undefined ||
  foo.bar?.() === undefined ||
  foo.bar?.().baz === undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 32,
                  endLine: 5,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: () => { baz: number } | undefined };
foo.bar?.()?.baz === undefined;
              `,
            },
            {
              code: `
                declare const foo: {
                  bar: () =>
                    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
                    | null
                    | undefined;
                };
                foo.bar === undefined ||
                  foo.bar() === undefined ||
                  foo.bar().baz === undefined ||
                  foo.bar().baz.buzz === undefined ||
                  foo.bar().baz.buzz();
              `,
              errors: [
                {
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
                declare const foo: {
                  bar: () =>
                    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
                    | null
                    | undefined;
                };
                foo.bar?.() === undefined ||
                  foo.bar().baz === undefined ||
                  foo.bar().baz.buzz === undefined ||
                  foo.bar().baz.buzz();
              `,
                    },
                  ],
                },
              ],
            },
            {
              code: `
                declare const foo: { bar: () => { baz: number } | null | undefined };
                foo.bar === undefined || foo.bar?.() === undefined || foo.bar?.().baz;
              `,
              errors: [
                {
                  messageId: 'preferOptionalChain',
                  suggestions: [
                    {
                      messageId: 'optionalChainSuggest',
                      output: `
                declare const foo: { bar: () => { baz: number } | null | undefined };
                foo.bar?.() === undefined || foo.bar?.().baz;
              `,
                    },
                  ],
                },
              ],
            },
          ],
        });
      });

      describe('== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          invalid: [
            {
              code: `
declare const foo: { bar: number } | null | undefined;
foo == undefined || foo.bar == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 41,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar == undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar == undefined || foo.bar.baz == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 49,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz == undefined;
              `,
            },
            {
              code: `
declare const foo: (() => number) | null | undefined;
foo == undefined || foo() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 39,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: (() => number) | null | undefined;
foo?.() == undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar == undefined || foo.bar() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 47,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.() == undefined;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 32,
                  endLine: 9,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz == undefined;
              `,
            },
            {
              code: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 32,
                  endLine: 7,
                  line: 5,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz == undefined;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo == undefined || foo.bar == undefined || foo.bar.baz.buzz == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 74,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz == undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar == undefined || foo.bar.baz.buzz == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 54,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz == undefined;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 32,
                  endLine: 10,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz == undefined;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 32,
                  endLine: 9,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar?.baz?.buzz == undefined;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == undefined ||
  foo[bar] == undefined ||
  foo[bar].baz == undefined ||
  foo[bar].baz.buzz == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 33,
                  endLine: 15,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz == undefined;
              `,
            },
            {
              code: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == undefined || foo[bar].baz == undefined || foo[bar].baz.buzz == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 80,
                  endLine: 12,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz == undefined;
              `,
            },
            {
              code: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo == undefined || foo[bar.baz] == undefined || foo[bar.baz].buzz == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 80,
                  endLine: 7,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo?.[bar.baz]?.buzz == undefined;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
                  endLine: 14,
                  line: 11,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz() == undefined;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined ||
  foo.bar.baz.buzz() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
                  endLine: 17,
                  line: 13,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz?.() == undefined;
              `,
            },
            {
              code: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz.buzz == undefined ||
  foo.bar.baz.buzz() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
                  endLine: 11,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.baz?.buzz?.() == undefined;
              `,
            },
            {
              code: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo == undefined || foo.bar == undefined || foo.bar.baz.buzz() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 76,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz() == undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar == undefined || foo.bar.baz.buzz() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 56,
                  endLine: 3,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz() == undefined;
              `,
            },
            {
              code: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz.buzz == undefined ||
  foo.bar.baz.buzz() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
                  endLine: 14,
                  line: 11,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.() == undefined;
              `,
            },
            {
              code: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar == undefined ||
  foo.bar() == undefined ||
  foo.bar().baz == undefined ||
  foo.bar().baz.buzz == undefined ||
  foo.bar().baz.buzz() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 36,
                  endLine: 12,
                  line: 8,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.()?.baz?.buzz?.() == undefined;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz[buzz]() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 15,
                  line: 12,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]() == undefined;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == undefined ||
  foo.bar == undefined ||
  foo.bar.baz == undefined ||
  foo.bar.baz[buzz] == undefined ||
  foo.bar.baz[buzz]() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 35,
                  endLine: 21,
                  line: 17,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.() == undefined;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo == undefined ||
  foo?.bar == undefined ||
  foo?.bar.baz == undefined ||
  foo?.bar.baz[buzz] == undefined ||
  foo?.bar.baz[buzz]() == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 36,
                  endLine: 21,
                  line: 17,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.() == undefined;
              `,
            },
            {
              code: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo == undefined ||
  foo?.bar.baz == undefined ||
  foo?.bar.baz[buzz] == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 34,
                  endLine: 9,
                  line: 7,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo?.bar.baz?.[buzz] == undefined;
              `,
            },
            {
              code: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo == undefined || foo?.() == undefined || foo?.().bar == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 69,
                  endLine: 6,
                  line: 6,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo?.()?.bar == undefined;
              `,
            },
            {
              code: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar == undefined ||
  foo.bar?.() == undefined ||
  foo.bar?.().baz == undefined;
              `,
              errors: [
                {
                  column: 1,
                  endColumn: 31,
                  endLine: 5,
                  line: 3,
                  messageId: 'preferOptionalChain',
                  suggestions: null,
                },
              ],
              output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz == undefined;
              `,
            },
          ],
          valid: [],
        });
      });
    });
  });

  describe('should ignore spacing sanity checks', () => {
    ruleTester.run('prefer-optional-chain', rule, {
      valid: [],
      // One base case does not match the mutator, so we have to dedupe it
      invalid: [
        {
          code: noFormat`
declare const foo: { bar: number } | null | undefined;
foo && foo.      bar;
          `,
          errors: [
            {
              column: 1,
              endColumn: 21,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: number } | null | undefined };
foo.      bar && foo.      bar.      baz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 41,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz;
          `,
        },
        {
          code: `
declare const foo: (() => number) | null | undefined;
foo && foo();
          `,
          errors: [
            {
              column: 1,
              endColumn: 13,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: (() => number) | null | undefined;
foo?.();
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: (() => number) | null | undefined };
foo.      bar && foo.      bar();
          `,
          errors: [
            {
              column: 1,
              endColumn: 33,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 37,
              endLine: 9,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.      bar && foo.      bar.      baz && foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 79,
              endLine: 5,
              line: 5,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo && foo.      bar && foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 59,
              endLine: 6,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.      bar && foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 52,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 37,
              endLine: 10,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 37,
              endLine: 9,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar] && foo[bar].      baz && foo[bar].      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 71,
              endLine: 12,
              line: 12,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar].      baz && foo[bar].      baz.      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 59,
              endLine: 12,
              line: 12,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo && foo[bar.      baz] && foo[bar.      baz].      buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 59,
              endLine: 7,
              line: 7,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo?.[bar.      baz]?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 39,
              endLine: 14,
              line: 11,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz &&
  foo.      bar.      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 39,
              endLine: 17,
              line: 13,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz.      buzz &&
  foo.      bar.      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 39,
              endLine: 11,
              line: 8,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo && foo.      bar && foo.      bar.      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 61,
              endLine: 6,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz();
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.      bar && foo.      bar.      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 54,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo.      bar &&
  foo.      bar.      baz.      buzz &&
  foo.      bar.      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 39,
              endLine: 14,
              line: 11,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.      bar &&
  foo.      bar() &&
  foo.      bar().      baz &&
  foo.      bar().      baz.      buzz &&
  foo.      bar().      baz.      buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 41,
              endLine: 12,
              line: 8,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.()?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz[buzz]();
          `,
          errors: [
            {
              column: 1,
              endColumn: 34,
              endLine: 15,
              line: 12,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]();
          `,
        },
        {
          code: noFormat`
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo.      bar &&
  foo.      bar.      baz &&
  foo.      bar.      baz[buzz] &&
  foo.      bar.      baz[buzz]();
          `,
          errors: [
            {
              column: 1,
              endColumn: 34,
              endLine: 21,
              line: 17,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.();
          `,
        },
        {
          code: noFormat`
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo &&
  foo?.      bar &&
  foo?.      bar.      baz &&
  foo?.      bar.      baz[buzz] &&
  foo?.      bar.      baz[buzz]();
          `,
          errors: [
            {
              column: 1,
              endColumn: 35,
              endLine: 21,
              line: 17,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.();
          `,
        },
        {
          code: noFormat`
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo && foo?.      bar.      baz && foo?.      bar.      baz[buzz];
          `,
          errors: [
            {
              column: 1,
              endColumn: 66,
              endLine: 7,
              line: 7,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo?.bar.baz?.[buzz];
          `,
        },
        {
          code: noFormat`
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo && foo?.      () && foo?.      ().      bar;
          `,
          errors: [
            {
              column: 1,
              endColumn: 48,
              endLine: 6,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo?.()?.bar;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.      bar && foo.      bar?.      () && foo.      bar?.      ().      baz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 78,
              endLine: 3,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: number } | null | undefined;
foo && foo.
bar;
          `,
          errors: [
            {
              column: 1,
              endColumn: 4,
              endLine: 4,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: number } | null | undefined;
foo?.bar;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: number } | null | undefined };
foo.
bar && foo.
bar.
baz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 4,
              endLine: 6,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: { baz: number } | null | undefined };
foo.bar?.baz;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: (() => number) | null | undefined };
foo.
bar && foo.
bar();
          `,
          errors: [
            {
              column: 1,
              endColumn: 6,
              endLine: 5,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: (() => number) | null | undefined };
foo.bar?.();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 12,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.
bar && foo.
bar.
baz && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 11,
              line: 5,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: {
  bar: { baz: { buzz: number } | null | undefined } | null | undefined;
};
foo.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 10,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.
bar && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 7,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: { baz: { buzz: number } } | null | undefined };
foo.bar?.baz.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 14,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.
bar && foo.
bar.
baz && foo.
bar.
baz && foo.
bar.
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 14,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: number } | null | undefined } | null | undefined }
  | null
  | undefined;
foo.bar?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar] && foo[bar].
baz && foo[bar].
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 15,
              line: 12,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar]?.baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo[bar].
baz && foo[bar].
baz.
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 15,
              line: 12,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: string;
declare const foo:
  | {
      [k: string]:
        | { baz: { buzz: number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.[bar].baz?.buzz;
          `,
        },
        {
          code: noFormat`
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo && foo[bar.
baz] && foo[bar.
baz].
buzz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 5,
              endLine: 10,
              line: 7,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const bar: { baz: string };
declare const foo:
  | { [k: string]: { buzz: number } | null | undefined }
  | null
  | undefined;
foo?.[bar.
baz]?.buzz;
          `,
        },
        {
          code: noFormat`
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 17,
              line: 11,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz.
buzz && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 22,
              line: 13,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | {
      bar:
        | {
            baz: { buzz: (() => number) | null | undefined } | null | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.
bar && foo.
bar.
baz && foo.
bar.
baz.
buzz && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 17,
              line: 8,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: {
  bar:
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 10,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | { bar: { baz: { buzz: () => number } } | null | undefined }
  | null
  | undefined;
foo?.bar?.baz.buzz();
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.
bar && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 7,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: { baz: { buzz: () => number } } | null | undefined };
foo.bar?.baz.buzz();
          `,
        },
        {
          code: noFormat`
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz.
buzz && foo.
bar.
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 18,
              line: 11,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | {
      bar:
        | { baz: { buzz: (() => number) | null | undefined } }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.
bar &&
  foo.
bar() &&
  foo.
bar().
baz &&
  foo.
bar().
baz.
buzz &&
  foo.
bar().
baz.
buzz();
          `,
          errors: [
            {
              column: 1,
              endColumn: 7,
              endLine: 22,
              line: 8,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: {
  bar: () =>
    | { baz: { buzz: (() => number) | null | undefined } | null | undefined }
    | null
    | undefined;
};
foo.bar?.()?.baz?.buzz?.();
          `,
        },
        {
          code: noFormat`
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz[buzz]();
          `,
          errors: [
            {
              column: 1,
              endColumn: 12,
              endLine: 17,
              line: 12,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | { baz: { [k: string]: () => number } | null | undefined }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]();
          `,
        },
        {
          code: noFormat`
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo.
bar && foo.
bar.
baz && foo.
bar.
baz[buzz] && foo.
bar.
baz[buzz]();
          `,
          errors: [
            {
              column: 1,
              endColumn: 12,
              endLine: 24,
              line: 17,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.();
          `,
        },
        {
          code: noFormat`
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo && foo?.
bar && foo?.
bar.
baz && foo?.
bar.
baz[buzz] && foo?.
bar.
baz[buzz]();
          `,
          errors: [
            {
              column: 1,
              endColumn: 12,
              endLine: 24,
              line: 17,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const buzz: string;
declare const foo:
  | {
      bar:
        | {
            baz:
              | { [k: string]: (() => number) | null | undefined }
              | null
              | undefined;
          }
        | null
        | undefined;
    }
  | null
  | undefined;
foo?.bar?.baz?.[buzz]?.();
          `,
        },
        {
          code: noFormat`
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo && foo?.
bar.
baz && foo?.
bar.
baz[buzz];
          `,
          errors: [
            {
              column: 1,
              endColumn: 10,
              endLine: 11,
              line: 7,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const buzz: string;
declare const foo:
  | { bar: { baz: { [k: string]: number } | null | undefined } }
  | null
  | undefined;
foo?.bar.baz?.[buzz];
          `,
        },
        {
          code: noFormat`
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo && foo?.
() && foo?.
().
bar;
          `,
          errors: [
            {
              column: 1,
              endColumn: 4,
              endLine: 9,
              line: 6,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo:
  | (() => { bar: number } | null | undefined)
  | null
  | undefined;
foo?.()?.bar;
          `,
        },
        {
          code: noFormat`
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.
bar && foo.
bar?.
() && foo.
bar?.
().
baz;
          `,
          errors: [
            {
              column: 1,
              endColumn: 4,
              endLine: 9,
              line: 3,
              messageId: 'preferOptionalChain',
              suggestions: null,
            },
          ],
          output: `
declare const foo: { bar: () => { baz: number } | null | undefined };
foo.bar?.()?.baz;
          `,
        },
      ],
    });
  });
});
