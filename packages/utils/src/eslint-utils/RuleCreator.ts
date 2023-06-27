import type {
  IMessage,
  RuleContext,
  RuleListener,
  RuleMetaData,
  RuleMetaDataDocs,
  RuleModule,
} from '../ts-eslint/Rule';
import type { RuleContextWithReportDataType } from '../ts-eslint/Rule';
import { applyDefault } from './applyDefault';

// we automatically add the url
export type NamedCreateRuleMetaDocs = Omit<RuleMetaDataDocs, 'url'>;
export type NamedCreateRuleMeta<TMessageIds extends string> = {
  docs: NamedCreateRuleMetaDocs;
} & Omit<RuleMetaData<TMessageIds>, 'docs'>;

export interface RuleCreateAndOptions<
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

export interface RuleWithMeta<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
  TRuleListener extends RuleListener,
> extends RuleCreateAndOptions<TOptions, TMessageIds, TRuleListener> {
  meta: RuleMetaData<TMessageIds>;
}

export interface RuleWithMetaAndName<
  TOptions extends readonly unknown[],
  TMessageIds extends string,
  TRuleListener extends RuleListener,
> extends RuleCreateAndOptions<TOptions, TMessageIds, TRuleListener> {
  meta: NamedCreateRuleMeta<TMessageIds>;
  name: string;
}

export interface RuleWithMetaAndNameWithReportDataType<
  TOptions extends readonly unknown[],
  TMessage extends IMessage,
  TRuleListener extends RuleListener,
> extends Omit<
    RuleWithMetaAndName<TOptions, keyof TMessage & string, TRuleListener>,
    'create'
  > {
  create: (
    context: Readonly<RuleContextWithReportDataType<TMessage, TOptions>>,
    optionsWithDefault: Readonly<TOptions>,
  ) => TRuleListener;
}

export type TMessage = string | IMessage;
export type GetMessageIds<T extends TMessage> = [T] extends [string]
  ? T
  : keyof T & string;

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
    TMessage_ extends TMessage,
    TRuleListener extends RuleListener = RuleListener,
  >({
    name,
    meta,
    ...rule
  }: Readonly<
    [TMessage_] extends [string]
      ? RuleWithMetaAndName<TOptions, TMessage_, TRuleListener>
      : RuleWithMetaAndNameWithReportDataType<
          TOptions,
          Exclude<TMessage_, string>,
          TRuleListener
        >
  >): RuleModule<GetMessageIds<TMessage_>, TOptions, TRuleListener> {
    return createRule<TOptions, GetMessageIds<TMessage_>, TRuleListener>({
      meta: {
        ...meta,
        docs: {
          ...meta.docs,
          url: urlCreator(name),
        },
      },
      rule,
    } as any); // TODO - eliminate `as any`
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
    create(
      context: Readonly<RuleContext<TMessageIds, TOptions>>,
    ): TRuleListener {
      const optionsWithDefault = applyDefault(defaultOptions, context.options);
      return create(context, optionsWithDefault);
    },
    defaultOptions,
    meta,
  };
}

RuleCreator.withoutDocs = createRule;
