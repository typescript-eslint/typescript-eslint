import type * as core from '@eslint/core';

import type {
  MutableOptions,
  RuleContext,
  RuleListener,
  RuleListenerWithCoreVisitor,
  RuleMetaData,
  RuleMetaDataDocs,
  RuleMetaDataWithMutableDefaults,
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
  /** @deprecated Use meta.defaultOptions instead */
  defaultOptions?: Readonly<Options>;
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

export interface RuleModuleCoreView<
  MessageIds extends string,
  Options extends readonly unknown[] = [],
  Docs = unknown,
> {
  /* eslint-disable @typescript-eslint/unified-signatures -- the overload pair is load-bearing: a single union parameter would leak the union into literal implementations and break contextual typing of rule visitors */
  create(context: core.RuleContext): RuleListenerWithCoreVisitor;
  create(
    context: Readonly<RuleContext<MessageIds, Options>>,
  ): RuleListenerWithCoreVisitor;
  /* eslint-enable @typescript-eslint/unified-signatures */
  /**
   * @deprecated Use meta.defaultOptions instead
   * Default options the rule will be run with
   */
  defaultOptions?: MutableOptions<Options>;
  meta: RuleMetaDataWithMutableDefaults<MessageIds, Docs, Options>;
  name?: string;
}
export type RuleModuleWithName<
  MessageIds extends string,
  Options extends readonly unknown[] = [],
  Docs = unknown,
> = RuleModuleCoreView<MessageIds, Options, Docs> & {
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

    return ruleWithDocs as RuleModuleWithName<MessageIds, Options, PluginDocs>;
  };
}

function createRule<
  Options extends readonly unknown[],
  MessageIds extends string,
  PluginDocs = unknown,
>({
  create,
  // Keep accepting deprecated defaultOptions for backward compatibility.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  defaultOptions,
  meta,
  name,
}: Readonly<RuleWithMeta<Options, MessageIds, PluginDocs>>): RuleModuleCoreView<
  MessageIds,
  Options,
  PluginDocs
> {
  const resolvedDefaultOptions = (meta.defaultOptions ??
    defaultOptions ??
    []) as MutableOptions<Options>;
  return {
    create(
      context: core.RuleContext | Readonly<RuleContext<MessageIds, Options>>,
    ): RuleListenerWithCoreVisitor {
      const optionsWithDefault = applyDefault(
        resolvedDefaultOptions,
        context.options,
      );
      return create(
        context as Readonly<RuleContext<MessageIds, Options>>,
        optionsWithDefault,
      ) as RuleListenerWithCoreVisitor satisfies RuleListener;
    },
    defaultOptions,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- the cast strips the readonly modifier from defaultOptions; the lint rule does not model readonly-only differences
    meta: meta as unknown as RuleMetaDataWithMutableDefaults<
      MessageIds,
      PluginDocs,
      Options
    > satisfies RuleMetaData<MessageIds, PluginDocs, Options>,
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
