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
export type NamedCreateRuleMetaDocs<Options extends readonly unknown[]> = Omit<
  RuleMetaDataDocs<Options>,
  'url'
>;
export type NamedCreateRuleMeta<
  MessageIds extends string,
  Options extends readonly unknown[],
> = Omit<RuleMetaData<MessageIds, Options>, 'docs'> & {
  docs: NamedCreateRuleMetaDocs<Options>;
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
> extends RuleCreateAndOptions<Options, MessageIds> {
  meta: RuleMetaData<MessageIds, Options>;
}

export interface RuleWithMetaAndName<
  Options extends readonly unknown[],
  MessageIds extends string,
> extends RuleCreateAndOptions<Options, MessageIds> {
  meta: NamedCreateRuleMeta<MessageIds, Options>;
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
    Options extends readonly unknown[],
    MessageIds extends string,
  >({
    name,
    meta,
    ...rule
  }: Readonly<RuleWithMetaAndName<Options, MessageIds>>): RuleModule<
    MessageIds,
    Options
  > {
    return createRule<Options, MessageIds>({
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
  Options extends readonly unknown[],
  MessageIds extends string,
>({
  create,
  defaultOptions,
  meta,
}: Readonly<RuleWithMeta<Options, MessageIds>>): RuleModule<
  MessageIds,
  Options
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

RuleCreator.withoutDocs = createRule;
