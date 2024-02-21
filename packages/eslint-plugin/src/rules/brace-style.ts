/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { TSESTree } from '@typescript-eslint/utils';

import type {
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
} from '../util';
import { createRule, isTokenOnSameLine } from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('brace-style');

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'brace-style',
  meta: {
    deprecated: true,
    replacedBy: ['@stylistic/ts/brace-style'],
    type: 'layout',
    docs: {
      description: 'Enforce consistent brace style for blocks',
      extendsBaseRule: true,
    },
    messages: baseRule.meta.messages,
    fixable: baseRule.meta.fixable,
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
  },
  defaultOptions: ['1tbs'],
  create(context) {
    const [style, { allowSingleLine } = { allowSingleLine: false }] =
      // eslint-disable-next-line no-restricted-syntax -- Use raw options for extended rules.
      context.options;

    const isAllmanStyle = style === 'allman';

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

      const tokenBeforeOpeningCurly =
        context.sourceCode.getTokenBefore(openingCurlyToken)!;
      const tokenBeforeClosingCurly =
        context.sourceCode.getTokenBefore(closingCurlyToken)!;
      const tokenAfterOpeningCurly =
        context.sourceCode.getTokenAfter(openingCurlyToken)!;

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
            const textBetween = context.sourceCode.text.slice(
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
        node: TSESTree.TSInterfaceBody | TSESTree.TSModuleBlock,
      ): void {
        const openingCurly = context.sourceCode.getFirstToken(node)!;
        const closingCurly = context.sourceCode.getLastToken(node)!;

        validateCurlyPair(openingCurly, closingCurly);
      },
      TSEnumDeclaration(node): void {
        const closingCurly = context.sourceCode.getLastToken(node)!;
        const openingCurly = context.sourceCode.getTokenBefore(
          node.members.length ? node.members[0] : closingCurly,
        )!;

        validateCurlyPair(openingCurly, closingCurly);
      },
    };
  },
});
