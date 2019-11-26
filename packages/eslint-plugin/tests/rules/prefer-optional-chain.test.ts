import rule from '../../src/rules/prefer-optional-chain';
import { RuleTester } from '../RuleTester';
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
    code: 'foo && foo()',
    output: 'foo?.()',
  },
  {
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz',
    output: 'foo?.bar?.baz?.buzz',
  },
  {
    // case with a jump (i.e. a non-nullish prop)
    code: 'foo && foo.bar && foo.bar.baz.buzz',
    output: 'foo?.bar?.baz.buzz',
  },
  {
    // case where for some reason there is a doubled up expression
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz',
    output: 'foo?.bar?.baz?.buzz',
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
    // case with a jump (i.e. a non-nullish prop)
    code: 'foo && foo.bar && foo.bar.baz.buzz()',
    output: 'foo?.bar?.baz.buzz()',
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
  // two-for-one
  {
    code: 'foo && foo.bar && foo.bar.baz || baz && baz.bar && baz.bar.foo',
    output: 'foo?.bar?.baz || baz?.bar?.foo',
    errors: 2,
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
].map(
  c =>
    ({
      code: c.code.trim(),
      output: c.output.trim(),
      errors: Array(c.errors ?? 1).fill({
        messageId: 'preferOptionalChain',
      }),
    } as TSESLint.InvalidTestCase<
      InferMessageIdsTypeFromRule<typeof rule>,
      InferOptionsTypeFromRule<typeof rule>
    >),
);

ruleTester.run('prefer-optional-chain', rule, {
  valid: [
    'foo && bar',
    'foo && foo',
    'foo || bar',
    'foo ?? bar',
    'foo || foo.bar',
    'foo ?? foo.bar',
    "file !== 'index.ts' && file.endsWith('.ts')",
    'nextToken && sourceCode.isSpaceBetweenTokens(prevToken, nextToken)',
    'foo && fooBar.baz',
    // currently do not handle complex computed properties
    'foo && foo[bar as string] && foo[bar as string].baz',
    'foo && foo[1 + 2] && foo[1 + 2].baz',
    'foo && foo[typeof bar] && foo[typeof bar].baz',
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
      output: `${c.output} && bing`,
    })),
    ...baseCases.map(c => ({
      ...c,
      code: `${c.code} && bing.bong`,
      output: `${c.output} && bing.bong`,
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
    {
      // case with inconsistent checks
      code:
        'foo && foo.bar != null && foo.bar.baz !== undefined && foo.bar.baz.buzz',
      output: 'foo?.bar?.baz?.buzz',
      errors: [
        {
          messageId: 'preferOptionalChain',
        },
      ],
    },
    // ensure essential whitespace isn't removed
    {
      code: 'foo && foo.bar(baz => (<This Requires Spaces />));',
      output: 'foo?.bar(baz => (<This Requires Spaces />));',
      errors: [
        {
          messageId: 'preferOptionalChain',
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
      output: 'foo?.bar(baz => typeof baz);',
      errors: [
        {
          messageId: 'preferOptionalChain',
        },
      ],
    },
    {
      code: 'foo && foo["some long string"] && foo["some long string"].baz',
      output: 'foo?.["some long string"]?.baz',
      errors: [
        {
          messageId: 'preferOptionalChain',
        },
      ],
    },
    // should preserve comments in a call expression
    {
      code: `
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
        },
      ],
    },
    // ensure binary expressions that are the last expression do not get removed
    {
      code: 'foo && foo.bar != null',
      output: 'foo?.bar != null',
      errors: [
        {
          messageId: 'preferOptionalChain',
        },
      ],
    },
    {
      code: 'foo && foo.bar != undefined',
      output: 'foo?.bar != undefined',
      errors: [
        {
          messageId: 'preferOptionalChain',
        },
      ],
    },
    {
      code: 'foo && foo.bar != null && baz',
      output: 'foo?.bar != null && baz',
      errors: [
        {
          messageId: 'preferOptionalChain',
        },
      ],
    },
    // other weird cases
    {
      code: 'foo && foo?.()',
      output: 'foo?.()',
      errors: [
        {
          messageId: 'preferOptionalChain',
        },
      ],
    },
  ],
});
