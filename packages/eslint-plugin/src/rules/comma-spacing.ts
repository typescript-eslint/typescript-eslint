import {
  TSESTree,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/experimental-utils';
import { isClosingParenToken, isCommaToken } from 'eslint-utils';
import { isTokenOnSameLine, createRule } from '../util';

type Options = [
  {
    before: boolean;
    after: boolean;
  },
];
type MessageIds = 'unexpected' | 'missing';

export default createRule<Options, MessageIds>({
  name: 'comma-spacing',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforces consistent spacing before and after commas',
      category: 'Stylistic Issues',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    schema: [
      {
        type: 'object',
        properties: {
          before: {
            type: 'boolean',
            default: false,
          },
          after: {
            type: 'boolean',
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpected: `There should be no space {{loc}} ','.`,
      missing: `A space is required {{loc}} ','.`,
    },
  },
  defaultOptions: [
    {
      before: false,
      after: true,
    },
  ],
  create(context, [{ before: spaceBefore, after: spaceAfter }]) {
    const sourceCode = context.getSourceCode();
    const tokensAndComments = sourceCode.tokensAndComments;
    const ignoredTokens = new Set<TSESTree.Token>();

    /**
     * Adds null elements of the ArrayExpression or ArrayPattern node to the ignore list
     * @param node node to evaluate
     */
    function addNullElementsToIgnoreList(
      node: TSESTree.ArrayExpression | TSESTree.ArrayPattern,
    ): void {
      let previousToken = sourceCode.getFirstToken(node);
      for (const element of node.elements) {
        let token: TSESTree.Token | null;
        if (element === null) {
          token = sourceCode.getTokenAfter(previousToken as TSESTree.Token);
          if (token && isCommaToken(token)) {
            ignoredTokens.add(token);
          }
        } else {
          token = sourceCode.getTokenAfter(element);
        }

        previousToken = token;
      }
    }

    /**
     * Adds type parameters trailing comma token to the ignore list
     * @param node node to evaluate
     */
    function addTypeParametersTrailingCommaToIgnoreList(
      node: TSESTree.TSTypeParameterDeclaration,
    ): void {
      const param = node.params[node.params.length - 1];
      const afterToken = sourceCode.getTokenAfter(param);
      if (afterToken && isCommaToken(afterToken)) {
        ignoredTokens.add(afterToken);
      }
    }

    /**
     * Validates the spacing around a comma token.
     * @param commaToken The token representing the comma
     * @param prevToken The last token before the comma
     * @param nextToken The first token after the comma
     */
    function validateCommaSpacing(
      commaToken: TSESTree.Token,
      prevToken: TSESTree.Token | null,
      nextToken: TSESTree.Token | null,
    ): void {
      if (
        prevToken &&
        isTokenOnSameLine(prevToken, commaToken) &&
        spaceBefore !== sourceCode.isSpaceBetween(prevToken, commaToken)
      ) {
        context.report({
          node: commaToken,
          data: {
            loc: 'before',
          },
          messageId: spaceBefore ? 'missing' : 'unexpected',
          fix: fixer =>
            spaceBefore
              ? fixer.insertTextBefore(commaToken, ' ')
              : fixer.replaceTextRange(
                  [prevToken.range[1], commaToken.range[0]],
                  '',
                ),
        });
      }

      if (nextToken && isClosingParenToken(nextToken)) {
        return;
      }

      if (!spaceAfter && nextToken && nextToken.type === AST_TOKEN_TYPES.Line) {
        return;
      }

      if (
        nextToken &&
        isTokenOnSameLine(commaToken, nextToken) &&
        spaceAfter !== sourceCode.isSpaceBetween(commaToken, nextToken)
      ) {
        context.report({
          node: commaToken,
          data: {
            loc: 'after',
          },
          messageId: spaceAfter ? 'missing' : 'unexpected',
          fix: fixer =>
            spaceAfter
              ? fixer.insertTextAfter(commaToken, ' ')
              : fixer.replaceTextRange(
                  [commaToken.range[1], nextToken.range[0]],
                  '',
                ),
        });
      }
    }

    return {
      TSTypeParameterDeclaration: addTypeParametersTrailingCommaToIgnoreList,
      ArrayExpression: addNullElementsToIgnoreList,
      ArrayPattern: addNullElementsToIgnoreList,

      'Program:exit'(): void {
        tokensAndComments.forEach((token, i) => {
          if (!isCommaToken(token)) {
            return;
          }

          if (token.type === AST_TOKEN_TYPES.JSXText) {
            return;
          }

          const commaToken = token as TSESTree.Token;
          const prevToken = tokensAndComments[i - 1] as TSESTree.Token;
          const nextToken = tokensAndComments[i + 1] as TSESTree.Token;

          validateCommaSpacing(
            commaToken,
            isCommaToken(prevToken) || ignoredTokens.has(commaToken)
              ? null
              : prevToken,
            isCommaToken(nextToken) || ignoredTokens.has(commaToken)
              ? null
              : nextToken,
          );
        });
      },
    };
  },
});
