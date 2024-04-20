import type { InvalidTestCase } from '@typescript-eslint/utils/ts-eslint';

import type {
  PreferOptionalChainMessageIds,
  PreferOptionalChainOptions,
} from '../../../src/rules/prefer-optional-chain-utils/PreferOptionalChainOptions';

type MutateFn = (c: string) => string;
type BaseCaseCreator = (args: {
  operator: '&&' | '||';
  mutateCode?: MutateFn;
  mutateOutput?: MutateFn;
  mutateDeclaration?: MutateFn;
  useSuggestionFixer?: true;
  skipIds?: number[];
}) => InvalidTestCase<
  PreferOptionalChainMessageIds,
  [PreferOptionalChainOptions]
>[];

const RawBaseCases = (operator: '&&' | '||') =>
  [
    // chained members
    {
      id: 1,
      declaration: 'declare const foo: {bar: number} | null | undefined;',
      chain: `foo ${operator} foo.bar;`,
      outputChain: 'foo?.bar;',
    },
    {
      id: 2,
      declaration:
        'declare const foo: {bar: {baz: number} | null | undefined};',
      chain: `foo.bar ${operator} foo.bar.baz;`,
      outputChain: 'foo.bar?.baz;',
    },
    {
      id: 3,
      declaration: 'declare const foo: (() => number) | null | undefined;',
      chain: `foo ${operator} foo();`,
      outputChain: 'foo?.();',
    },
    {
      id: 4,
      declaration:
        'declare const foo: {bar: (() => number) | null | undefined};',
      chain: `foo.bar ${operator} foo.bar();`,
      outputChain: 'foo.bar?.();',
    },
    {
      id: 5,
      declaration:
        'declare const foo: {bar: {baz: {buzz: number} | null | undefined} | null | undefined} | null | undefined;',
      chain: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz;`,
      outputChain: 'foo?.bar?.baz?.buzz;',
    },
    {
      id: 6,
      declaration:
        'declare const foo: {bar: {baz: {buzz: number} | null | undefined} | null | undefined};',
      chain: `foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz;`,
      outputChain: 'foo.bar?.baz?.buzz;',
    },
    // case with a jump (i.e. a non-nullish prop)
    {
      id: 7,
      declaration:
        'declare const foo: {bar: {baz: {buzz: number}} | null | undefined} | null | undefined;',
      chain: `foo ${operator} foo.bar ${operator} foo.bar.baz.buzz;`,
      outputChain: 'foo?.bar?.baz.buzz;',
    },
    {
      id: 8,
      declaration:
        'declare const foo: {bar: {baz: {buzz: number}} | null | undefined};',
      chain: `foo.bar ${operator} foo.bar.baz.buzz;`,
      outputChain: 'foo.bar?.baz.buzz;',
    },
    // case where for some reason there is a doubled up expression
    {
      id: 9,
      declaration:
        'declare const foo: {bar: {baz: {buzz: number} | null | undefined} | null | undefined} | null | undefined;',
      chain: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz;`,
      outputChain: 'foo?.bar?.baz?.buzz;',
    },
    {
      id: 10,
      declaration:
        'declare const foo: {bar: {baz: {buzz: number} | null | undefined} | null | undefined} | null | undefined;',
      chain: `foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz;`,
      outputChain: 'foo.bar?.baz?.buzz;',
    },
    // chained members with element access
    {
      id: 11,
      declaration: [
        'declare const bar: string;',
        'declare const foo: {[k: string]: {baz: {buzz: number} | null | undefined} | null | undefined} | null | undefined;',
      ].join('\n'),
      chain: `foo ${operator} foo[bar] ${operator} foo[bar].baz ${operator} foo[bar].baz.buzz;`,
      outputChain: 'foo?.[bar]?.baz?.buzz;',
    },
    {
      id: 12,
      // case with a jump (i.e. a non-nullish prop)
      declaration: [
        'declare const bar: string;',
        'declare const foo: {[k: string]: {baz: {buzz: number} | null | undefined} | null | undefined} | null | undefined;',
      ].join('\n'),
      chain: `foo ${operator} foo[bar].baz ${operator} foo[bar].baz.buzz;`,
      outputChain: 'foo?.[bar].baz?.buzz;',
    },
    // case with a property access in computed property
    {
      id: 13,
      declaration: [
        'declare const bar: {baz: string};',
        'declare const foo: {[k: string]: {buzz: number} | null | undefined} | null | undefined;',
      ].join('\n'),
      chain: `foo ${operator} foo[bar.baz] ${operator} foo[bar.baz].buzz;`,
      outputChain: 'foo?.[bar.baz]?.buzz;',
    },
    // chained calls
    {
      id: 14,
      declaration:
        'declare const foo: {bar: {baz: {buzz: () => number} | null | undefined} | null | undefined} | null | undefined;',
      chain: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz();`,
      outputChain: 'foo?.bar?.baz?.buzz();',
    },
    {
      id: 15,
      declaration:
        'declare const foo: {bar: {baz: {buzz: (() => number) | null | undefined} | null | undefined} | null | undefined} | null | undefined;',
      chain: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz ${operator} foo.bar.baz.buzz();`,
      outputChain: 'foo?.bar?.baz?.buzz?.();',
    },
    {
      id: 16,
      declaration:
        'declare const foo: {bar: {baz: {buzz: (() => number) | null | undefined} | null | undefined} | null | undefined};',
      chain: `foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz.buzz ${operator} foo.bar.baz.buzz();`,
      outputChain: 'foo.bar?.baz?.buzz?.();',
    },
    // case with a jump (i.e. a non-nullish prop)
    {
      id: 17,
      declaration:
        'declare const foo: {bar: {baz: {buzz: () => number}} | null | undefined} | null | undefined;',
      chain: `foo ${operator} foo.bar ${operator} foo.bar.baz.buzz();`,
      outputChain: 'foo?.bar?.baz.buzz();',
    },
    {
      id: 18,
      declaration:
        'declare const foo: {bar: {baz: {buzz: () => number}} | null | undefined};',
      chain: `foo.bar ${operator} foo.bar.baz.buzz();`,
      outputChain: 'foo.bar?.baz.buzz();',
    },
    {
      id: 19,
      // case with a jump (i.e. a non-nullish prop)
      declaration:
        'declare const foo: {bar: {baz: {buzz: (() => number) | null | undefined}} | null | undefined} | null | undefined;',
      chain: `foo ${operator} foo.bar ${operator} foo.bar.baz.buzz ${operator} foo.bar.baz.buzz();`,
      outputChain: 'foo?.bar?.baz.buzz?.();',
    },
    {
      id: 20,
      // case with a call expr inside the chain for some inefficient reason
      declaration:
        'declare const foo: {bar: () => ({baz: {buzz: (() => number) | null | undefined} | null | undefined}) | null | undefined};',
      chain: `foo.bar ${operator} foo.bar() ${operator} foo.bar().baz ${operator} foo.bar().baz.buzz ${operator} foo.bar().baz.buzz();`,
      outputChain: 'foo.bar?.()?.baz?.buzz?.();',
    },
    // chained calls with element access
    {
      id: 21,
      declaration: [
        'declare const buzz: string;',
        'declare const foo: {bar: {baz: {[k: string]: () => number} | null | undefined} | null | undefined} | null | undefined;',
      ].join('\n'),
      chain: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz[buzz]();`,
      outputChain: 'foo?.bar?.baz?.[buzz]();',
    },
    {
      id: 22,
      declaration: [
        'declare const buzz: string;',
        'declare const foo: {bar: {baz: {[k: string]: (() => number) | null | undefined} | null | undefined} | null | undefined} | null | undefined;',
      ].join('\n'),
      chain: `foo ${operator} foo.bar ${operator} foo.bar.baz ${operator} foo.bar.baz[buzz] ${operator} foo.bar.baz[buzz]();`,
      outputChain: 'foo?.bar?.baz?.[buzz]?.();',
    },
    // (partially) pre-optional chained
    {
      id: 23,
      declaration: [
        'declare const buzz: string;',
        'declare const foo: {bar: {baz: {[k: string]: (() => number) | null | undefined} | null | undefined} | null | undefined} | null | undefined;',
      ].join('\n'),
      chain: `foo ${operator} foo?.bar ${operator} foo?.bar.baz ${operator} foo?.bar.baz[buzz] ${operator} foo?.bar.baz[buzz]();`,
      outputChain: 'foo?.bar?.baz?.[buzz]?.();',
    },
    {
      id: 24,
      declaration: [
        'declare const buzz: string;',
        'declare const foo: {bar: {baz: {[k: string]: number} | null | undefined}} | null | undefined;',
      ].join('\n'),
      chain: `foo ${operator} foo?.bar.baz ${operator} foo?.bar.baz[buzz];`,
      outputChain: 'foo?.bar.baz?.[buzz];',
    },
    {
      id: 25,
      declaration:
        'declare const foo: (() => ({bar: number} | null | undefined)) | null | undefined;',
      chain: `foo ${operator} foo?.() ${operator} foo?.().bar;`,
      outputChain: 'foo?.()?.bar;',
    },
    {
      id: 26,
      declaration:
        'declare const foo: {bar: () => ({baz: number} | null | undefined)};',
      chain: `foo.bar ${operator} foo.bar?.() ${operator} foo.bar?.().baz;`,
      outputChain: 'foo.bar?.()?.baz;',
    },
  ] as const;

export const identity: MutateFn = c => c;
/*
eslint-disable-next-line eslint-plugin/prefer-message-ids, eslint-plugin/prefer-object-rule, eslint-plugin/require-meta-type, eslint-plugin/require-meta-schema --
TODO - bug in hte rules - https://github.com/eslint-community/eslint-plugin-eslint-plugin/issues/455
*/
export const BaseCases: BaseCaseCreator = ({
  operator,
  mutateCode = identity,
  mutateOutput = mutateCode,
  mutateDeclaration = identity,
  useSuggestionFixer = false,
  skipIds = [],
}) => {
  const skipIdsSet = new Set(skipIds);
  const skipSpecifiedIds: (
    arg: ReturnType<typeof RawBaseCases>[number],
  ) => boolean =
    skipIds.length === 0
      ? (): boolean => true
      : ({ id }): boolean => !skipIdsSet.has(id);

  return RawBaseCases(operator)
    .filter(skipSpecifiedIds)
    .map(
      ({
        id,
        declaration: originalDeclaration,
        chain,
        outputChain,
      }): InvalidTestCase<
        PreferOptionalChainMessageIds,
        [PreferOptionalChainOptions]
      > => {
        const declaration = mutateDeclaration(originalDeclaration);
        const code = `// ${id}\n${declaration}\n${mutateCode(chain)}`;
        const output = `// ${id}\n${declaration}\n${mutateOutput(outputChain)}`;

        return {
          code,
          output: useSuggestionFixer ? null : output,
          errors: [
            {
              messageId: 'preferOptionalChain',
              suggestions: !useSuggestionFixer
                ? null
                : [
                    {
                      messageId: 'optionalChainSuggest',
                      output,
                    },
                  ],
            },
          ],
        };
      },
    );
};
