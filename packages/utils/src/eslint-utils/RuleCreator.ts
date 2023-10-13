import type {
  RuleContext,
  RuleListener,
  RuleMetaData,
  RuleMetaDataDocs,
  RuleModule,
} from '../ts-eslint/Rule';
import { applyDefault } from './applyDefault';

export type { RuleListener, RuleModule };

// we automatically add the url
export type NamedCreateRuleMetaDocs = Omit<RuleMetaDataDocs, 'url'>;
export type NamedCreateRuleMeta<TMessageIds extends string> = Omit<
  RuleMetaData<TMessageIds>,
  'docs'
> & {
  docs: NamedCreateRuleMetaDocs;
};

export interface RuleCreateAndOptions<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
> {
  create: (
    context: Readonly<RuleContext<TMessageIds, TOptions>>,
    optionsWithDefault: Readonly<TOptions>,
  ) => RuleListener;
  defaultOptions: Readonly<TOptions>;
}

export interface RuleWithMeta<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
> extends RuleCreateAndOptions<TOptions, TMessageIds> {
  meta: RuleMetaData<TMessageIds>;
}

export interface RuleWithMetaAndName<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
> extends RuleCreateAndOptions<TOptions, TMessageIds> {
  meta: NamedCreateRuleMeta<TMessageIds>;
  name: string;
}

/**
 * Creates reusable function to create rules with default options and docs URLs.
 *
 * @param urlCreator Creates a documentation URL for a given rule name.
 * @returns Function to create a rule with the docs URL format.
 */
export function RuleCreator(urlCreator: (ruleName: string) => string) {
  // This function will get much easier to call when this is merged https://github.com/Microsoft/TypeScript/pull/26349
  // TODO - when the above PR lands; add type checking for the context.report `data` property
  return function createNamedRule<
    TOptions extends readonly unknown[],
    TMessageIds extends string,
  >({
    name,
    meta,
    ...rule
  }: Readonly<RuleWithMetaAndName<TOptions, TMessageIds>>): RuleModule<
    TMessageIds,
    TOptions
  > {
    return createRule<TOptions, TMessageIds>({
      meta: {
        ...meta,
        docs: {
          ...meta.docs,
          url: urlCreator(name),
        },
      },
      ...rule,
    });
  };
}

/**
 * Creates a well-typed TSESLint custom ESLint rule without a docs URL.
 *
 * @returns Well-typed TSESLint custom ESLint rule.
 * @remarks It is generally better to provide a docs URL function to RuleCreator.
 */
function createRule<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
>({
  create,
  defaultOptions,
  meta,
}: Readonly<RuleWithMeta<TOptions, TMessageIds>>): RuleModule<
  TMessageIds,
  TOptions
> {
  return {
    create(
      context: Readonly<RuleContext<TMessageIds, TOptions>>,
    ): RuleListener {
      const optionsWithDefault = applyDefault(defaultOptions, context.options);
      return create(context, optionsWithDefault);
    },
    defaultOptions,
    meta,
  };
}

RuleCreator.withoutDocs = createRule;
