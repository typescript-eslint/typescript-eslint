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

export type NamedRuleCreator = <
  TOptions extends readonly unknown[] = readonly unknown[],
  TMessageIds extends string = string,
>(
  config: Readonly<RuleWithMetaAndName<TOptions, TMessageIds>>,
) => RuleModule<TMessageIds, TOptions>;

/**
 * Creates reusable function to create rules with default options and docs URLs.
 *
 * @param urlCreator Creates a documentation URL for a given rule name.
 * @returns Function to create a rule with the docs URL format.
 */
export function RuleCreator(
  urlCreator: (ruleName: string) => string,
): NamedRuleCreator {
  // This function will get much easier to call when this is merged https://github.com/Microsoft/TypeScript/pull/26349
  // TODO - when the above PR lands; add type checking for the context.report `data` property
  return function createNamedRule({ name, meta, ...rule }) {
    return createRule({
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

export type UnnamedRuleCreator = <
  TOptions extends readonly unknown[],
  TMessageIds extends string,
>(
  config: Readonly<RuleWithMeta<TOptions, TMessageIds>>,
) => RuleModule<TMessageIds, TOptions>;

const createRule: UnnamedRuleCreator = ({ create, defaultOptions, meta }) => {
  return {
    create(context): RuleListener {
      const optionsWithDefault = applyDefault(defaultOptions, context.options);
      return create(context, optionsWithDefault);
    },
    defaultOptions,
    meta,
  };
};

// We purposely use a namespace here to provide a typed, but partially hidden API
// for consumers that don't care about having a docs URL for their rules (eg for
// projects that define local rules without hosted docs)
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace RuleCreator {
  /**
   * Creates a well-typed TSESLint custom ESLint rule without a docs URL.
   *
   * @returns Well-typed TSESLint custom ESLint rule.
   * @remarks It is generally better to provide a docs URL function to RuleCreator.
   */
  export const withoutDocs = createRule;
}
