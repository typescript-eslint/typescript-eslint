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

export type NamedCreateRuleMeta<
  MessageIds extends string,
  PluginDocs = unknown,
> = Omit<RuleMetaData<MessageIds, PluginDocs>, 'docs'> & {
  docs: RuleMetaDataDocs & PluginDocs;
};

export interface RuleCreateAndOptions<
  Options extends readonly unknown[],
  MessageIds extends string,
> {
  create: (
    context: Readonly<RuleContext<MessageIds, Options>>,
    optionsWithDefault: Readonly<Options>,
  ) => RuleListener;
  defaultOptions: Readonly<Options>;
}

export interface RuleWithMeta<
  Options extends readonly unknown[],
  MessageIds extends string,
  Docs = unknown,
> extends RuleCreateAndOptions<Options, MessageIds> {
  meta: RuleMetaData<MessageIds, Docs>;
}

export interface RuleWithMetaAndName<
  Options extends readonly unknown[],
  MessageIds extends string,
  Docs = unknown,
> extends RuleCreateAndOptions<Options, MessageIds> {
  meta: NamedCreateRuleMeta<MessageIds, Docs>;
  name: string;
}

/**
 * Creates reusable function to create rules with default options and docs URLs.
 *
 * @param urlCreator Creates a documentation URL for a given rule name.
 * @returns Function to create a rule with the docs URL format.
 */
export function RuleCreator<PluginDocs = unknown>(
  urlCreator: (ruleName: string) => string,
) {
  // This function will get much easier to call when this is merged https://github.com/Microsoft/TypeScript/pull/26349
  // TODO - when the above PR lands; add type checking for the context.report `data` property
  return function createNamedRule<
    Options extends readonly unknown[],
    MessageIds extends string,
  >({
    name,
    meta,
    ...rule
  }: Readonly<
    RuleWithMetaAndName<Options, MessageIds, PluginDocs>
  >): RuleModule<MessageIds, Options, PluginDocs> {
    return createRule<Options, MessageIds, PluginDocs>({
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

function createRule<
  Options extends readonly unknown[],
  MessageIds extends string,
  PluginDocs = unknown,
>({
  create,
  defaultOptions,
  meta,
}: Readonly<RuleWithMeta<Options, MessageIds, PluginDocs>>): RuleModule<
  MessageIds,
  Options,
  PluginDocs
> {
  return {
    create(context: Readonly<RuleContext<MessageIds, Options>>): RuleListener {
      const optionsWithDefault = applyDefault(defaultOptions, context.options);
      return create(context, optionsWithDefault);
    },
    defaultOptions,
    meta,
  };
}

/**
 * Creates a well-typed TSESLint custom ESLint rule without a docs URL.
 *
 * @returns Well-typed TSESLint custom ESLint rule.
 * @remarks It is generally better to provide a docs URL function to RuleCreator.
 */
RuleCreator.withoutDocs = function withoutDocs<
  Options extends readonly unknown[],
  MessageIds extends string,
>(
  args: Readonly<RuleWithMeta<Options, MessageIds>>,
): RuleModule<MessageIds, Options> {
  return createRule(args);
};
