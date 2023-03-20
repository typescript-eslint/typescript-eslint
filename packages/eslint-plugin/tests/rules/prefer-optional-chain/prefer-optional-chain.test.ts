import rule from '../../../src/rules/prefer-optional-chain';
import { getFixturesRootDir, noFormat, RuleTester } from '../../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
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
    'this.#a && this.#b;',
    '!this.#a || !this.#b;',
    'a.#foo?.bar;',
    '!a.#foo?.bar;',
    '!foo().#a || a;',
    '!a.b.#a || a;',
    '!new A().#b || a;',
    '!(await a).#b || a;',
    // Do not handle direct optional chaining on private properties because of a typescript bug (https://github.com/microsoft/TypeScript/issues/42734)
    // We still allow in computed properties
    'foo && foo.#bar;',
    '!foo || !foo.#bar;',
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
    // Don't report if the initial type can be falsy but not undefined
    `
declare const foo: { bar: 1 } | false;
foo != null && foo.bar;
    `,
    `
declare const foo: { bar: 1 } | 0;
foo != null && foo.bar;
    `,
    'foo.bar != null && foo.bar?.() != null && foo.bar?.().baz;',
    'foo !== null && foo.bar;',
    'foo.bar !== null && foo.bar?.() !== null && foo.bar?.().baz;',
    'foo != undefined && foo.bar;',
    'foo.bar != undefined && foo.bar?.() != undefined && foo.bar?.().baz;',
    'foo !== undefined && foo.bar;',
    'foo.bar !== undefined && foo.bar?.() !== undefined && foo.bar?.().baz;',
    `
      declare const a: null;
      a && a.toString();
    `,
    `
      declare const a: bigint | null;
      a && a.toString();
    `,
    `
      declare const a: bigint | undefined;
      a && a.toString();
    `,
    `
      declare const a: number | null;
      a && a.toString();
    `,
    `
      declare const a: number | undefined;
      a && a.toString();
    `,
    `
      declare const a: string | null;
      a && a.toString();
    `,
    `
      declare const a: string | undefined;
      a && a.toString();
    `,
    `
      declare const a: ?(0 | 'abc');
      a && a.length;
    `,
    `
      declare const a: false | 'abc';
      a && a.length;
    `,
    `
      declare const a: '' | 'abc';
      a && a.length;
    `,
    `
      declare const a: { b: false | { c: 'abc' } };
      a.b && a.b.c;
    `,
    `
      declare const a: { b: 0 | { c: 'abc' } };
      a.b && a.b.c;
    `,
  ],
  invalid: [
    {
      code: 'foo && foo.bar;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo?.bar;' },
          ],
        },
      ],
    },
    {
      code: '!foo || !foo.bar;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: '!foo?.bar;' },
          ],
        },
      ],
    },
    {
      code: 'foo.bar && foo.bar.baz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo.bar?.baz;' },
          ],
        },
      ],
    },
    {
      code: 'foo && foo();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo?.();' },
          ],
        },
      ],
    },
    {
      code: 'foo.bar && foo.bar();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo.bar?.();' },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz;',
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
      code: 'foo.bar && foo.bar.baz && foo.bar.baz.buzz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.baz?.buzz;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar && foo.bar.baz.buzz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar?.baz.buzz;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo.bar && foo.bar.baz.buzz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.baz.buzz;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz;',
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
      code: 'foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.baz?.buzz;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo[bar] && foo[bar].baz && foo[bar].baz.buzz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.[bar]?.baz?.buzz;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo[bar].baz && foo[bar].baz.buzz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.[bar].baz?.buzz;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo[bar.baz] && foo[bar.baz].buzz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.[bar.baz]?.buzz;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo[this.bar] && foo[this.bar].baz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo[this.bar]?.baz;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar?.baz?.buzz();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar?.baz?.buzz?.();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.baz?.buzz?.();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar && foo.bar.baz.buzz();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar?.baz.buzz();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo.bar && foo.bar.baz.buzz();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.baz.buzz();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar && foo.bar.baz.buzz && foo.bar.baz.buzz();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar?.baz.buzz?.();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar() && foo.bar().baz && foo.bar().baz.buzz && foo.bar().baz.buzz();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar()?.baz?.buzz?.();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz]();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar?.baz?.[buzz]();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz] && foo.bar.baz[buzz]();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar?.baz?.[buzz]?.();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo?.bar && foo?.bar.baz && foo?.bar.baz[buzz] && foo?.bar.baz[buzz]();',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar?.baz?.[buzz]?.();',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo?.bar.baz && foo?.bar.baz[buzz];',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar.baz?.[buzz];',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo?.() && foo?.().bar;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo?.()?.bar;' },
          ],
        },
      ],
    },
    {
      code: 'foo.bar && foo.bar?.() && foo.bar?.().baz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo.bar?.()?.baz;' },
          ],
        },
      ],
    },
    // it should ignore whitespace in the expressions
    {
      code: noFormat`foo && foo . bar;`,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo?.bar;' },
          ],
        },
      ],
    },
    {
      code: noFormat`foo . bar && foo . bar ?. () && foo . bar ?. ().baz;`,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.()?.baz;',
            },
          ],
        },
      ],
    },
    // it should ignore parts of the expression that aren't part of the expression chain
    {
      code: noFormat`foo && foo.bar && bing;`,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            { messageId: 'optionalChainSuggest', output: 'foo?.bar && bing;' },
          ],
        },
      ],
    },
    {
      code: noFormat`foo.bar && foo.bar?.() && foo.bar?.().baz && bing;`,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.()?.baz && bing;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo && foo.bar && bing.bong;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar && bing.bong;',
            },
          ],
        },
      ],
    },
    {
      code: 'foo.bar && foo.bar?.() && foo.bar?.().baz && bing.bong;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.()?.baz && bing.bong;',
            },
          ],
        },
      ],
    },
    // loose and strict null equality checks: x !== null && x.y !== null
    {
      code: 'foo != null && foo.bar;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar;',
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    {
      code: 'foo.bar != null && foo.bar?.() != null && foo.bar?.().baz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.()?.baz;',
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    {
      code: 'foo !== null && foo.bar;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar;',
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    {
      code: 'foo.bar !== null && foo.bar?.() !== null && foo.bar?.().baz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.()?.baz;',
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    // loose and strict undefined equality checks: x !== undefined && x.y !== undefined
    {
      code: 'foo != undefined && foo.bar;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar;',
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    {
      code: 'foo.bar != undefined && foo.bar?.() != undefined && foo.bar?.().baz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.()?.baz;',
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    {
      code: 'foo !== undefined && foo.bar;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo?.bar;',
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    {
      code: 'foo.bar !== undefined && foo.bar?.() !== undefined && foo.bar?.().baz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: 'foo.bar?.()?.baz;',
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    // other looseFalsiness cases
    {
      code: `
        declare const a: 0 | 'abc';
        a && a.length;
      `,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
        declare const a: 0 | 'abc';
        a?.length;
      `,
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    {
      code: `
        declare const a: false | 'abc';
        a && a.length;
      `,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
        declare const a: false | 'abc';
        a?.length;
      `,
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    {
      code: `
        declare const a: '' | 'abc';
        a && a.length;
      `,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
        declare const a: '' | 'abc';
        a?.length;
      `,
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    {
      code: `
        declare const a: { b: false | { c: 'abc' } };
        a.b && a.b.c;
      `,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
        declare const a: { b: false | { c: 'abc' } };
        a.b?.c;
      `,
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    {
      code: `
        declare const a: { b: 0 | { c: 'abc' } };
        a.b && a.b.c;
      `,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: `
        declare const a: { b: 0 | { c: 'abc' } };
        a.b?.c;
      `,
            },
          ],
        },
      ],
      options: [{ looseFalsiness: true }],
    },
    // two errors
    {
      code: noFormat`foo && foo.bar && foo.bar.baz || baz && baz.bar && baz.bar.foo`,
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
      filename: 'react.tsx',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    {
      code: 'foo && foo.bar(baz => typeof baz);',
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
      filename: 'react.tsx',
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
    {
      code: '!foo || !foo.bar;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '!foo?.bar;',
            },
          ],
        },
      ],
    },
    {
      code: '!foo.bar || !foo.bar?.() || !foo.bar?.().baz;',
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: '!foo.bar?.()?.baz;',
            },
          ],
        },
      ],
    },
    // case with this keyword at the start of expression
    {
      code: '!this.bar || !this.bar.baz;',
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
