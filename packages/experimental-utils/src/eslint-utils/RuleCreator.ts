import {
  RuleMetaData,
  RuleMetaDataDocs,
  RuleListener,
  RuleContext,
  RuleModule,
} from '../ts-eslint/Rule';
import { applyDefault } from './applyDefault';

// we automatically add the url
type NamedCreateRuleMetaDocs = Omit<RuleMetaDataDocs, 'url'>;
type NamedCreateRuleMeta<TMessageIds extends string> = {
  docs: NamedCreateRuleMetaDocs;
} & Omit<RuleMetaData<TMessageIds>, 'docs'>;

interface CreateAndOptions<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
  TRuleListener extends RuleListener,
> {
  create: (
    context: Readonly<RuleContext<TMessageIds, TOptions>>,
    optionsWithDefault: Readonly<TOptions>,
  ) => TRuleListener;
  defaultOptions: Readonly<TOptions>;
}

interface RuleWithMeta<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
  TRuleListener extends RuleListener,
> extends CreateAndOptions<TOptions, TMessageIds, TRuleListener> {
  meta: RuleMetaData<TMessageIds>;
}

interface RuleWithMetaAndName<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
  TRuleListener extends RuleListener,
> extends CreateAndOptions<TOptions, TMessageIds, TRuleListener> {
  meta: NamedCreateRuleMeta<TMessageIds>;
  name: string;
}

/**
 * Creates reusable function to create rules with default options and docs URLs.
 *
 * @param urlCreator Creates a documentation URL for a given rule name.
 * @returns Function to create a rule with the docs URL format.
 */
function RuleCreator(urlCreator: (ruleName: string) => string) {
  // This function will get much easier to call when this is merged https://github.com/Microsoft/TypeScript/pull/26349
  // TODO - when the above PR lands; add type checking for the context.report `data` property
  return function createNamedRule<
    TOptions extends readonly unknown[],
    TMessageIds extends string,
    TRuleListener extends RuleListener = RuleListener,
  >({
    name,
    meta,
    ...rule
  }: Readonly<
    RuleWithMetaAndName<TOptions, TMessageIds, TRuleListener>
  >): RuleModule<TMessageIds, TOptions, TRuleListener> {
    return createRule<TOptions, TMessageIds, TRuleListener>({
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
  TRuleListener extends RuleListener = RuleListener,
>({
  create,
  defaultOptions,
  meta,
}: Readonly<RuleWithMeta<TOptions, TMessageIds, TRuleListener>>): RuleModule<
  TMessageIds,
  TOptions,
  TRuleListener
> {
  return {
    meta,
    create(
      context: Readonly<RuleContext<TMessageIds, TOptions>>,
    ): TRuleListener {
      const optionsWithDefault = applyDefault(defaultOptions, context.options);
      return create(context, optionsWithDefault);
    },
  };
}

RuleCreator.withoutDocs = createRule;

export { RuleCreator };
