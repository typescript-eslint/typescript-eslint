import { noFormat } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { createRuleTesterWithTypes } from '../../RuleTester';

const ruleTester = createRuleTesterWithTypes();

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
