import keywords from 'eslint/lib/rules/utils/keywords';
import * as util from '../util';
import { TSESTree } from '@typescript-eslint/experimental-utils';
import { JSONSchema4 } from 'json-schema';
import {
  isTokenOnSameLine,
  isKeywordToken,
} from '../util/astUtils';
import { isNotOpeningParenToken } from 'eslint-utils';

export type Option = Partial<{
  before: boolean;
  after: boolean;
}>;

export type RootOption = Option & {
  overrides?: { [keywordName: string]: Option };
};

export type Options = [RootOption];
export type MessageIds =
  | 'expectedBefore'
  | 'expectedAfter'
  | 'unexpectedBefore'
  | 'unexpectedAfter';

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const PREV_TOKEN = /^[)\]}>]$/u;
const NEXT_TOKEN = /^(?:[([{<~!]|\+\+?|--?)$/u;
const PREV_TOKEN_M = /^[)\]}>*]$/u;
const NEXT_TOKEN_M = /^[{*]$/u;
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

// check duplications.
(function() {
  KEYS.sort();
  for (let i = 1; i < KEYS.length; ++i) {
    if (KEYS[i] === KEYS[i - 1]) {
      throw new Error(`Duplication was found in the keyword list: ${KEYS[i]}`);
    }
  }
})();

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
    schema: [
      {
        type: 'object',
        properties: {
          before: { type: 'boolean', default: true },
          after: { type: 'boolean', default: true },
          overrides: {
            type: 'object',
            properties: KEYS.reduce((retv: JSONSchema4, key) => {
              retv[key] = {
                type: 'object',
                properties: {
                  before: { type: 'boolean' },
                  after: { type: 'boolean' },
                },
                additionalProperties: false,
              };
              return retv;
            }, {}),
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedBefore: 'Expected space(s) before "{{value}}".',
      expectedAfter: 'Expected space(s) after "{{value}}".',
      unexpectedBefore: 'Unexpected space(s) before "{{value}}".',
      unexpectedAfter: 'Unexpected space(s) after "{{value}}".',
    },
  },
  defaultOptions: [{ before: true, after: true }],

  create(context) {
    const sourceCode = context.getSourceCode();
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
     * Reports the first token of a given node if the first token is a keyword
     * and usage of spacing around the token is invalid.
     * @param node A node to report.
     */
    function checkSpacingAroundFirstToken(node: TSESTree.Node) {
      const firstToken = node && sourceCode.getFirstToken(node);

      if (firstToken && firstToken.type === 'Keyword') {
        checkSpacingAround(firstToken);
      }
    }

    /**
     * Reports the first token of a given node if the first token is a keyword
     * and usage of spacing followed by the token is invalid.
     *
     * This is used for unary operators (e.g. `typeof`), `function`, and `super`.
     * Other rules are handling usage of spacing preceded by those keywords.
     * @param node A node to report.
     */
    function checkSpacingBeforeFirstToken(
      node:
        | TSESTree.NewExpression
        | TSESTree.Super
        | TSESTree.ThisExpression
        | TSESTree.UnaryExpression
        | TSESTree.YieldExpression,
    ) {
      const firstToken = node && sourceCode.getFirstToken(node);

      if (firstToken && firstToken.type === 'Keyword') {
        checkSpacingBefore(firstToken);
      }
    }

    /**
     * Reports the previous token of a given node if the token is a keyword and
     * usage of spacing around the token is invalid.
     * @param node A node to report.
     */
    function checkSpacingAroundTokenBefore(node: TSESTree.Node) {
      if (node) {
        const token = sourceCode.getTokenBefore(node, isKeywordToken)!;

        checkSpacingAround(token);
      }
    }

    /**
     * Reports `async` or `function` keywords of a given node if usage of
     * spacing around those keywords is invalid.
     * @param node A node to report.
     */
    function checkSpacingForFunction(
      node:
        | TSESTree.FunctionDeclaration
        | TSESTree.ArrowFunctionExpression
        | TSESTree.FunctionExpression,
    ) {
      const firstToken = node && sourceCode.getFirstToken(node);

      if (
        firstToken &&
        ((firstToken.type === 'Keyword' && firstToken.value === 'function') ||
          firstToken.value === 'async')
      ) {
        checkSpacingBefore(firstToken);
      }
    }

    /**
     * Reports `class` and `extends` keywords of a given node if usage of
     * spacing around those keywords is invalid.
     * @param node A node to report.
     */
    function checkSpacingForClass(
      node: TSESTree.ClassExpression | TSESTree.ClassDeclaration,
    ) {
      checkSpacingAroundFirstToken(node);
      checkSpacingAroundTokenBefore(node.superClass!);
    }

    /**
     * Reports `if` and `else` keywords of a given node if usage of spacing
     * around those keywords is invalid.
     * @param node A node to report.
     */
    function checkSpacingForIfStatement(node: TSESTree.IfStatement) {
      checkSpacingAroundFirstToken(node);
      checkSpacingAroundTokenBefore((node as any).alternate);
    }

    /**
     * Reports `try`, `catch`, and `finally` keywords of a given node if usage
     * of spacing around those keywords is invalid.
     * @param node A node to report.
     */
    function checkSpacingForTryStatement(node: TSESTree.TryStatement) {
      checkSpacingAroundFirstToken(node);
      checkSpacingAroundFirstToken(node.handler!);
      checkSpacingAroundTokenBefore(node.finalizer);
    }

    /**
     * Reports `do` and `while` keywords of a given node if usage of spacing
     * around those keywords is invalid.
     * @param node A node to report.
     */
    function checkSpacingForDoWhileStatement(node: TSESTree.DoWhileStatement) {
      checkSpacingAroundFirstToken(node);
      checkSpacingAroundTokenBefore(node.test);
    }

    /**
     * Reports `for` and `in` keywords of a given node if usage of spacing
     * around those keywords is invalid.
     * @param node A node to report.
     */
    function checkSpacingForForInStatement(node: TSESTree.ForInStatement) {
      checkSpacingAroundFirstToken(node);
      checkSpacingAroundTokenBefore(node.right);
    }

    /**
     * Reports `for` and `of` keywords of a given node if usage of spacing
     * around those keywords is invalid.
     * @param node A node to report.
     */
    function checkSpacingForForOfStatement(node: TSESTree.ForOfStatement) {
      if (node.await) {
        checkSpacingBefore(sourceCode.getFirstToken(node, 0)!);
        checkSpacingAfter(sourceCode.getFirstToken(node, 1)!);
      } else {
        checkSpacingAroundFirstToken(node);
      }
      checkSpacingAround(
        sourceCode.getTokenBefore(node.right, isNotOpeningParenToken)!,
      );
    }

    /**
     * Reports `import`, `export`, `as`, and `from` keywords of a given node if
     * usage of spacing around those keywords is invalid.
     *
     * This rule handles the `*` token in module declarations.
     *
     *     import*as A from "./a"; /*error Expected space(s) after "import".
     *                               error Expected space(s) before "as".
     * @param node A node to report.
     */
    function checkSpacingForModuleDeclaration(
      node:
        | TSESTree.ExportNamedDeclaration
        | TSESTree.ExportDefaultDeclaration
        | TSESTree.ExportAllDeclaration
        | TSESTree.ImportDeclaration,
    ) {
      const firstToken = sourceCode.getFirstToken(node)!;

      checkSpacingBefore(firstToken, PREV_TOKEN_M);
      checkSpacingAfter(firstToken, NEXT_TOKEN_M);

      if (node.type === 'ExportDefaultDeclaration') {
        checkSpacingAround(sourceCode.getTokenAfter(firstToken)!);
      }

      if ((node as any).source) {
        const fromToken = sourceCode.getTokenBefore((node as any).source)!;

        checkSpacingBefore(fromToken, PREV_TOKEN_M);
        checkSpacingAfter(fromToken, NEXT_TOKEN_M);
      }
    }

    /**
     * Reports `as` keyword of a given node if usage of spacing around this
     * keyword is invalid.
     * @param node A node to report.
     */
    function checkSpacingForImportNamespaceSpecifier(node: TSESTree.Node) {
      const asToken = sourceCode.getFirstToken(node, 1)!;

      checkSpacingBefore(asToken, PREV_TOKEN_M);
    }
    /**
     * Reports `static`, `get`, and `set` keywords of a given node if usage of
     * spacing around those keywords is invalid.
     * @param node A node to report.
     */
    function checkSpacingForProperty(
      node: TSESTree.MethodDefinition | TSESTree.Property,
    ) {
      if ((node as any).static) {
        checkSpacingAroundFirstToken(node);
      }
      if (
        node.kind === 'get' ||
        node.kind === 'set' ||
        (((node as any).method || node.type === 'MethodDefinition') &&
          (node as any).value.async)
      ) {
        const token = sourceCode.getTokenBefore(node.key, tok => {
          switch (tok.value) {
            case 'get':
            case 'set':
            case 'async':
              return true;
            default:
              return false;
          }
        });

        if (!token) {
          throw new Error(
            'Failed to find token get, set, or async beside method name',
          );
        }

        checkSpacingAround(token);
      }
    }

    /**
     * Reports `await` keyword of a given node if usage of spacing before
     * this keyword is invalid.
     * @param node A node to report.
     */
    function checkSpacingForAwaitExpression(node: TSESTree.AwaitExpression) {
      checkSpacingBefore(sourceCode.getFirstToken(node)!);
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
      // Statements
      DebuggerStatement: checkSpacingAroundFirstToken,
      WithStatement: checkSpacingAroundFirstToken,

      // Statements - Control flow
      BreakStatement: checkSpacingAroundFirstToken,
      ContinueStatement: checkSpacingAroundFirstToken,
      ReturnStatement: checkSpacingAroundFirstToken,
      ThrowStatement: checkSpacingAroundFirstToken,
      TryStatement: checkSpacingForTryStatement,

      // Statements - Choice
      IfStatement: checkSpacingForIfStatement,
      SwitchStatement: checkSpacingAroundFirstToken,
      SwitchCase: checkSpacingAroundFirstToken,

      // Statements - Loops
      DoWhileStatement: checkSpacingForDoWhileStatement,
      ForInStatement: checkSpacingForForInStatement,
      ForOfStatement: checkSpacingForForOfStatement,
      ForStatement: checkSpacingAroundFirstToken,
      WhileStatement: checkSpacingAroundFirstToken,

      // Statements - Declarations
      ClassDeclaration: checkSpacingForClass,
      ExportNamedDeclaration: checkSpacingForModuleDeclaration,
      ExportDefaultDeclaration: checkSpacingForModuleDeclaration,
      ExportAllDeclaration: checkSpacingForModuleDeclaration,
      FunctionDeclaration: checkSpacingForFunction,
      ImportDeclaration: checkSpacingForModuleDeclaration,
      VariableDeclaration: checkSpacingAroundFirstToken,

      // Expressions
      ArrowFunctionExpression: checkSpacingForFunction,
      AwaitExpression: checkSpacingForAwaitExpression,
      ClassExpression: checkSpacingForClass,
      FunctionExpression: checkSpacingForFunction,
      NewExpression: checkSpacingBeforeFirstToken,
      Super: checkSpacingBeforeFirstToken,
      ThisExpression: checkSpacingBeforeFirstToken,
      UnaryExpression: checkSpacingBeforeFirstToken,
      YieldExpression: checkSpacingBeforeFirstToken,

      // Others
      ImportNamespaceSpecifier: checkSpacingForImportNamespaceSpecifier,
      MethodDefinition: checkSpacingForProperty,
      Property: checkSpacingForProperty,
      TSAsExpression: checkSpacingForAsExpression,
    };
  },
});
