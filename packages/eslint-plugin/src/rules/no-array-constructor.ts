import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, isOptionalCallExpression } from '../util';

export default createRule({
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow generic `Array` constructors',
      extendsBaseRule: true,
      recommended: 'recommended',
    },
    fixable: 'code',
    messages: {
      useLiteral: 'The array literal notation [] is preferable.',
    },
    schema: [],
  },
  name: 'no-array-constructor',
  create(context) {
    /**
     * Disallow construction of dense arrays using the Array constructor
     * @param node node to evaluate
     */
    function check(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      if (
        node.arguments.length !== 1 &&
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'Array' &&
        !node.typeArguments &&
        !isOptionalCallExpression(node)
      ) {
        context.report({
          fix(fixer) {
            if (node.arguments.length === 0) {
              return fixer.replaceText(node, '[]');
            }
            const fullText = context.sourceCode.getText(node);
            const preambleLength = node.callee.range[1] - node.range[0];

            return fixer.replaceText(
              node,
              `[${fullText.slice(preambleLength + 1, -1)}]`,
            );
          },
          messageId: 'useLiteral',
          node,
        });
      }
    }

    return {
      CallExpression: check,
      NewExpression: check,
    };
  },
});
