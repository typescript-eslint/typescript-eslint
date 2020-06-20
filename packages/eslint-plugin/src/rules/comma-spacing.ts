import {
  TSESTree,
  AST_TOKEN_TYPES,
} from '@typescript-eslint/experimental-utils';
import {
  isClosingParenToken,
  isCommaToken,
  isTokenOnSameLine,
  createRule,
} from '../util';

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
    const ignoredTokens = new Set<TSESTree.PunctuatorToken>();

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
          token = sourceCode.getTokenAfter(previousToken!);
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
      commaToken: TSESTree.PunctuatorToken,
      prevToken: TSESTree.Token | TSESTree.Comment | null,
      nextToken: TSESTree.Token | TSESTree.Comment | null,
    ): void {
      if (
        prevToken &&
        isTokenOnSameLine(prevToken, commaToken) &&
        spaceBefore !== sourceCode.isSpaceBetweenTokens(prevToken, commaToken)
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
        spaceAfter !== sourceCode.isSpaceBetweenTokens(commaToken, nextToken)
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

          const prevToken = tokensAndComments[i - 1];
          const nextToken = tokensAndComments[i + 1];

          validateCommaSpacing(
            token,
            isCommaToken(prevToken) || ignoredTokens.has(token)
              ? null
              : prevToken,
            isCommaToken(nextToken) || ignoredTokens.has(token)
              ? null
              : nextToken,
          );
        });
      },
    };
  },
});
