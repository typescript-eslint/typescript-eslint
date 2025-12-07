import type {
  RuleContext,
  RuleListener,
  RuleMetaData,
  RuleMetaDataDocs,
  RuleModule,
} from '../ts-eslint/Rule';

import { applyDefault } from './applyDefault';

// we automatically add the url
export type NamedCreateRuleMetaDocs = Omit<RuleMetaDataDocs, 'url'>;

export type NamedCreateRuleMeta<
  MessageIds extends string,
  PluginDocs = unknown,
  Options extends readonly unknown[] = [],
> = {
  docs: PluginDocs & RuleMetaDataDocs;
} & Omit<RuleMetaData<MessageIds, PluginDocs, Options>, 'docs'>;

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
  meta: RuleMetaData<MessageIds, Docs, Options>;
  name?: string;
}

export interface RuleWithMetaAndName<
  Options extends readonly unknown[],
  MessageIds extends string,
  Docs = unknown,
> extends RuleCreateAndOptions<Options, MessageIds> {
  meta: NamedCreateRuleMeta<MessageIds, Docs, Options>;
  name: string;
}

type RuleModuleWithName<
  MessageIds extends string,
  Options extends readonly unknown[] = [],
  Docs = unknown,
  ExtendedRuleListener extends RuleListener = RuleListener,
> = RuleModule<MessageIds, Options, Docs, ExtendedRuleListener> & {
  name: string;
};

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
    meta,
    name,
    ...rule
  }: Readonly<
    RuleWithMetaAndName<Options, MessageIds, PluginDocs>
  >): RuleModuleWithName<MessageIds, Options, PluginDocs> {
    const ruleWithDocs = createRule<Options, MessageIds, PluginDocs>({
      meta: {
        ...meta,
        docs: {
          ...meta.docs,
          url: urlCreator(name),
        },
      },
      name,
      ...rule,
    });

    return {
      ...ruleWithDocs,
      name,
    };
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
  name,
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
    name,
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

export { type RuleListener, type RuleModule } from '../ts-eslint/Rule';
