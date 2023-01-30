import rule from '../../../src/rules/prefer-optional-chain';
import { noFormat, RuleTester } from '../../RuleTester';
import * as BaseCases from './base-cases';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

ruleTester.run('prefer-optional-chain', rule, {
  valid: [
    '!a || !b;',
    '!a || a.b;',
    '!a && a.b;',
    '!a && !a.b;',
    '!a.b || a.b?.();',
    '!a.b || a.b();',
    '!foo() || !foo().bar;',

    'foo || {};',
    'foo || ({} as any);',
    '(foo || {})?.bar;',
    '(foo || { bar: 1 }).bar;',
    '(undefined && (foo || {})).bar;',
    'foo ||= bar;',
    'foo ||= bar || {};',
    'foo ||= bar?.baz;',
    'foo ||= bar?.baz || {};',
    'foo ||= bar?.baz?.buzz;',
    '(foo1 ? foo2 : foo3 || {}).foo4;',
    '(foo = 2 || {}).bar;',
    'func(foo || {}).bar;',
    'foo ?? {};',
    '(foo ?? {})?.bar;',
    'foo ||= bar ?? {};',
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
    // currently do not handle complex computed properties
    'foo && foo[bar as string] && foo[bar as string].baz;',
    'foo && foo[1 + 2] && foo[1 + 2].baz;',
    'foo && foo[typeof bar] && foo[typeof bar].baz;',
    '!foo[1 + 1] || !foo[1 + 2];',
    '!foo[1 + 1] || !foo[1 + 1].foo;',
    '!foo || !foo[bar as string] || !foo[bar as string].baz;',
    '!foo || !foo[1 + 2] || !foo[1 + 2].baz;',
    '!foo || !foo[typeof bar] || !foo[typeof bar].baz;',
    // currently do not handle 'this' as the first part of a chain
    'this && this.foo;',
    '!this || !this.foo;',
    // intentionally do not handle mixed TSNonNullExpression in properties
    '!entity.__helper!.__initialized || options.refresh;',
    '!foo!.bar || !foo!.bar.baz;',
    '!foo!.bar!.baz || !foo!.bar!.baz!.paz;',
    '!foo.bar!.baz || !foo.bar!.baz!.paz;',
    'import.meta || true;',
    'import.meta || import.meta.foo;',
    '!import.meta && false;',
    '!import.meta && !import.meta.foo;',
    'new.target || new.target.length;',
    '!new.target || true;',
    // Do not handle direct optional chaining on private properties because of a typescript bug (https://github.com/microsoft/TypeScript/issues/42734)
    // We still allow in computed properties
    'foo && foo.#bar;',
    '!foo || !foo.#bar;',
  ],
  invalid: [
    ...BaseCases.all(),
    // it should ignore whitespace in the expressions
    ...BaseCases.all().map(c => ({
      ...c,
      code: c.code.replace(/\./g, '.      '),
    })),
    ...BaseCases.all().map(c => ({
      ...c,
      code: c.code.replace(/\./g, '.\n'),
    })),
    // it should ignore parts of the expression that aren't part of the expression chain
    ...BaseCases.all().map(c => ({
      ...c,
      code: `${c.code} && bing`,
      errors: [
        {
          ...c.errors[0],
          suggestions: [
            {
              ...c.errors[0].suggestions![0],
              output: `${c.errors[0].suggestions![0].output} && bing`,
            },
          ],
        },
      ],
    })),
    ...BaseCases.all().map(c => ({
      ...c,
      code: `${c.code} && bing.bong`,
      errors: [
        {
          ...c.errors[0],
          suggestions: [
            {
              ...c.errors[0].suggestions![0],
              output: `${c.errors[0].suggestions![0].output} && bing.bong`,
            },
          ],
        },
      ],
    })),
    // strict nullish equality checks x !== null && x.y !== null
    ...BaseCases.all().map(c => ({
      ...c,
      code: c.code.replace(/&&/g, '!== null &&'),
    })),
    ...BaseCases.all().map(c => ({
      ...c,
      code: c.code.replace(/&&/g, '!= null &&'),
    })),
    ...BaseCases.all().map(c => ({
      ...c,
      code: c.code.replace(/&&/g, '!== undefined &&'),
    })),
    ...BaseCases.all().map(c => ({
      ...c,
      code: c.code.replace(/&&/g, '!= undefined &&'),
    })),

    // replace && with ||: foo && foo.bar -> !foo || !foo.bar
    ...BaseCases.select('canReplaceAndWithOr', true)
      .all()
      .map(c => ({
        ...c,
        code: c.code.replace(/(^|\s)foo/g, '$1!foo').replace(/&&/g, '||'),
        errors: [
          {
            ...c.errors[0],
            suggestions: [
              {
                ...c.errors[0].suggestions![0],
                output: `!${c.errors[0].suggestions![0].output}`,
              },
            ],
          },
        ],
      })),

    // two  errors
    {
      code: noFormat`foo && foo.bar && foo.bar.baz || baz && baz.bar && baz.bar.foo`,
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.bar?.baz || baz && baz.bar && baz.bar.foo`,
            },
          ],
        },
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo && foo.bar && foo.bar.baz || baz?.bar?.foo`,
            },
          ],
        },
      ],
    },
    // case with inconsistent checks
    {
      code: 'foo && foo.bar != null && foo.bar.baz !== undefined && foo.bar.baz.buzz;',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar?.baz?.buzz;',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`foo.bar && foo.bar.baz != null && foo.bar.baz.qux !== undefined && foo.bar.baz.qux.buzz;`,
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.baz?.qux?.buzz;',
            },
          ],
        },
      ],
    },
    // ensure essential whitespace isn't removed
    {
      code: 'foo && foo.bar(baz => <This Requires Spaces />);',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar(baz => <This Requires Spaces />);',
            },
          ],
        },
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'foo && foo.bar(baz => typeof baz);',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar(baz => typeof baz);',
            },
          ],
        },
      ],
    },
    {
      code: noFormat`foo && foo["some long string"] && foo["some long string"].baz`,
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.["some long string"]?.baz`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`foo && foo[\`some long string\`] && foo[\`some long string\`].baz`,
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `foo?.[\`some long string\`]?.baz`,
            },
          ],
        },
      ],
    },
    {
      code: "foo && foo['some long string'] && foo['some long string'].baz;",
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: "foo?.['some long string']?.baz;",
            },
          ],
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
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
foo?.bar(/* comment */a,
  // comment2
  b, );
      `,
            },
          ],
        },
      ],
    },
    // ensure binary expressions that are the last expression do not get removed
    {
      code: 'foo && foo.bar != null;',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar != null;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar != undefined;',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar != undefined;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar != null && baz;',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar != null && baz;',
            },
          ],
        },
      ],
    },
    // case with this keyword at the start of expression
    {
      code: 'this.bar && this.bar.baz;',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'this.bar?.baz;',
            },
          ],
        },
      ],
    },
    // other weird cases
    {
      code: 'foo && foo?.();',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo.bar && foo.bar?.();',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.();',
            },
          ],
        },
      ],
    },
    // using suggestion instead of autofix
    {
      code: 'foo && foo.bar != null && foo.bar.baz !== undefined && foo.bar.baz.buzz;',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar?.baz?.buzz;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar(baz => <This Requires Spaces />);',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          line: 1,
          column: 1,
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar(baz => <This Requires Spaces />);',
            },
          ],
        },
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: '(foo || {}).bar;',
      errors: [
        {
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
      code: noFormat`if (foo) { (foo || {}).bar; }`,
      errors: [
        {
          messageId: 'optionalChainSuggest',
          column: 12,
          endColumn: 27,
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `if (foo) { foo?.bar; }`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`if ((foo || {}).bar) { foo.bar; }`,
      errors: [
        {
          messageId: 'optionalChainSuggest',
          column: 5,
          endColumn: 20,
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `if (foo?.bar) { foo.bar; }`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(undefined && foo || {}).bar;`,
      errors: [
        {
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
          column: 12,
          endColumn: 27,
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `if (foo) { foo?.bar; }`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`if ((foo ?? {}).bar) { foo.bar; }`,
      errors: [
        {
          messageId: 'optionalChainSuggest',
          column: 5,
          endColumn: 20,
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `if (foo?.bar) { foo.bar; }`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`(undefined && foo ?? {}).bar;`,
      errors: [
        {
          messageId: 'optionalChainSuggest',
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
      code: noFormat`(a > b || {}).bar;`,
      errors: [
        {
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
          column: 1,
          endColumn: 35,
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `((typeof x) as string)?.bar;`,
            },
          ],
        },
      ],
    },
    {
      code: '(void foo() || {}).bar;',
      errors: [
        {
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
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
          messageId: 'optionalChainSuggest',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'this?.foo;',
            },
          ],
        },
      ],
    },
    // case with this keyword at the start of expression
    {
      code: '!this.bar || !this.bar.baz;',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '!this.bar?.baz;',
            },
          ],
        },
      ],
    },
    {
      code: '!a.b || !a.b();',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '!a.b?.();',
            },
          ],
        },
      ],
    },
    {
      code: '!foo.bar || !foo.bar.baz;',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '!foo.bar?.baz;',
            },
          ],
        },
      ],
    },
    {
      code: '!foo[bar] || !foo[bar]?.[baz];',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '!foo[bar]?.[baz];',
            },
          ],
        },
      ],
    },
    {
      code: '!foo || !foo?.bar.baz;',
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '!foo?.bar.baz;',
            },
          ],
        },
      ],
    },
    // two  errors
    {
      code: noFormat`(!foo || !foo.bar || !foo.bar.baz) && (!baz || !baz.bar || !baz.bar.foo);`,
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: noFormat`(!foo?.bar?.baz) && (!baz || !baz.bar || !baz.bar.foo);`,
            },
          ],
        },
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: noFormat`(!foo || !foo.bar || !foo.bar.baz) && (!baz?.bar?.foo);`,
            },
          ],
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
      code: noFormat`import.meta && import.meta?.baz;`,
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: noFormat`import.meta?.baz;`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`!import.meta || !import.meta?.baz;`,
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: noFormat`!import.meta?.baz;`,
            },
          ],
        },
      ],
    },
    {
      code: noFormat`import.meta && import.meta?.() && import.meta?.().baz;`,
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: noFormat`import.meta?.()?.baz;`,
            },
          ],
        },
      ],
    },
  ],
});
