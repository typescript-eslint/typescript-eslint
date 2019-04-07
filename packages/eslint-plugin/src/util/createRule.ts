import RuleModule, {
  RuleListener,
  RuleMetaData,
  RuleMetaDataDocs,
  RuleContext,
} from 'ts-eslint';
import { applyDefault } from './applyDefault';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
const version = require('../../package.json').version;

// Utility type to remove a list of properties from an object
type RemoveProps<
  TObj extends Record<string, any>,
  TKeys extends keyof TObj
> = Pick<TObj, Exclude<keyof TObj, TKeys>>;

// we'll automatically add the url + tslint description for people.
type CreateRuleMetaDocs = RemoveProps<RuleMetaDataDocs, 'url'> & {
  tslintName?: string;
};
type CreateRuleMeta<TMessageIds extends string> = {
  docs: CreateRuleMetaDocs;
} & RemoveProps<RuleMetaData<TMessageIds>, 'docs'>;

// This function will get much easier to call when this is merged https://github.com/Microsoft/TypeScript/pull/26349
// TODO - when the above rule lands; add type checking for the context.report `data` property
export function createRule<
  TOptions extends any[],
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
        url: `https://github.com/typescript-eslint/typescript-eslint/blob/v${version}/packages/eslint-plugin/docs/rules/${name}.md`,
        extraDescription: meta.docs.tslintName
          ? [`\`${meta.docs.tslintName}\` from TSLint`]
          : undefined,
      },
    },
    create(context) {
      const optionsWithDefault = applyDefault(defaultOptions, context.options);
      return create(context, optionsWithDefault);
    },
  };
}
