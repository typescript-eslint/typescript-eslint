import { TSESTree } from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-loss-of-precision';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-loss-of-precision',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow literal numbers that lose precision',
      category: 'Possible Errors',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: [],
    messages: baseRule.meta.messages,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);

    function isSeperatedNumeric(node: TSESTree.Literal): boolean {
      return typeof node.value === 'number' && node.raw.includes('_');
    }
    return {
      Literal(node: TSESTree.Literal): void {
        if (isSeperatedNumeric(node)) {
          rules.Literal({
            ...node,
            raw: node.raw.replace(/_/g, ''),
          });
          return;
        }
        rules.Literal(node);
      },
    };
  },
});
