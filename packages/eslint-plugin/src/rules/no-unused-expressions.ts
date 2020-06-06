import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-unused-expressions';
import * as util from '../util';

type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;
type Options = util.InferOptionsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'no-unused-expressions',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unused expressions',
      category: 'Best Practices',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);

    return {
      ExpressionStatement(node): void {
        if (
          node.directive ||
          node.expression.type === AST_NODE_TYPES.OptionalCallExpression ||
          node.expression.type === AST_NODE_TYPES.ImportExpression
        ) {
          return;
        }

        rules.ExpressionStatement(node);
      },
    };
  },
});
