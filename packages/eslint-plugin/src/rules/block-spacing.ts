import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('block-spacing');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'block-spacing',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent spacing before and after keywords',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: ['always'],

  create(context, [whenToApplyOption]) {
    const sourceCode = context.getSourceCode();
    const baseRules = baseRule.create(context);
    const always = whenToApplyOption !== 'never';
    const messageId = always ? 'missing' : 'extra';
    /**
     * Gets the open brace token from a given node.
     * @returns The token of the open brace.
     */
    function getOpenBrace(
      node: TSESTree.TSInterfaceBody | TSESTree.TSTypeLiteral,
    ):
      | TSESTree.BooleanToken
      | TSESTree.IdentifierToken
      | TSESTree.JSXIdentifierToken
      | TSESTree.JSXTextToken
      | TSESTree.KeywordToken
      | TSESTree.NullToken
      | TSESTree.NumericToken
      | TSESTree.PunctuatorToken
      | TSESTree.RegularExpressionToken
      | TSESTree.StringToken
      | TSESTree.TemplateToken {
      if (node.type === AST_NODE_TYPES.TSInterfaceBody) {
        return sourceCode.getFirstToken(node, { skip: 0 })!;
      }
      if (node.type === AST_NODE_TYPES.TSTypeLiteral) {
        return sourceCode.getFirstToken(node, { skip: 0 })!;
      }

      return sourceCode.getFirstToken(node)!;
    }

    /**
     * Checks whether or not:
     *   - given tokens are on same line.
     *   - there is/isn't a space between given tokens.
     * @param left A token to check.
     * @param right The token which is next to `left`.
     * @returns
     *    When the option is `"always"`, `true` if there are one or more spaces between given tokens.
     *    When the option is `"never"`, `true` if there are not any spaces between given tokens.
     *    If given tokens are not on same line, it's always `true`.
     */
    function isValid(left: TSESTree.Token, right: TSESTree.Token): boolean {
      // console.log({
      //   'sourceCode.text,': sourceCode.text,
      //   'whenToApplyOption,': whenToApplyOption,
      //   'always,': always,
      //   'messageId,': messageId,
      //   'left,': left,
      //   'right,': right,
      //   '!util.isTokenOnSameLine(left, right),': !util.isTokenOnSameLine(left, right),
      //   'sourceCode.isSpaceBetween!(left, right) === always': sourceCode.isSpaceBetween!(left, right) === always
      // });
      return (
        !util.isTokenOnSameLine(left, right) ||
        sourceCode.isSpaceBetween!(left, right) === always
      );
    }

    /**
     * Checks and reports invalid spacing style inside braces.
     * @param {ASTNode} node A BlockStatement/StaticBlock/SwitchStatement node to check.
     * @returns
     */
    function checkSpacingInsideBraces(
      node: TSESTree.TSInterfaceBody | TSESTree.TSTypeLiteral,
    ): void {
      // Gets braces and the first/last token of content.
      const openBrace = getOpenBrace(node);
      const closeBrace = sourceCode.getLastToken(node)!;
      const firstToken = sourceCode.getTokenAfter(openBrace, {
        includeComments: true,
      })!;
      const lastToken = sourceCode.getTokenBefore(closeBrace, {
        includeComments: true,
      })!;

      // Skip if the node is invalid or empty.
      if (
        openBrace.type !== AST_TOKEN_TYPES.Punctuator ||
        openBrace.value !== '{' ||
        closeBrace.type !== AST_TOKEN_TYPES.Punctuator ||
        closeBrace.value !== '}' ||
        firstToken === closeBrace
      ) {
        return;
      }

      // Skip line comments for option never
      if (!always && firstToken.type === AST_TOKEN_TYPES.Line) {
        return;
      }

      // Check.
      if (!isValid(openBrace, firstToken)) {
        let loc = openBrace.loc;

        if (messageId === 'extra') {
          loc = {
            start: openBrace.loc.end,
            end: firstToken.loc.start,
          };
        }

        context.report({
          node,
          loc,
          messageId,
          data: {
            location: 'after',
            token: openBrace.value,
          },
          fix(fixer) {
            if (always) {
              return fixer.insertTextBefore(firstToken, ' ');
            }

            return fixer.removeRange([openBrace.range[1], firstToken.range[0]]);
          },
        });
      }
      if (!isValid(lastToken, closeBrace)) {
        let loc = closeBrace.loc;

        if (messageId === 'extra') {
          loc = {
            start: lastToken.loc.end,
            end: closeBrace.loc.start,
          };
        }
        context.report({
          node,
          loc,
          messageId,
          data: {
            location: 'before',
            token: closeBrace.value,
          },
          fix(fixer) {
            if (always) {
              return fixer.insertTextAfter(lastToken, ' ');
            }

            return fixer.removeRange([lastToken.range[1], closeBrace.range[0]]);
          },
        });
      }
    }
    return {
      ...baseRules,
      TSInterfaceBody: checkSpacingInsideBraces,
      TSTypeLiteral: checkSpacingInsideBraces,

      // TSInterfaceBody: baseRules.BlockStatement as never,
      // TSTypeLiteral: baseRules.BlockStatement as never,
    };
  },
});
