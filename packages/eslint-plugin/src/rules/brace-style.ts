import { TSESTree } from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/brace-style';
import {
  InferOptionsTypeFromRule,
  InferMessageIdsTypeFromRule,
  createRule,
  isTokenOnSameLine,
} from '../util';

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'brace-style',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent brace style for blocks',
      category: 'Stylistic Issues',
      recommended: false,
      extendsBaseRule: true,
    },
    messages: baseRule.meta.messages,
    fixable: baseRule.meta.fixable,
    schema: baseRule.meta.schema,
  },
  defaultOptions: ['1tbs'],
  create(context) {
    const [
      style,
      { allowSingleLine } = { allowSingleLine: false },
    ] = context.options;

    const isAllmanStyle = style === 'allman';
    const sourceCode = context.getSourceCode();
    const rules = baseRule.create(context);

    /**
     * Checks a pair of curly brackets based on the user's config
     */
    function validateCurlyPair(
      openingCurlyToken: TSESTree.Token,
      closingCurlyToken: TSESTree.Token,
    ): void {
      if (
        allowSingleLine &&
        isTokenOnSameLine(openingCurlyToken, closingCurlyToken)
      ) {
        return;
      }

      const tokenBeforeOpeningCurly = sourceCode.getTokenBefore(
        openingCurlyToken,
      )!;
      const tokenBeforeClosingCurly = sourceCode.getTokenBefore(
        closingCurlyToken,
      )!;
      const tokenAfterOpeningCurly = sourceCode.getTokenAfter(
        openingCurlyToken,
      )!;

      if (
        !isAllmanStyle &&
        !isTokenOnSameLine(tokenBeforeOpeningCurly, openingCurlyToken)
      ) {
        context.report({
          node: openingCurlyToken,
          messageId: 'nextLineOpen',
          fix: fixer => {
            const textRange: TSESTree.Range = [
              tokenBeforeOpeningCurly.range[1],
              openingCurlyToken.range[0],
            ];
            const textBetween = sourceCode.text.slice(
              textRange[0],
              textRange[1],
            );

            if (textBetween.trim()) {
              return null;
            }

            return fixer.replaceTextRange(textRange, ' ');
          },
        });
      }

      if (
        isAllmanStyle &&
        isTokenOnSameLine(tokenBeforeOpeningCurly, openingCurlyToken)
      ) {
        context.report({
          node: openingCurlyToken,
          messageId: 'sameLineOpen',
          fix: fixer => fixer.insertTextBefore(openingCurlyToken, '\n'),
        });
      }

      if (
        isTokenOnSameLine(openingCurlyToken, tokenAfterOpeningCurly) &&
        tokenAfterOpeningCurly !== closingCurlyToken
      ) {
        context.report({
          node: openingCurlyToken,
          messageId: 'blockSameLine',
          fix: fixer => fixer.insertTextAfter(openingCurlyToken, '\n'),
        });
      }

      if (
        isTokenOnSameLine(tokenBeforeClosingCurly, closingCurlyToken) &&
        tokenBeforeClosingCurly !== openingCurlyToken
      ) {
        context.report({
          node: closingCurlyToken,
          messageId: 'singleLineClose',
          fix: fixer => fixer.insertTextBefore(closingCurlyToken, '\n'),
        });
      }
    }

    return {
      ...rules,
      'TSInterfaceBody, TSModuleBlock'(
        node: TSESTree.TSModuleBlock | TSESTree.TSInterfaceBody,
      ): void {
        const openingCurly = sourceCode.getFirstToken(node)!;
        const closingCurly = sourceCode.getLastToken(node)!;

        validateCurlyPair(openingCurly, closingCurly);
      },
      TSEnumDeclaration(node): void {
        const closingCurly = sourceCode.getLastToken(node)!;
        const openingCurly = sourceCode.getTokenBefore(
          node.members.length ? node.members[0] : closingCurly,
        )!;

        validateCurlyPair(openingCurly, closingCurly);
      },
    };
  },
});
