import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/util';
import baseRule from 'eslint/lib/rules/no-extra-parens';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-extra-parens',
  meta: {
    type: 'layout',
    docs: {
      description: 'disallow unnecessary parentheses',
      category: 'Possible Errors',
      recommended: false,
    },
    fixable: 'code',
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: ['all'],
  create(context) {
    const rules = baseRule.create(context);

    return Object.assign({}, rules, {
      MemberExpression(node: TSESTree.MemberExpression) {
        if (node.object.type !== AST_NODE_TYPES.TSAsExpression) {
          return rules.MemberExpression(node);
        }
      },
    });
  },
});
