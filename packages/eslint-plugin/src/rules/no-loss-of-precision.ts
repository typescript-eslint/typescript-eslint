import { TSESTree } from '@typescript-eslint/utils';
import * as util from '../util';
import { maybeGetESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = maybeGetESLintCoreRule('no-loss-of-precision');

type Options = util.InferOptionsTypeFromRule<NonNullable<typeof baseRule>>;
type MessageIds = util.InferMessageIdsTypeFromRule<
  NonNullable<typeof baseRule>
>;

export default util.createRule<Options, MessageIds>({
  name: 'no-loss-of-precision',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow literal numbers that lose precision',
      recommended: 'error',
      extendsBaseRule: true,
    },
    hasSuggestions: baseRule?.meta.hasSuggestions,
    schema: [],
    messages: baseRule?.meta.messages ?? { noLossOfPrecision: '' },
  },
  defaultOptions: [],
  create(context) {
    /* istanbul ignore if */ if (baseRule === null) {
      throw new Error(
        '@typescript-eslint/no-loss-of-precision requires at least ESLint v7.1.0',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const rules = baseRule!.create(context);

    function isSeparatedNumeric(node: TSESTree.Literal): boolean {
      return typeof node.value === 'number' && node.raw.includes('_');
    }
    return {
      Literal(node: TSESTree.Literal): void {
        rules.Literal({
          ...node,
          raw: isSeparatedNumeric(node) ? node.raw.replace(/_/g, '') : node.raw,
        } as never);
      },
    };
  },
});
