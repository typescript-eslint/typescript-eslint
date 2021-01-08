import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/object-curly-spacing';
import {
  createRule,
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
  isClosingBraceToken,
  isClosingBracketToken,
  isTokenOnSameLine,
} from '../util';

export type Options = InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = InferMessageIdsTypeFromRule<typeof baseRule>;

export default createRule<Options, MessageIds>({
  name: 'object-curly-spacing',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent spacing inside braces',
      category: 'Stylistic Issues',
      recommended: false,
      extendsBaseRule: true,
    },
    messages: {
      requireSpaceBefore: "A space is required before '{{token}}'.",
      requireSpaceAfter: "A space is required after '{{token}}'.",
      unexpectedSpaceBefore: "There should be no space before '{{token}}'.",
      unexpectedSpaceAfter: "There should be no space after '{{token}}'.",
    },
    fixable: baseRule.meta.fixable,
    schema: baseRule.meta.schema,
  },
  defaultOptions: ['never'],
  create(context) {
    const spaced = context.options[0] === 'always',
      sourceCode = context.getSourceCode();

    /**
     * Determines whether an option is set, relative to the spacing option.
     * If spaced is "always", then check whether option is set to false.
     * If spaced is "never", then check whether option is set to true.
     * @param {Object} option The option to exclude.
     * @returns {boolean} Whether or not the property is excluded.
     */
    function isOptionSet(
      option: 'arraysInObjects' | 'objectsInObjects',
    ): boolean {
      return context.options[1]
        ? context.options[1][option] === !spaced
        : false;
    }

    const options = {
      spaced,
      arraysInObjectsException: isOptionSet('arraysInObjects'),
      objectsInObjectsException: isOptionSet('objectsInObjects'),
    };

    //--------------------------------------------------------------------------
    // Helpers
    //--------------------------------------------------------------------------

    /**
     * Reports that there shouldn't be a space after the first token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportNoBeginningSpace(
      node: TSESTree.TSTypeLiteral,
      token: TSESTree.Token,
    ): void {
      const nextToken = context
        .getSourceCode()
        .getTokenAfter(token, { includeComments: true })!;

      context.report({
        node,
        loc: { start: token.loc.end, end: nextToken.loc.start },
        messageId: 'unexpectedSpaceAfter',
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.removeRange([token.range[1], nextToken.range[0]]);
        },
      });
    }

    /**
     * Reports that there shouldn't be a space before the last token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportNoEndingSpace(
      node: TSESTree.TSTypeLiteral,
      token: TSESTree.Token,
    ): void {
      const previousToken = context
        .getSourceCode()
        .getTokenBefore(token, { includeComments: true })!;

      context.report({
        node,
        loc: { start: previousToken.loc.end, end: token.loc.start },
        messageId: 'unexpectedSpaceBefore',
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.removeRange([previousToken.range[1], token.range[0]]);
        },
      });
    }

    /**
     * Reports that there should be a space after the first token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportRequiredBeginningSpace(
      node: TSESTree.TSTypeLiteral,
      token: TSESTree.Token,
    ): void {
      context.report({
        node,
        loc: token.loc,
        messageId: 'requireSpaceAfter',
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.insertTextAfter(token, ' ');
        },
      });
    }

    /**
     * Reports that there should be a space before the last token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportRequiredEndingSpace(
      node: TSESTree.TSTypeLiteral,
      token: TSESTree.Token,
    ): void {
      context.report({
        node,
        loc: token.loc,
        messageId: 'requireSpaceBefore',
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.insertTextBefore(token, ' ');
        },
      });
    }

    /**
     * Determines if spacing in curly braces is valid.
     * @param node The AST node to check.
     * @param first The first token to check (should be the opening brace)
     * @param second The second token to check (should be first after the opening brace)
     * @param penultimate The penultimate token to check (should be last before closing brace)
     * @param last The last token to check (should be closing brace)
     */
    function validateBraceSpacing(
      node: TSESTree.TSTypeLiteral,
      first: TSESTree.Token,
      second: TSESTree.Token | TSESTree.Comment,
      penultimate: TSESTree.Token | TSESTree.Comment,
      last: TSESTree.Token,
    ): void {
      if (isTokenOnSameLine(first, second)) {
        const firstSpaced = sourceCode.isSpaceBetween(first, second);
        const secondType = sourceCode.getNodeByRangeIndex(second.range[0])!
          .type;

        const openingCurlyBraceMustBeSpaced =
          options.arraysInObjectsException &&
          secondType === AST_NODE_TYPES.TSIndexSignature
            ? !options.spaced
            : options.spaced;

        if (openingCurlyBraceMustBeSpaced && !firstSpaced) {
          reportRequiredBeginningSpace(node, first);
        }
        if (
          !openingCurlyBraceMustBeSpaced &&
          firstSpaced &&
          second.type !== AST_TOKEN_TYPES.Line
        ) {
          reportNoBeginningSpace(node, first);
        }
      }

      if (isTokenOnSameLine(penultimate, last)) {
        const shouldCheckPenultimate =
          (options.arraysInObjectsException &&
            isClosingBracketToken(penultimate)) ||
          (options.objectsInObjectsException &&
            isClosingBraceToken(penultimate));
        const penultimateType =
          shouldCheckPenultimate &&
          sourceCode.getNodeByRangeIndex(penultimate.range[0])!.type;

        const closingCurlyBraceMustBeSpaced =
          (options.arraysInObjectsException &&
            penultimateType === AST_NODE_TYPES.TSTupleType) ||
          (options.objectsInObjectsException &&
            penultimateType === AST_NODE_TYPES.TSTypeLiteral)
            ? !options.spaced
            : options.spaced;

        const lastSpaced = sourceCode.isSpaceBetween(penultimate, last);

        if (closingCurlyBraceMustBeSpaced && !lastSpaced) {
          reportRequiredEndingSpace(node, last);
        }
        if (!closingCurlyBraceMustBeSpaced && lastSpaced) {
          reportNoEndingSpace(node, last);
        }
      }
    }

    /**
     * Gets '}' token of an object node.
     *
     * Because the last token of object patterns might be a type annotation,
     * this traverses tokens preceded by the last property, then returns the
     * first '}' token.
     * @param node The node to get. This node is an
     *      ObjectExpression or an ObjectPattern. And this node has one or
     *      more properties.
     * @returns '}' token.
     */
    function getClosingBraceOfObject(
      node: TSESTree.TSTypeLiteral,
    ): TSESTree.Token | null {
      const lastProperty = node.members[node.members.length - 1];

      return sourceCode.getTokenAfter(lastProperty, isClosingBraceToken);
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    const rules = baseRule.create(context);
    return {
      ...rules,
      TSTypeLiteral(node: TSESTree.TSTypeLiteral): void {
        if (node.members.length === 0) {
          return;
        }

        const first = sourceCode.getFirstToken(node)!,
          last = getClosingBraceOfObject(node)!,
          second = sourceCode.getTokenAfter(first, { includeComments: true })!,
          penultimate = sourceCode.getTokenBefore(last, {
            includeComments: true,
          })!;

        validateBraceSpacing(node, first, second, penultimate, last);
      },
    };
  },
});
