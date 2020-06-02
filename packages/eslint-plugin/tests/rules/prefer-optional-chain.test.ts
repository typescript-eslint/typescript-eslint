import rule from '../../src/rules/prefer-optional-chain';
import { RuleTester, noFormat } from '../RuleTester';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../src/util';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
});

const baseCases = [
  // chained members
  {
    code: 'foo && foo.bar',
    output: 'foo?.bar',
  },
  {
    code: 'foo.bar && foo.bar.baz',
    output: 'foo.bar?.baz',
  },
  {
    code: 'foo && foo()',
    output: 'foo?.()',
  },
  {
    code: 'foo.bar && foo.bar()',
    output: 'foo.bar?.()',
  },
  {
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz',
    output: 'foo?.bar?.baz?.buzz',
  },
  {
    code: 'foo.bar && foo.bar.baz && foo.bar.baz.buzz',
    output: 'foo.bar?.baz?.buzz',
  },
  // case with a jump (i.e. a non-nullish prop)
  {
    code: 'foo && foo.bar && foo.bar.baz.buzz',
    output: 'foo?.bar?.baz.buzz',
  },
  {
    code: 'foo.bar && foo.bar.baz.buzz',
    output: 'foo.bar?.baz.buzz',
  },
  // case where for some reason there is a doubled up expression
  {
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz',
    output: 'foo?.bar?.baz?.buzz',
  },
  {
    code: 'foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz',
    output: 'foo.bar?.baz?.buzz',
  },
  // chained members with element access
  {
    code: 'foo && foo[bar] && foo[bar].baz && foo[bar].baz.buzz',
    output: 'foo?.[bar]?.baz?.buzz',
  },
  {
    // case with a jump (i.e. a non-nullish prop)
    code: 'foo && foo[bar].baz && foo[bar].baz.buzz',
    output: 'foo?.[bar].baz?.buzz',
  },
  // chained calls
  {
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz()',
    output: 'foo?.bar?.baz?.buzz()',
  },
  {
    code:
      'foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz()',
    output: 'foo?.bar?.baz?.buzz?.()',
  },
  {
    code: 'foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz()',
    output: 'foo.bar?.baz?.buzz?.()',
  },
  // case with a jump (i.e. a non-nullish prop)
  {
    code: 'foo && foo.bar && foo.bar.baz.buzz()',
    output: 'foo?.bar?.baz.buzz()',
  },
  {
    code: 'foo.bar && foo.bar.baz.buzz()',
    output: 'foo.bar?.baz.buzz()',
  },
  {
    // case with a jump (i.e. a non-nullish prop)
    code: 'foo && foo.bar && foo.bar.baz.buzz && foo.bar.baz.buzz()',
    output: 'foo?.bar?.baz.buzz?.()',
  },
  {
    // case with a call expr inside the chain for some inefficient reason
    code:
      'foo && foo.bar() && foo.bar().baz && foo.bar().baz.buzz && foo.bar().baz.buzz()',
    output: 'foo?.bar()?.baz?.buzz?.()',
  },
  // chained calls with element access
  {
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz]()',
    output: 'foo?.bar?.baz?.[buzz]()',
  },
  {
    code:
      'foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz] && foo.bar.baz[buzz]()',
    output: 'foo?.bar?.baz?.[buzz]?.()',
  },
  // (partially) pre-optional chained
  {
    code:
      'foo && foo?.bar && foo?.bar.baz && foo?.bar.baz[buzz] && foo?.bar.baz[buzz]()',
    output: 'foo?.bar?.baz?.[buzz]?.()',
  },
  {
    code: 'foo && foo?.bar.baz && foo?.bar.baz[buzz]',
    output: 'foo?.bar.baz?.[buzz]',
  },
  {
    code: 'foo && foo?.() && foo?.().bar',
    output: 'foo?.()?.bar',
  },
  {
    code: 'foo.bar && foo.bar?.() && foo.bar?.().baz',
    output: 'foo.bar?.()?.baz',
  },
].map(
  c =>
    ({
      code: c.code.trim(),
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: c.output.trim(),
            },
          ],
        },
      ],
    } as TSESLint.InvalidTestCase<
      InferMessageIdsTypeFromRule<typeof rule>,
      InferOptionsTypeFromRule<typeof rule>
    >),
);

ruleTester.run('prefer-optional-chain', rule, {
  valid: [
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
    // currently do not handle complex computed properties
    'foo && foo[bar as string] && foo[bar as string].baz;',
    'foo && foo[1 + 2] && foo[1 + 2].baz;',
    'foo && foo[typeof bar] && foo[typeof bar].baz;',
  ],
  invalid: [
    ...baseCases,
    // it should ignore whitespace in the expressions
    ...baseCases.map(c => ({
      ...c,
      code: c.code.replace(/\./g, '.      '),
    })),
    ...baseCases.map(c => ({
      ...c,
      code: c.code.replace(/\./g, '.\n'),
    })),
    // it should ignore parts of the expression that aren't part of the expression chain
    ...baseCases.map(c => ({
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
    ...baseCases.map(c => ({
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
    ...baseCases.map(c => ({
      ...c,
      code: c.code.replace(/&&/g, '!== null &&'),
    })),
    ...baseCases.map(c => ({
      ...c,
      code: c.code.replace(/&&/g, '!= null &&'),
    })),
    ...baseCases.map(c => ({
      ...c,
      code: c.code.replace(/&&/g, '!== undefined &&'),
    })),
    ...baseCases.map(c => ({
      ...c,
      code: c.code.replace(/&&/g, '!= undefined &&'),
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
              output: noFormat`foo?.bar?.baz || baz && baz.bar && baz.bar.foo`,
            },
          ],
        },
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: noFormat`foo && foo.bar && foo.bar.baz || baz?.bar?.foo`,
            },
          ],
        },
      ],
    },
    // case with inconsistent checks
    {
      code:
        'foo && foo.bar != null && foo.bar.baz !== undefined && foo.bar.baz.buzz;',
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
              output: noFormat`foo?.["some long string"]?.baz`,
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
              output: noFormat`foo?.[\`some long string\`]?.baz`,
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
      `.trimRight(),
      output: null,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: [
            {
              messageId: 'optionalChainSuggest',
              output: noFormat`
foo?.bar(/* comment */a,
  // comment2
  b, );
              `.trimRight(),
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
      code:
        'foo && foo.bar != null && foo.bar.baz !== undefined && foo.bar.baz.buzz;',
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
  ],
});
