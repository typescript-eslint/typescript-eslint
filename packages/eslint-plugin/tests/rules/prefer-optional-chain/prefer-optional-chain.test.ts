import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { dedupeTestCases } from '../../dedupeTestCases';
import { createRuleTesterWithTypes } from '../../RuleTester';
import { BaseCases, identity } from './base-cases';

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
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == 0;`,
      },
      {
        code: 'foo && foo.bar == 1;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == 1;`,
      },
      {
        code: "foo && foo.bar == '123';",
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == '123';`,
      },
      {
        code: 'foo && foo.bar == {};',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == {};`,
      },
      {
        code: 'foo && foo.bar == false;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == false;`,
      },
      {
        code: 'foo && foo.bar == true;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == true;`,
      },
      {
        code: 'foo && foo.bar === 0;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === 0;`,
      },
      {
        code: 'foo && foo.bar === 1;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === 1;`,
      },
      {
        code: "foo && foo.bar === '123';",
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === '123';`,
      },
      {
        code: 'foo && foo.bar === {};',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === {};`,
      },
      {
        code: 'foo && foo.bar === false;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === false;`,
      },
      {
        code: 'foo && foo.bar === true;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === true;`,
      },
      {
        code: 'foo && foo.bar === null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === null;`,
      },
      {
        code: 'foo && foo.bar !== undefined;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== undefined;`,
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
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == 0;`,
      },
      {
        code: 'foo != null && foo.bar == 1;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == 1;`,
      },
      {
        code: "foo != null && foo.bar == '123';",
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == '123';`,
      },
      {
        code: 'foo != null && foo.bar == {};',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == {};`,
      },
      {
        code: 'foo != null && foo.bar == false;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == false;`,
      },
      {
        code: 'foo != null && foo.bar == true;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar == true;`,
      },
      {
        code: 'foo != null && foo.bar === 0;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === 0;`,
      },
      {
        code: 'foo != null && foo.bar === 1;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === 1;`,
      },
      {
        code: "foo != null && foo.bar === '123';",
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === '123';`,
      },
      {
        code: 'foo != null && foo.bar === {};',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === {};`,
      },
      {
        code: 'foo != null && foo.bar === false;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === false;`,
      },
      {
        code: 'foo != null && foo.bar === true;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === true;`,
      },
      {
        code: 'foo != null && foo.bar === null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === null;`,
      },
      {
        code: 'foo != null && foo.bar !== undefined;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== undefined;`,
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
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != 0;`,
      },
      {
        code: '!foo || foo.bar != 1;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != 1;`,
      },
      {
        code: "!foo || foo.bar != '123';",
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != '123';`,
      },
      {
        code: '!foo || foo.bar != {};',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != {};`,
      },
      {
        code: '!foo || foo.bar != false;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != false;`,
      },
      {
        code: '!foo || foo.bar != true;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != true;`,
      },
      {
        code: '!foo || foo.bar === undefined;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === undefined;`,
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
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== 0;`,
      },
      {
        code: '!foo || foo.bar !== 1;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== 1;`,
      },
      {
        code: "!foo || foo.bar !== '123';",
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== '123';`,
      },
      {
        code: '!foo || foo.bar !== {};',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== {};`,
      },
      {
        code: '!foo || foo.bar !== false;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== false;`,
      },
      {
        code: '!foo || foo.bar !== true;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== true;`,
      },
      {
        code: '!foo || foo.bar !== null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== null;`,
      },
      {
        code: 'foo == null || foo.bar != 0;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != 0;`,
      },
      {
        code: 'foo == null || foo.bar != 1;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != 1;`,
      },
      {
        code: "foo == null || foo.bar != '123';",
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != '123';`,
      },
      {
        code: 'foo == null || foo.bar != {};',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != {};`,
      },
      {
        code: 'foo == null || foo.bar != false;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != false;`,
      },
      {
        code: 'foo == null || foo.bar != true;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar != true;`,
      },
      {
        code: 'foo == null || foo.bar === undefined;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar === undefined;`,
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
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== 0;`,
      },
      {
        code: 'foo == null || foo.bar !== 1;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== 1;`,
      },
      {
        code: "foo == null || foo.bar !== '123';",
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== '123';`,
      },
      {
        code: 'foo == null || foo.bar !== {};',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== {};`,
      },
      {
        code: 'foo == null || foo.bar !== false;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== false;`,
      },
      {
        code: 'foo == null || foo.bar !== true;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== true;`,
      },
      {
        code: 'foo == null || foo.bar !== null;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `foo?.bar !== null;`,
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
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== 0;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== 1;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== 1;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== '123';
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== '123';
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== {};
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== {};
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== false;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== false;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== true;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== true;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar !== null;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== null;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != 0;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar != 0;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != 1;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar != 1;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != '123';
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar != '123';
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != {};
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar != {};
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != false;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar != false;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          !foo || foo.bar != true;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar != true;
        `,
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
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== 0;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== 1;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== 1;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== '123';
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== '123';
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== {};
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== {};
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== false;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== false;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== true;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== true;
        `,
      },
      {
        code: `
          declare const foo: { bar: number };
          foo == null || foo.bar !== null;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const foo: { bar: number };
          foo?.bar !== null;
        `,
      },
      // yoda case
      {
        code: "foo != null && null != foo.bar && '123' == foo.bar.baz;",
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `'123' == foo?.bar?.baz;`,
      },
      {
        code: "foo != null && null != foo.bar && '123' === foo.bar.baz;",
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `'123' === foo?.bar?.baz;`,
      },
      {
        code: 'foo != null && null != foo.bar && undefined !== foo.bar.baz;',
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `undefined !== foo?.bar?.baz;`,
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a != null && a.b === foo.three;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a?.b === foo.three;
        `,
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a != null && a.b() === foo.three;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a?.b() === foo.three;
        `,
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a != null && a.b == foo.three;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a?.b == foo.three;
        `,
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a != null && a.b() == foo.three;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a?.b() == foo.three;
        `,
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a != null && a.b !== foo.three;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a?.b !== foo.three;
        `,
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a != null && a.b() != foo.three;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a?.b() != foo.three;
        `,
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a === null || a.b !== foo.three;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a?.b !== foo.three;
        `,
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a === null || a.b() != foo.three;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a?.b() != foo.three;
        `,
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a === null || a.b == foo.three;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a?.b == foo.three;
        `,
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a === null || a.b() === foo.three;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a?.b() === foo.three;
        `,
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a != null && foo.three === a.b;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          foo.three === a?.b;
        `,
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a != null && foo.three === a.b();
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          foo.three === a?.b();
        `,
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a != null && foo.three == a.b;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          foo.three == a?.b;
        `,
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a != null && foo.three == a.b();
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          foo.three == a?.b();
        `,
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a != null && foo.three !== a.b;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          foo.three !== a?.b;
        `,
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a != null && foo.three != a.b();
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          foo.three != a?.b();
        `,
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          a == null || foo.three !== a.b;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: number } | null;
          declare const foo: { three: 3 };
          foo.three !== a?.b;
        `,
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          a == null || foo.three != a.b();
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: 3 };
          foo.three != a?.b();
        `,
      },
      {
        code: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          a == null || foo.three == a.b;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: number } | null;
          declare const foo: { three: undefined };
          foo.three == a?.b;
        `,
      },
      {
        code: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          a == null || foo.three === a.b();
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          declare const a: { b: () => number } | null;
          declare const foo: { three: undefined };
          foo.three === a?.b();
        `,
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
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: 'foo?.bar?.baz !== undefined && foo.bar.baz.buzz;',
      },
      {
        code: `
          foo.bar &&
            foo.bar.baz != null &&
            foo.bar.baz.qux !== undefined &&
            foo.bar.baz.qux.buzz;
        `,
        errors: [{ messageId: 'preferOptionalChain', suggestions: null }],
        output: `
          foo.bar?.baz?.qux !== undefined &&
            foo.bar.baz.qux.buzz;
        `,
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
      noFormat`foo[yield x] && foo[yield x].bar;`,
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
          ...BaseCases({ operator: '&&' }),
          // it should ignore parts of the expression that aren't part of the expression chain
          ...BaseCases({
            mutateCode: c => c.replace(/;$/, ' && bing;'),
            operator: '&&',
          }),
          ...BaseCases({
            mutateCode: c => c.replace(/;$/, ' && bing.bong;'),
            operator: '&&',
          }),
        ],
        valid: [],
      });
    });

    describe('strict nullish equality checks', () => {
      describe('!== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          // with the `| null | undefined` type - `!== null` doesn't cover the
          // `undefined` case - so optional chaining is not a valid conversion
          valid: BaseCases({
            mutateCode: c => c.replaceAll('&&', '!== null &&'),
            mutateOutput: identity,
            operator: '&&',
          }),
          // but if the type is just `| null` - then it covers the cases and is
          // a valid conversion
          invalid: [
            ...BaseCases({
              mutateCode: c => c.replaceAll('&&', '!== null &&'),
              mutateDeclaration: c => c.replaceAll('| undefined', ''),
              mutateOutput: identity,
              operator: '&&',
              useSuggestionFixer: true,
            }),
          ],
        });
      });

      describe('!= null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          invalid: BaseCases({
            mutateCode: c => c.replaceAll('&&', '!= null &&'),
            mutateOutput: identity,
            operator: '&&',
            useSuggestionFixer: true,
          }),
          valid: [],
        });
      });

      describe('!== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          // with the `| null | undefined` type - `!== undefined` doesn't cover the
          // `null` case - so optional chaining is not a valid conversion
          valid: BaseCases({
            mutateCode: c => c.replaceAll('&&', '!== undefined &&'),
            mutateOutput: identity,
            operator: '&&',
            skipIds: [20, 26],
          }),
          // but if the type is just `| undefined` - then it covers the cases and is
          // a valid conversion
          invalid: [
            ...BaseCases({
              mutateCode: c => c.replaceAll('&&', '!== undefined &&'),
              mutateDeclaration: c => c.replaceAll('| null', ''),
              mutateOutput: identity,
              operator: '&&',
              useSuggestionFixer: true,
            }),
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
              errors: [{ messageId: 'preferOptionalChain' }],
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
            {
              code: `
                declare const foo: { bar: () => { baz: number } | null | undefined };
                foo.bar !== undefined && foo.bar?.() !== undefined && foo.bar?.().baz;
              `,
              errors: [{ messageId: 'preferOptionalChain' }],
              output: `
                declare const foo: { bar: () => { baz: number } | null | undefined };
                foo.bar?.() !== undefined && foo.bar?.().baz;
              `,
            },
          ],
        });
      });

      describe('!= undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          invalid: BaseCases({
            mutateCode: c => c.replaceAll('&&', '!= undefined &&'),
            mutateOutput: identity,
            operator: '&&',
            useSuggestionFixer: true,
          }),
          valid: [],
        });
      });
    });
  });

  describe('or', () => {
    describe('boolean', () => {
      ruleTester.run('prefer-optional-chain', rule, {
        invalid: BaseCases({
          mutateCode: c => `!${c.replaceAll('||', '|| !')}`,
          mutateOutput: c => `!${c}`,
          operator: '||',
        }),
        valid: [],
      });
    });

    describe('strict nullish equality checks', () => {
      describe('=== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          // with the `| null | undefined` type - `=== null` doesn't cover the
          // `undefined` case - so optional chaining is not a valid conversion
          valid: BaseCases({
            mutateCode: c => c.replaceAll('||', '=== null ||'),
            mutateOutput: identity,
            operator: '||',
          }),
          // but if the type is just `| null` - then it covers the cases and is
          // a valid conversion
          invalid: [
            ...BaseCases({
              mutateCode: c =>
                c
                  .replaceAll('||', '=== null ||')
                  // SEE TODO AT THE BOTTOM OF THE RULE
                  // We need to ensure the final operand is also a "valid" `||` check
                  .replace(/;$/, ' === null;'),
              mutateDeclaration: c => c.replaceAll('| undefined', ''),
              mutateOutput: c => c.replace(/;$/, ' === null;'),
              operator: '||',
              useSuggestionFixer: true,
            }),
          ],
        });
      });

      describe('== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          invalid: BaseCases({
            mutateCode: c =>
              c
                .replaceAll('||', '== null ||')
                // SEE TODO AT THE BOTTOM OF THE RULE
                // We need to ensure the final operand is also a "valid" `||` check
                .replace(/;$/, ' == null;'),
            mutateOutput: c => c.replace(/;$/, ' == null;'),
            operator: '||',
          }),
          valid: [],
        });
      });

      describe('=== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          // with the `| null | undefined` type - `=== undefined` doesn't cover the
          // `null` case - so optional chaining is not a valid conversion
          valid: BaseCases({
            mutateCode: c => c.replaceAll('||', '=== undefined ||'),
            mutateOutput: identity,
            operator: '||',
            skipIds: [20, 26],
          }),
          // but if the type is just `| undefined` - then it covers the cases and is
          // a valid conversion
          invalid: [
            ...BaseCases({
              mutateCode: c =>
                c
                  .replaceAll('||', '=== undefined ||')
                  // SEE TODO AT THE BOTTOM OF THE RULE
                  // We need to ensure the final operand is also a "valid" `||` check
                  .replace(/;$/, ' === undefined;'),
              mutateDeclaration: c => c.replaceAll('| null', ''),
              mutateOutput: c => c.replace(/;$/, ' === undefined;'),
              operator: '||',
            }),
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
              errors: [{ messageId: 'preferOptionalChain' }],
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
            {
              code: `
                declare const foo: { bar: () => { baz: number } | null | undefined };
                foo.bar === undefined || foo.bar?.() === undefined || foo.bar?.().baz;
              `,
              errors: [{ messageId: 'preferOptionalChain' }],
              output: `
                declare const foo: { bar: () => { baz: number } | null | undefined };
                foo.bar?.() === undefined || foo.bar?.().baz;
              `,
            },
          ],
        });
      });

      describe('== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          invalid: BaseCases({
            mutateCode: c =>
              c
                .replaceAll('||', '== undefined ||')
                // SEE TODO AT THE BOTTOM OF THE RULE
                // We need to ensure the final operand is also a "valid" `||` check
                .replace(/;$/, ' == undefined;'),
            mutateOutput: c => c.replace(/;$/, ' == undefined;'),
            operator: '||',
          }),
          valid: [],
        });
      });
    });
  });

  describe('should ignore spacing sanity checks', () => {
    ruleTester.run('prefer-optional-chain', rule, {
      valid: [],
      // One base case does not match the mutator, so we have to dedupe it
      invalid: dedupeTestCases(
        // it should ignore whitespace in the expressions
        BaseCases({
          mutateCode: c => c.replaceAll('.', '.      '),
          operator: '&&',
          // note - the rule will use raw text for computed expressions - so we
          //        need to ensure that the spacing for the computed member
          //        expressions is retained for correct fixer matching
          mutateOutput: c =>
            c.replaceAll(/(\[.+])/g, m => m.replaceAll('.', '.      ')),
        }),
        BaseCases({
          mutateCode: c => c.replaceAll('.', '.\n'),
          mutateOutput: c =>
            c.replaceAll(/(\[.+])/g, m => m.replaceAll('.', '.\n')),
          operator: '&&',
        }),
      ),
    });
  });
});
