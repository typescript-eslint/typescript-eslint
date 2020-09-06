import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
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
    messages: baseRule.meta.messages ?? {
      unusedExpression:
        'Expected an assignment or function call and instead saw an expression.',
    },
  },
  defaultOptions: [
    {
      allowShortCircuit: false,
      allowTernary: false,
      allowTaggedTemplates: false,
    },
  ],
  create(context, options) {
    const rules = baseRule.create(context);
    const { allowShortCircuit = false, allowTernary = false } = options[0];

    function isValidExpression(node: TSESTree.Node): boolean {
      if (allowShortCircuit && node.type === AST_NODE_TYPES.LogicalExpression) {
        return isValidExpression(node.right);
      }
      if (allowTernary && node.type === AST_NODE_TYPES.ConditionalExpression) {
        return (
          isValidExpression(node.alternate) &&
          isValidExpression(node.consequent)
        );
      }
      return (
        (node.type === AST_NODE_TYPES.ChainExpression &&
          node.expression.type === AST_NODE_TYPES.CallExpression) ||
        node.type === AST_NODE_TYPES.ImportExpression
      );
    }

    return {
      ExpressionStatement(node): void {
        if (node.directive || isValidExpression(node.expression)) {
          return;
        }

        rules.ExpressionStatement(node);
      },
    };
  },
});
