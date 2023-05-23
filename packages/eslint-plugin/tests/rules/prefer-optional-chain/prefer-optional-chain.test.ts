import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../../src/rules/prefer-optional-chain';
import { getFixturesRootDir } from '../../RuleTester';
import { BaseCases, identity } from './base-cases';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: getFixturesRootDir(),
  },
});

describe('|| {}', () => {
  ruleTester.run('prefer-optional-chain', rule, {
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
    ],
    invalid: [
      {
        code: '(foo || {}).bar;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 16,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: 'foo?.bar;',
              },
            ],
          },
        ],
      },
      {
        code: noFormat`(foo || ({})).bar;`,
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 18,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: 'foo?.bar;',
              },
            ],
          },
        ],
      },
      {
        code: noFormat`(await foo || {}).bar;`,
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 22,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 24,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 28,
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
            messageId: 'preferOptionalChain',
            column: 13,
            endColumn: 28,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 21,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: 'foo.bar?.[baz];',
              },
            ],
          },
        ],
      },
      {
        code: '((foo1 || {}).foo2 || {}).foo3;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 31,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: '(foo1 || {}).foo2?.foo3;',
              },
            ],
          },
          {
            messageId: 'preferOptionalChain',
            column: 2,
            endColumn: 19,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 25,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 34,
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
            messageId: 'preferOptionalChain',
            column: 13,
            endColumn: 28,
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
            messageId: 'preferOptionalChain',
            column: 15,
            endColumn: 30,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 29,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 16,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: 'foo?.bar;',
              },
            ],
          },
        ],
      },
      {
        code: noFormat`(foo ?? ({})).bar;`,
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 18,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: 'foo?.bar;',
              },
            ],
          },
        ],
      },
      {
        code: noFormat`(await foo ?? {}).bar;`,
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 22,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 24,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 28,
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
            messageId: 'preferOptionalChain',
            column: 13,
            endColumn: 28,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 21,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: 'foo.bar?.[baz];',
              },
            ],
          },
        ],
      },
      {
        code: '((foo1 ?? {}).foo2 ?? {}).foo3;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 31,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: '(foo1 ?? {}).foo2?.foo3;',
              },
            ],
          },
          {
            messageId: 'preferOptionalChain',
            column: 2,
            endColumn: 19,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 25,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 34,
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
            messageId: 'preferOptionalChain',
            column: 12,
            endColumn: 27,
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
            messageId: 'preferOptionalChain',
            column: 5,
            endColumn: 20,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 29,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 18,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: '(a > b)?.bar;',
              },
            ],
          },
        ],
      },
      {
        code: noFormat`(((typeof x) as string) || {}).bar;`,
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 35,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 23,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 24,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 33,
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
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 21,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: '(a << b)?.bar;',
              },
            ],
          },
        ],
      },
      {
        code: noFormat`((foo ** 2) || {}).bar;`,
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 23,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: '(foo ** 2)?.bar;',
              },
            ],
          },
        ],
      },
      {
        code: '(foo ** 2 || {}).bar;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 21,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: '(foo ** 2)?.bar;',
              },
            ],
          },
        ],
      },
      {
        code: '(foo++ || {}).bar;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 18,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: '(foo++)?.bar;',
              },
            ],
          },
        ],
      },
      {
        code: '(+foo || {}).bar;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            column: 1,
            endColumn: 17,
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: '(+foo)?.bar;',
              },
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
              {
                messageId: 'optionalChainSuggest',
                output: 'this?.foo;',
              },
            ],
          },
        ],
      },
    ],
  });
});

describe('hand-crafted cases', () => {
  ruleTester.run('prefer-optional-chain', rule, {
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
      {
        code: '<div /> && (<div />).wtf;',
        parserOptions: { ecmaFeatures: { jsx: true } },
        filename: 'react.tsx',
      },
      {
        code: '<></> && (<></>).wtf;',
        parserOptions: { ecmaFeatures: { jsx: true } },
        filename: 'react.tsx',
      },
      'foo[x++] && foo[x++].bar;',
      'foo[yield x] && foo[yield x].bar;',
      'a = b && (a = b).wtf;',
      // TODO - should we handle this?
      '(x || y) != null && (x || y).foo;',
      // TODO - should we handle this?
      '(await foo) && (await foo).bar;',
      {
        code: `
          declare const x: string;
          x && x.length;
        `,
        options: [
          {
            requireNullish: true,
          },
        ],
      },
      {
        code: `
          declare const x: string | number | boolean | object;
          x && x.toString();
        `,
        options: [
          {
            requireNullish: true,
          },
        ],
      },
      {
        code: `
          declare const x: any;
          x && x.length;
        `,
        options: [
          {
            checkAny: false,
          },
        ],
      },
      {
        code: `
          declare const x: bigint;
          x && x.length;
        `,
        options: [
          {
            checkBigInt: false,
          },
        ],
      },
      {
        code: `
          declare const x: boolean;
          x && x.length;
        `,
        options: [
          {
            checkBoolean: false,
          },
        ],
      },
      {
        code: `
          declare const x: number;
          x && x.length;
        `,
        options: [
          {
            checkNumber: false,
          },
        ],
      },
      {
        code: `
          declare const x: string;
          x && x.length;
        `,
        options: [
          {
            checkString: false,
          },
        ],
      },
      {
        code: `
          declare const x: unknown;
          x && x.length;
        `,
        options: [
          {
            checkUnknown: false,
          },
        ],
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
    ],
    invalid: [
      // two  errors
      {
        code: noFormat`foo && foo.bar && foo.bar.baz || baz && baz.bar && baz.bar.foo`,
        output: 'foo?.bar?.baz || baz?.bar?.foo',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // case with inconsistent checks should "break" the chain
      {
        code: 'foo && foo.bar != null && foo.bar.baz !== undefined && foo.bar.baz.buzz;',
        output:
          'foo?.bar != null && foo.bar.baz !== undefined && foo.bar.baz.buzz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
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
        output: `
          foo.bar?.baz != null &&
            foo.bar.baz.qux !== undefined &&
            foo.bar.baz.qux.buzz;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // ensure essential whitespace isn't removed
      {
        code: 'foo && foo.bar(baz => <This Requires Spaces />);',
        output: 'foo?.bar(baz => <This Requires Spaces />);',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
        filename: 'react.tsx',
      },
      {
        code: 'foo && foo.bar(baz => typeof baz);',
        output: 'foo?.bar(baz => typeof baz);',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: "foo && foo['some long string'] && foo['some long string'].baz;",
        output: "foo?.['some long string']?.baz;",
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo && foo[`some long string`] && foo[`some long string`].baz;',
        output: 'foo?.[`some long string`]?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo && foo[`some ${long} string`] && foo[`some ${long} string`].baz;',
        output: 'foo?.[`some ${long} string`]?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // complex computed properties should be handled correctly
      {
        code: 'foo && foo[bar as string] && foo[bar as string].baz;',
        output: 'foo?.[bar as string]?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo && foo[1 + 2] && foo[1 + 2].baz;',
        output: 'foo?.[1 + 2]?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo && foo[typeof bar] && foo[typeof bar].baz;',
        output: 'foo?.[typeof bar]?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo && foo.bar(a) && foo.bar(a, b).baz;',
        output: 'foo?.bar(a) && foo.bar(a, b).baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo() && foo()(bar);',
        output: 'foo()?.(bar);',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // type parameters are considered
      {
        code: 'foo && foo<string>() && foo<string>().bar;',
        output: 'foo?.<string>()?.bar;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo && foo<string>() && foo<string, number>().bar;',
        output: 'foo?.<string>() && foo<string, number>().bar;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // should preserve comments in a call expression
      {
        code: noFormat`
          foo && foo.bar(/* comment */a,
            // comment2
            b, );
        `,
        output: `
          foo?.bar(/* comment */a,
            // comment2
            b, );
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // ensure binary expressions that are the last expression do not get removed
      // these get autofixers because the trailing binary means the type doesn't matter
      {
        code: 'foo && foo.bar != null;',
        output: 'foo?.bar != null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo && foo.bar != undefined;',
        output: 'foo?.bar != undefined;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo && foo.bar != null && baz;',
        output: 'foo?.bar != null && baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // case with this keyword at the start of expression
      {
        code: 'this.bar && this.bar.baz;',
        output: 'this.bar?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // other weird cases
      {
        code: 'foo && foo?.();',
        output: 'foo?.();',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo.bar && foo.bar?.();',
        output: 'foo.bar?.();',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo && foo.bar(baz => <This Requires Spaces />);',
        output: 'foo?.bar(baz => <This Requires Spaces />);',
        errors: [
          {
            messageId: 'preferOptionalChain',
            line: 1,
            column: 1,
            suggestions: null,
          },
        ],
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
        filename: 'react.tsx',
      },
      // case with this keyword at the start of expression
      {
        code: '!this.bar || !this.bar.baz;',
        output: '!this.bar?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: '!a.b || !a.b();',
        output: '!a.b?.();',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: '!foo.bar || !foo.bar.baz;',
        output: '!foo.bar?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: '!foo[bar] || !foo[bar]?.[baz];',
        output: '!foo[bar]?.[baz];',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: '!foo || !foo?.bar.baz;',
        output: '!foo?.bar.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // two  errors
      {
        code: '(!foo || !foo.bar || !foo.bar.baz) && (!baz || !baz.bar || !baz.bar.foo);',
        output: '(!foo?.bar?.baz) && (!baz?.bar?.foo);',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: `
          class Foo {
            constructor() {
              new.target && new.target.length;
            }
          }
        `,
        output: null,
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
      },
      {
        code: 'import.meta && import.meta?.baz;',
        output: 'import.meta?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: '!import.meta || !import.meta?.baz;',
        output: '!import.meta?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'import.meta && import.meta?.() && import.meta?.().baz;',
        output: 'import.meta?.()?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // non-null expressions
      {
        code: '!foo() || !foo().bar;',
        output: '!foo()?.bar;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: '!foo!.bar || !foo!.bar.baz;',
        output: '!foo!.bar?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: '!foo!.bar!.baz || !foo!.bar!.baz!.paz;',
        output: '!foo!.bar!.baz?.paz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: '!foo.bar!.baz || !foo.bar!.baz!.paz;',
        output: '!foo.bar!.baz?.paz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: string } | null;
          foo !== null && foo.bar !== null;
        `,
        output: null,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: string } | null;
          foo?.bar !== null;
        `,
              },
            ],
          },
        ],
      },
      {
        code: 'foo != null && foo.bar != null;',
        output: 'foo?.bar != null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: string | null } | null;
          foo != null && foo.bar !== null;
        `,
        output: null,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: [
              {
                messageId: 'optionalChainSuggest',
                output: `
          declare const foo: { bar: string | null } | null;
          foo?.bar !== null;
        `,
              },
            ],
          },
        ],
      },
      {
        code: `
          declare const foo: { bar: string | null } | null;
          foo !== null && foo.bar != null;
        `,
        output: `
          declare const foo: { bar: string | null } | null;
          foo?.bar != null;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // https://github.com/typescript-eslint/typescript-eslint/issues/6332
      {
        code: 'unrelated != null && foo != null && foo.bar != null;',
        output: 'unrelated != null && foo?.bar != null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'unrelated1 != null && unrelated2 != null && foo != null && foo.bar != null;',
        output: 'unrelated1 != null && unrelated2 != null && foo?.bar != null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // https://github.com/typescript-eslint/typescript-eslint/issues/1461
      {
        code: 'foo1 != null && foo1.bar != null && foo2 != null && foo2.bar != null;',
        output: 'foo1?.bar != null && foo2?.bar != null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo && foo.a && bar && bar.a;',
        output: 'foo?.a && bar?.a;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // randomly placed optional chain tokens are ignored
      {
        code: 'foo.bar.baz != null && foo?.bar?.baz.bam != null;',
        output: 'foo.bar.baz?.bam != null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo?.bar.baz != null && foo.bar?.baz.bam != null;',
        output: 'foo?.bar.baz?.bam != null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo?.bar?.baz != null && foo.bar.baz.bam != null;',
        output: 'foo?.bar?.baz?.bam != null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // randomly placed non-null assertions are retained as long as they're in an earlier operand
      {
        code: 'foo.bar.baz != null && foo!.bar!.baz.bam != null;',
        output: 'foo.bar.baz?.bam != null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo!.bar.baz != null && foo.bar!.baz.bam != null;',
        output: 'foo!.bar.baz?.bam != null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: 'foo!.bar!.baz != null && foo.bar.baz.bam != null;',
        output: 'foo!.bar!.baz?.bam != null;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
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
        output: `
          a?.b?.c?.d?.e?.f?.g?.h;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
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
        output: `
          !a?.b?.c?.d?.e?.f?.g?.h;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
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
        output: `
          !a?.b?.c?.d?.e?.f?.g?.h;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // yoda checks are flagged
      {
        code: 'undefined !== foo && null !== foo && null != foo.bar && foo.bar.baz;',
        output: 'foo?.bar?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: `
          null != foo &&
            'undefined' !== typeof foo.bar &&
            null !== foo.bar &&
            foo.bar.baz;
        `,
        output: `
          foo?.bar?.baz;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: `
          null != foo &&
            'undefined' !== typeof foo.bar &&
            null !== foo.bar &&
            null != foo.bar.baz;
        `,
        output: `
          null != foo?.bar?.baz;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
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
      },
      {
        code: `
          foo != null &&
            typeof foo.bar !== 'undefined' &&
            foo.bar !== null &&
            foo.bar.baz !== null &&
            foo.bar.baz !== undefined;
        `,
        output: null,
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
      },
      {
        code: `
          null != foo &&
            'undefined' !== typeof foo.bar &&
            null !== foo.bar &&
            undefined !== foo.bar.baz &&
            null !== foo.bar.baz;
        `,
        output: `
          undefined !== foo?.bar?.baz &&
            null !== foo.bar.baz;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      {
        code: `
          foo != null &&
            typeof foo.bar !== 'undefined' &&
            foo.bar !== null &&
            foo.bar.baz !== undefined &&
            foo.bar.baz !== null;
        `,
        output: `
          foo?.bar?.baz !== undefined &&
            foo.bar.baz !== null;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
      // await
      {
        code: '(await foo).bar && (await foo).bar.baz;',
        output: '(await foo).bar?.baz;',
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
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
        output: `
          a?.b?.c?.d?.e?.f?.g == null ||
            a.b.c.d.e.f.g.h;
        `,
        errors: [
          {
            messageId: 'preferOptionalChain',
            suggestions: null,
          },
        ],
      },
    ],
  });
});

describe('base cases', () => {
  describe('and', () => {
    ruleTester.run('prefer-optional-chain', rule, {
      valid: [],
      invalid: [
        ...BaseCases('&&'),
        // it should ignore parts of the expression that aren't part of the expression chain
        ...BaseCases('&&', c => `${c} && bing`),
        ...BaseCases('&&', c => `${c} && bing.bong`),
      ],
    });

    describe('strict nullish equality checks', () => {
      describe('!== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          valid: [],
          invalid: BaseCases(
            '&&',
            c => c.replace(/&&/g, '!== null &&'),
            identity,
          ),
        });
      });

      describe('!= null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          valid: [],
          invalid: BaseCases(
            '&&',
            c => c.replace(/&&/g, '!= null &&'),
            identity,
          ),
        });
      });

      describe('!== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          valid: [],
          invalid: BaseCases(
            '&&',
            c => c.replace(/&&/g, '!== undefined &&'),
            identity,
          ),
        });
      });

      describe('!= undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          valid: [],
          invalid: BaseCases(
            '&&',
            c => c.replace(/&&/g, '!= undefined &&'),
            identity,
          ),
        });
      });
    });
  });

  describe('or', () => {
    ruleTester.run('prefer-optional-chain', rule, {
      valid: [],
      invalid: BaseCases('||', identity, c => `!${c}`),
    });

    describe('strict nullish equality checks', () => {
      describe('=== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          valid: [],
          invalid: BaseCases(
            '||',
            c => c.replace(/\|\|/g, '=== null ||'),
            identity,
          ),
        });
      });

      describe('== null', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          valid: [],
          invalid: BaseCases(
            '||',
            c => c.replace(/\|\|/g, '== null ||'),
            identity,
          ),
        });
      });

      describe('=== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          valid: [],
          invalid: BaseCases(
            '||',
            c => c.replace(/\|\|/g, '=== undefined ||'),
            identity,
          ),
        });
      });

      describe('== undefined', () => {
        ruleTester.run('prefer-optional-chain', rule, {
          valid: [],
          invalid: BaseCases(
            '||',
            c => c.replace(/\|\|/g, '== undefined ||'),
            identity,
          ),
        });
      });
    });
  });

  describe('should ignore spacing sanity checks', () => {
    ruleTester.run('prefer-optional-chain', rule, {
      valid: [],
      invalid: [
        // it should ignore whitespace in the expressions
        ...BaseCases(
          '&&',
          c => c.replace(/\./g, '.      '),
          // note - the rule will use raw text for computed expressions - so we
          //        need to ensure that the spacing for the computed member
          //        expressions is retained for correct fixer matching
          c => c.replace(/(\[.+\])/g, m => m.replace(/\./g, '.      ')),
        ),
        ...BaseCases(
          '&&',
          c => c.replace(/\./g, '.\n'),
          c => c.replace(/(\[.+\])/g, m => m.replace(/\./g, '.\n')),
        ),
      ],
    });
  });

  describe('should skip trailing irrelevant operands sanity checks', () => {
    ruleTester.run('prefer-optional-chain', rule, {
      valid: [],
      invalid: [
        // it should ignore parts of the expression that aren't part of the expression chain
        ...BaseCases('&&', c => `${c} && bing`),
        ...BaseCases('&&', c => `${c} && bing.bong`),
      ],
    });
  });
});
