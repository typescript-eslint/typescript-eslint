import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import {
  isOpeningParenToken,
  isClosingParenToken,
} from '@typescript-eslint/utils/ast-utils';

import {
  createRule,
  isReferenceToGlobalFunction,
  isStartOfExpressionStatement,
  needsPrecedingSemicolon,
} from '../util';

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
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    function hasCommentsOutsideArguments(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): boolean {
      const lastToken = sourceCode.getLastToken(node);
      let token = sourceCode.getLastToken(node.callee);

      while (token && token !== lastToken && !isOpeningParenToken(token)) {
        token = sourceCode.getTokenAfter(token);
      }

      const argumentsStart = token?.range[0] ?? node.range[1];

      return sourceCode
        .getCommentsInside(node)
        .some(comment => comment.range[1] <= argumentsStart);
    }

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
        !node.typeArguments &&
        isReferenceToGlobalFunction('Array', node.callee, sourceCode)
      ) {
        context.report({
          node,
          messageId: 'useLiteral',
          fix: hasCommentsOutsideArguments(node)
            ? null
            : fixer => {
                const semicolon =
                  isStartOfExpressionStatement(node) &&
                  needsPrecedingSemicolon(sourceCode, node)
                    ? ';'
                    : '';

                return fixer.replaceText(
                  node,
                  `${semicolon}[${getArgumentsText(node)}]`,
                );
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
