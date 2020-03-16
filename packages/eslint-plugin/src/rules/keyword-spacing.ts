import baseRule from 'eslint/lib/rules/keyword-spacing';
import { TSESTree } from '@typescript-eslint/experimental-utils';
import { isTokenOnSameLine } from '../util/astUtils';
import keywords from 'eslint/lib/rules/utils/keywords';

import * as util from '../util';

export type Option = Partial<{
  before: boolean;
  after: boolean;
}>;

export type RootOption = Option & {
  overrides?: { [keywordName: string]: Option };
};

export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

const PREV_TOKEN = /^[)\]}>]$/u;
const NEXT_TOKEN = /^(?:[([{<~!]|\+\+?|--?)$/u;
const TEMPLATE_OPEN_PAREN = /\$\{$/u;
const TEMPLATE_CLOSE_PAREN = /^\}/u;
const CHECK_TYPE = /^(?:JSXElement|RegularExpression|String|Template)$/u;
const KEYS = keywords.concat([
  'as',
  'async',
  'await',
  'from',
  'get',
  'let',
  'of',
  'set',
  'yield',
]);

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Checks whether or not a given token is a "Template" token ends with "${".
 * @param token A token to check.
 * @returns `true` if the token is a "Template" token ends with "${".
 */
function isOpenParenOfTemplate(token: TSESTree.Token) {
  return token.type === 'Template' && TEMPLATE_OPEN_PAREN.test(token.value);
}

/**
 * Checks whether or not a given token is a "Template" token starts with "}".
 * @param token A token to check.
 * @returns `true` if the token is a "Template" token starts with "}".
 */
function isCloseParenOfTemplate(token: TSESTree.Token) {
  return token.type === 'Template' && TEMPLATE_CLOSE_PAREN.test(token.value);
}

export default util.createRule<Options, MessageIds>({
  name: 'keyword-spacing',
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce consistent spacing before and after keywords',
      category: 'Stylistic Issues',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [],

  create(context) {
    const sourceCode = context.getSourceCode();
    const baseRules = baseRule.create(context);

    /**
     * Reports a given token if there are not space(s) before the token.
     * @param token A token to report.
     * @param pattern A pattern of the previous token to check.
     */
    function expectSpaceBefore(token: TSESTree.Token, pattern: RegExp) {
      const prevToken = sourceCode.getTokenBefore(token);

      if (
        prevToken &&
        (CHECK_TYPE.test(prevToken.type) || pattern.test(prevToken.value)) &&
        !isOpenParenOfTemplate(prevToken) &&
        isTokenOnSameLine(prevToken, token) &&
        !sourceCode.isSpaceBetweenTokens(prevToken, token)
      ) {
        context.report({
          loc: token.loc.start,
          messageId: 'expectedBefore',
          data: {
            value: token.value,
          },
          fix(fixer) {
            return fixer.insertTextBefore(token, ' ');
          },
        });
      }
    }

    /**
     * Reports a given token if there are space(s) before the token.
     * @param token A token to report.
     * @param pattern A pattern of the previous token to check.
     */
    function unexpectSpaceBefore(token: TSESTree.Token, pattern: RegExp) {
      const prevToken = sourceCode.getTokenBefore(token);

      if (
        prevToken &&
        (CHECK_TYPE.test(prevToken.type) || pattern.test(prevToken.value)) &&
        !isOpenParenOfTemplate(prevToken) &&
        isTokenOnSameLine(prevToken, token) &&
        sourceCode.isSpaceBetweenTokens(prevToken, token)
      ) {
        context.report({
          loc: token.loc.start,
          messageId: 'unexpectedBefore',
          data: {
            value: token.value,
          },
          fix(fixer) {
            return fixer.removeRange([prevToken.range[1], token.range[0]]);
          },
        });
      }
    }

    /**
     * Reports a given token if there are not space(s) after the token.
     * @param token A token to report.
     * @param pattern A pattern of the next token to check.
     */
    function expectSpaceAfter(token: TSESTree.Token, pattern: RegExp) {
      const nextToken = sourceCode.getTokenAfter(token);

      if (
        nextToken &&
        (CHECK_TYPE.test(nextToken.type) || pattern.test(nextToken.value)) &&
        !isCloseParenOfTemplate(nextToken) &&
        isTokenOnSameLine(token, nextToken) &&
        !sourceCode.isSpaceBetweenTokens(token, nextToken)
      ) {
        context.report({
          loc: token.loc.start,
          messageId: 'expectedAfter',
          data: {
            value: token.value,
          },
          fix(fixer) {
            return fixer.insertTextAfter(token, ' ');
          },
        });
      }
    }

    /**
     * Reports a given token if there are space(s) after the token.
     * @param token A token to report.
     * @param pattern A pattern of the next token to check.
     */
    function unexpectSpaceAfter(token: TSESTree.Token, pattern: RegExp) {
      const nextToken = sourceCode.getTokenAfter(token);

      if (
        nextToken &&
        (CHECK_TYPE.test(nextToken.type) || pattern.test(nextToken.value)) &&
        !isCloseParenOfTemplate(nextToken) &&
        isTokenOnSameLine(token, nextToken) &&
        sourceCode.isSpaceBetweenTokens(token, nextToken)
      ) {
        context.report({
          loc: token.loc.start,
          messageId: 'unexpectedAfter',
          data: {
            value: token.value,
          },
          fix(fixer) {
            return fixer.removeRange([token.range[1], nextToken.range[0]]);
          },
        });
      }
    }

    /**
     * Parses the option object and determines check methods for each keyword.
     * @param options The option object to parse.
     * @returns Normalized option object.
     *      Keys are keywords (there are for every keyword).
     *      Values are instances of `{"before": function, "after": function}`.
     */
    function parseOptions(
      options: RootOption = {},
    ): { [keyword: string]: { before: Function; after: Function } } {
      const before = options.before !== false;
      const after = options.after !== false;
      const defaultValue = {
        before: before ? expectSpaceBefore : unexpectSpaceBefore,
        after: after ? expectSpaceAfter : unexpectSpaceAfter,
      };
      const overrides = (options && options.overrides) || {};
      const retv = Object.create(null);

      for (let i = 0; i < KEYS.length; ++i) {
        const key = KEYS[i];
        const override = overrides[key];

        if (override) {
          const thisBefore = 'before' in override ? override.before : before;
          const thisAfter = 'after' in override ? override.after : after;

          retv[key] = {
            before: thisBefore ? expectSpaceBefore : unexpectSpaceBefore,
            after: thisAfter ? expectSpaceAfter : unexpectSpaceAfter,
          };
        } else {
          retv[key] = defaultValue;
        }
      }
      return retv;
    }

    const checkMethodMap = parseOptions(context.options[0]);

    /**
     * Reports a given token if usage of spacing followed by the token is invalid.
     * @param token A token to report.
     * @param pattern A pattern of the previous token to check.
     */
    function checkSpacingBefore(token: TSESTree.Token, pattern?: RegExp) {
      checkMethodMap[token.value].before(token, pattern || PREV_TOKEN);
    }

    /**
     * Reports a given token if usage of spacing preceded by the token is invalid.
     * @param token A token to report.
     * @param pattern A pattern of the next token to check.
     */
    function checkSpacingAfter(token: TSESTree.Token, pattern?: RegExp) {
      checkMethodMap[token.value].after(token, pattern || NEXT_TOKEN);
    }

    /**
     * Reports a given token if usage of spacing around the token is invalid.
     * @param token A token to report.
     */
    function checkSpacingAround(token: TSESTree.Token) {
      checkSpacingBefore(token);
      checkSpacingAfter(token);
    }

    /**
     * Reports `as` keyword of a given node if usage of spacing before
     * this keyword is invalid.
     * @param node A node to report.
     */
    function checkSpacingForAsExpression(node: TSESTree.TSAsExpression) {
      const token = sourceCode.getTokenAfter(node.expression)!; // get the `as` identifier.
      checkSpacingAround(token);
    }

    return {
      ...baseRules,
      TSAsExpression: checkSpacingForAsExpression,
    };
  },
});
