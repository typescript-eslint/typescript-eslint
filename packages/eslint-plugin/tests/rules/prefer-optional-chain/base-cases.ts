import type { InvalidTestCase } from '@typescript-eslint/utils/ts-eslint';

import type {
  TMessageIds,
  TOptions,
} from '../../../src/rules/prefer-optional-chain';

type MutateCodeFn = (c: string) => string;
type MutateOutputFn = (c: string) => string;
type BaseCaseCreator = (
  operator: '&&' | '||',
  mutateCode?: MutateCodeFn,
  mutateOutput?: MutateOutputFn,
) => InvalidTestCase<TMessageIds, TOptions>[];

export const identity: MutateCodeFn = c => c;
export const BaseCases: BaseCaseCreator = (
  operator,
  mutateCode = identity,
  mutateOutput = mutateCode,
) =>
  [
    // chained members
    {
      code: `foo ${operator} foo.bar`,
      output: 'foo?.bar',
    },
    {
      code: `foo.bar ${operator} foo.bar.baz`,
      output: 'foo.bar?.baz',
    },
    {
      code: `foo ${operator} foo()`,
      output: 'foo?.()',
    },
    {
      code: `foo.bar ${operator} foo.bar()`,
      output: 'foo.bar?.()',
    },
    {
      code: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz`,
      output: 'foo?.bar?.baz?.buzz',
    },
    {
      code: `foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz`,
      output: 'foo.bar?.baz?.buzz',
    },
    // case with a jump (i.e. a non-nullish prop)
    {
      code: `foo ${operator} foo.bar ${operator} foo.bar.baz.buzz`,
      output: 'foo?.bar?.baz.buzz',
    },
    {
      code: `foo.bar ${operator} foo.bar.baz.buzz`,
      output: 'foo.bar?.baz.buzz',
    },
    // case where for some reason there is a doubled up expression
    {
      code: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz`,
      output: 'foo?.bar?.baz?.buzz',
    },
    {
      code: `foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz`,
      output: 'foo.bar?.baz?.buzz',
    },
    // chained members with element access
    {
      code: `foo ${operator} foo[bar] ${operator} foo[bar].baz ${operator} foo[bar].baz.buzz`,
      output: 'foo?.[bar]?.baz?.buzz',
    },
    {
      // case with a jump (i.e. a non-nullish prop)
      code: `foo ${operator} foo[bar].baz ${operator} foo[bar].baz.buzz`,
      output: 'foo?.[bar].baz?.buzz',
    },
    // case with a property access in computed property
    {
      code: `foo ${operator} foo[bar.baz] ${operator} foo[bar.baz].buzz`,
      output: 'foo?.[bar.baz]?.buzz',
    },
    // case with this keyword
    {
      code: `foo[this.bar] ${operator} foo[this.bar].baz`,
      output: 'foo[this.bar]?.baz',
    },
    // chained calls
    {
      code: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz()`,
      output: 'foo?.bar?.baz?.buzz()',
    },
    {
      code: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz ${operator} foo.bar.baz.buzz()`,
      output: 'foo?.bar?.baz?.buzz?.()',
    },
    {
      code: `foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz ${operator} foo.bar.baz.buzz()`,
      output: 'foo.bar?.baz?.buzz?.()',
    },
    // case with a jump (i.e. a non-nullish prop)
    {
      code: `foo ${operator} foo.bar ${operator} foo.bar.baz.buzz()`,
      output: 'foo?.bar?.baz.buzz()',
    },
    {
      code: `foo.bar ${operator} foo.bar.baz.buzz()`,
      output: 'foo.bar?.baz.buzz()',
    },
    {
      // case with a jump (i.e. a non-nullish prop)
      code: `foo ${operator} foo.bar ${operator} foo.bar.baz.buzz ${operator} foo.bar.baz.buzz()`,
      output: 'foo?.bar?.baz.buzz?.()',
    },
    {
      // case with a call expr inside the chain for some inefficient reason
      code: `foo ${operator} foo.bar() ${operator} foo.bar().baz ${operator} foo.bar().baz.buzz ${operator} foo.bar().baz.buzz()`,
      output: 'foo?.bar()?.baz?.buzz?.()',
    },
    // chained calls with element access
    {
      code: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz[buzz]()`,
      output: 'foo?.bar?.baz?.[buzz]()',
    },
    {
      code: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz[buzz] ${operator} foo.bar.baz[buzz]()`,
      output: 'foo?.bar?.baz?.[buzz]?.()',
    },
    // (partially) pre-optional chained
    {
      code: `foo ${operator} foo?.bar ${operator} foo?.bar.baz ${operator} foo?.bar.baz[buzz] ${operator} foo?.bar.baz[buzz]()`,
      output: 'foo?.bar?.baz?.[buzz]?.()',
    },
    {
      code: `foo ${operator} foo?.bar.baz ${operator} foo?.bar.baz[buzz]`,
      output: 'foo?.bar.baz?.[buzz]',
    },
    {
      code: `foo ${operator} foo?.() ${operator} foo?.().bar`,
      output: 'foo?.()?.bar',
    },
    {
      code: `foo.bar ${operator} foo.bar?.() ${operator} foo.bar?.().baz`,
      output: 'foo.bar?.()?.baz',
    },
  ].map(({ code, output }): InvalidTestCase<TMessageIds, TOptions> => {
    const fixOutput = mutateOutput(output);
    return {
      code: mutateCode(code),
      output: fixOutput,
      errors: [
        {
          messageId: 'preferOptionalChain',
          suggestions: null,
        },
      ],
    };
  });
