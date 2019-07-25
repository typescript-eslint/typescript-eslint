import {
  RuleMetaData,
  RuleMetaDataDocs,
  RuleListener,
  RuleContext,
  RuleModule,
} from '../ts-eslint/Rule';
import { applyDefault } from './applyDefault';

// we'll automatically add the url + tslint description for people.
type CreateRuleMetaDocs = Omit<RuleMetaDataDocs, 'url'>;
type CreateRuleMeta<TMessageIds extends string> = {
  docs: CreateRuleMetaDocs;
} & Omit<RuleMetaData<TMessageIds>, 'docs'>;

export function RuleCreator(urlCreator: (ruleName: string) => string) {
  // This function will get much easier to call when this is merged https://github.com/Microsoft/TypeScript/pull/26349
  // TODO - when the above PR lands; add type checking for the context.report `data` property
  return function createRule<
    TOptions extends unknown[],
    TMessageIds extends string,
    TRuleListener extends RuleListener = RuleListener
  >({
    name,
    meta,
    defaultOptions,
    create,
  }: {
    name: string;
    meta: CreateRuleMeta<TMessageIds>;
    defaultOptions: TOptions;
    create: (
      context: RuleContext<TMessageIds, TOptions>,
      optionsWithDefault: TOptions,
    ) => TRuleListener;
  }): RuleModule<TMessageIds, TOptions, TRuleListener> {
    return {
      meta: {
        ...meta,
        docs: {
          ...meta.docs,
          url: urlCreator(name),
        },
      },
      create(context) {
        const optionsWithDefault = applyDefault(
          defaultOptions,
          context.options,
        );
        return create(context, optionsWithDefault);
      },
    };
  };
}
