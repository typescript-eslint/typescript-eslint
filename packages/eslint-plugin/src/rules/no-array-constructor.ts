import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  isOpeningParenToken,
  isClosingParenToken,
} from '@typescript-eslint/utils/ast-utils';

import { createRule } from '../util';

export default createRule({
  name: 'no-array-constructor',
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
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    function getArgumentsText(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ) {
      const lastToken = sourceCode.getLastToken(node);

      if (lastToken == null || !isClosingParenToken(lastToken)) {
        return '';
      }

      let firstToken: TSESTree.Expression | TSESTree.Token | null = node.callee;

      do {
        firstToken = sourceCode.getTokenAfter(firstToken);
        if (!firstToken || firstToken === lastToken) {
          return '';
        }
      } while (!isOpeningParenToken(firstToken));

      return sourceCode.text.slice(firstToken.range[1], lastToken.range[0]);
    }

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
        !node.typeArguments
      ) {
        context.report({
          node,
          messageId: 'useLiteral',
          fix(fixer) {
            const argsText = getArgumentsText(node);

            return fixer.replaceText(node, `[${argsText}]`);
          },
        });
      }
    }

    return {
      CallExpression: check,
      NewExpression: check,
    };
  },
});
