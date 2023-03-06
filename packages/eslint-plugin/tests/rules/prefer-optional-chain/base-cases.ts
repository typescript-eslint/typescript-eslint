import type { TSESLint } from '@typescript-eslint/utils';

import type rule from '../../../src/rules/prefer-optional-chain';
import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../../../src/util';

type InvalidTestCase = TSESLint.InvalidTestCase<
  InferMessageIdsTypeFromRule<typeof rule>,
  InferOptionsTypeFromRule<typeof rule>
>;

interface BaseCase {
  canReplaceAndWithOr: boolean;
  output: string;
  code: string;
}

const mapper = (c: BaseCase): InvalidTestCase => ({
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
});

const baseCases: BaseCase[] = [
  // chained members
  {
    code: 'foo && foo.bar',
    output: 'foo?.bar',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo.bar && foo.bar.baz',
    output: 'foo.bar?.baz',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo && foo()',
    output: 'foo?.()',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo.bar && foo.bar()',
    output: 'foo.bar?.()',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz',
    output: 'foo?.bar?.baz?.buzz',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo.bar && foo.bar.baz && foo.bar.baz.buzz',
    output: 'foo.bar?.baz?.buzz',
    canReplaceAndWithOr: true,
  },
  // case with a jump (i.e. a non-nullish prop)
  {
    code: 'foo && foo.bar && foo.bar.baz.buzz',
    output: 'foo?.bar?.baz.buzz',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo.bar && foo.bar.baz.buzz',
    output: 'foo.bar?.baz.buzz',
    canReplaceAndWithOr: true,
  },
  // case where for some reason there is a doubled up expression
  {
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz',
    output: 'foo?.bar?.baz?.buzz',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo.bar && foo.bar.baz && foo.bar.baz && foo.bar.baz.buzz',
    output: 'foo.bar?.baz?.buzz',
    canReplaceAndWithOr: true,
  },
  // chained members with element access
  {
    code: 'foo && foo[bar] && foo[bar].baz && foo[bar].baz.buzz',
    output: 'foo?.[bar]?.baz?.buzz',
    canReplaceAndWithOr: true,
  },
  {
    // case with a jump (i.e. a non-nullish prop)
    code: 'foo && foo[bar].baz && foo[bar].baz.buzz',
    output: 'foo?.[bar].baz?.buzz',
    canReplaceAndWithOr: true,
  },
  // case with a property access in computed property
  {
    code: 'foo && foo[bar.baz] && foo[bar.baz].buzz',
    output: 'foo?.[bar.baz]?.buzz',
    canReplaceAndWithOr: true,
  },
  // case with this keyword
  {
    code: 'foo[this.bar] && foo[this.bar].baz',
    output: 'foo[this.bar]?.baz',
    canReplaceAndWithOr: true,
  },
  // chained calls
  {
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz()',
    output: 'foo?.bar?.baz?.buzz()',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz()',
    output: 'foo?.bar?.baz?.buzz?.()',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo.bar && foo.bar.baz && foo.bar.baz.buzz && foo.bar.baz.buzz()',
    output: 'foo.bar?.baz?.buzz?.()',
    canReplaceAndWithOr: true,
  },
  // case with a jump (i.e. a non-nullish prop)
  {
    code: 'foo && foo.bar && foo.bar.baz.buzz()',
    output: 'foo?.bar?.baz.buzz()',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo.bar && foo.bar.baz.buzz()',
    output: 'foo.bar?.baz.buzz()',
    canReplaceAndWithOr: true,
  },
  {
    // case with a jump (i.e. a non-nullish prop)
    code: 'foo && foo.bar && foo.bar.baz.buzz && foo.bar.baz.buzz()',
    output: 'foo?.bar?.baz.buzz?.()',
    canReplaceAndWithOr: true,
  },
  {
    // case with a call expr inside the chain for some inefficient reason
    code: 'foo && foo.bar() && foo.bar().baz && foo.bar().baz.buzz && foo.bar().baz.buzz()',
    output: 'foo?.bar()?.baz?.buzz?.()',
    canReplaceAndWithOr: true,
  },
  // chained calls with element access
  {
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz]()',
    output: 'foo?.bar?.baz?.[buzz]()',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo && foo.bar && foo.bar.baz && foo.bar.baz[buzz] && foo.bar.baz[buzz]()',
    output: 'foo?.bar?.baz?.[buzz]?.()',
    canReplaceAndWithOr: true,
  },
  // (partially) pre-optional chained
  {
    code: 'foo && foo?.bar && foo?.bar.baz && foo?.bar.baz[buzz] && foo?.bar.baz[buzz]()',
    output: 'foo?.bar?.baz?.[buzz]?.()',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo && foo?.bar.baz && foo?.bar.baz[buzz]',
    output: 'foo?.bar.baz?.[buzz]',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo && foo?.() && foo?.().bar',
    output: 'foo?.()?.bar',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo.bar && foo.bar?.() && foo.bar?.().baz',
    output: 'foo.bar?.()?.baz',
    canReplaceAndWithOr: true,
  },
  {
    code: 'foo !== null && foo.bar !== null',
    output: 'foo?.bar != null',
    canReplaceAndWithOr: false,
  },
  {
    code: 'foo != null && foo.bar != null',
    output: 'foo?.bar != null',
    canReplaceAndWithOr: false,
  },
  {
    code: 'foo != null && foo.bar !== null',
    output: 'foo?.bar != null',
    canReplaceAndWithOr: false,
  },
  {
    code: 'foo !== null && foo.bar != null',
    output: 'foo?.bar != null',
    canReplaceAndWithOr: false,
  },
];

interface Selector {
  all(): InvalidTestCase[];
  select<K extends Exclude<keyof BaseCase, 'code' | 'output'>>(
    key: K,
    value: BaseCase[K],
  ): Selector;
}

const selector = (cases: BaseCase[]): Selector => ({
  all: () => cases.map(mapper),
  select: <K extends Exclude<keyof BaseCase, 'code' | 'output'>>(
    key: K,
    value: BaseCase[K],
  ): Selector => {
    const selectedCases = baseCases.filter(c => c[key] === value);
    return selector(selectedCases);
  },
});

const { all, select } = selector(baseCases);

export { all, select };
