import * as util from '../util';
import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESTree,
} from '@typescript-eslint/utils';
import { getESLintCoreRule } from '../util/getESLintCoreRule';

const baseRule = getESLintCoreRule('lines-around-comment');

export type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
export type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

const COMMENTS_IGNORE_PATTERN =
  /^\s*(?:eslint|jshint\s+|jslint\s+|istanbul\s+|globals?\s+|exported\s+|jscs)/u;

/**
 * Return an array with with any line numbers that are empty.
 */
function getEmptyLineNums(lines: string[]): number[] {
  const emptyLines = lines
    .map((line, i) => ({
      code: line.trim(),
      num: i + 1,
    }))
    .filter(line => !line.code)
    .map(line => line.num);

  return emptyLines;
}

/**
 * Return an array with with any line numbers that contain comments.
 */
function getCommentLineNums(comments: TSESTree.Comment[]): number[] {
  const lines: number[] = [];

  comments.forEach(token => {
    const start = token.loc.start.line;
    const end = token.loc.end.line;

    lines.push(start, end);
  });
  return lines;
}

export default util.createRule<Options, MessageIds>({
  name: 'lines-around-comment',
  meta: {
    type: 'layout',
    docs: {
      description: 'Require empty lines around comments',
      recommended: false,
      extendsBaseRule: true,
    },
    schema: {
      type: 'array',
      items: [
        {
          type: 'object',
          properties: {
            beforeBlockComment: {
              type: 'boolean',
              default: true,
            },
            afterBlockComment: {
              type: 'boolean',
              default: false,
            },
            beforeLineComment: {
              type: 'boolean',
              default: false,
            },
            afterLineComment: {
              type: 'boolean',
              default: false,
            },
            allowBlockStart: {
              type: 'boolean',
              default: false,
            },
            allowBlockEnd: {
              type: 'boolean',
              default: false,
            },
            allowClassStart: {
              type: 'boolean',
            },
            allowClassEnd: {
              type: 'boolean',
            },
            allowObjectStart: {
              type: 'boolean',
            },
            allowObjectEnd: {
              type: 'boolean',
            },
            allowArrayStart: {
              type: 'boolean',
            },
            allowArrayEnd: {
              type: 'boolean',
            },
            ignorePattern: {
              type: 'string',
            },
            applyDefaultIgnorePatterns: {
              type: 'boolean',
            },
          },
          additionalProperties: false,
        },
      ],
    },
    fixable: baseRule.meta.fixable,
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [
    {
      beforeBlockComment: true,
    },
  ],
  create(context, [_options]) {
    const options = _options!;
    const defaultIgnoreRegExp = COMMENTS_IGNORE_PATTERN;
    const customIgnoreRegExp = new RegExp(options.ignorePattern ?? '', 'u');

    const sourceCode = context.getSourceCode();
    const comments = sourceCode.getAllComments();

    const lines = sourceCode.lines;
    const numLines = lines.length + 1;
    const commentLines = getCommentLineNums(comments);
    const emptyLines = getEmptyLineNums(lines);
    const commentAndEmptyLines = new Set(commentLines.concat(emptyLines));

    /**
     * Returns whether or not comments are on lines starting with or ending with code
     */
    function codeAroundComment(token: TSESTree.Token): boolean {
      let currentToken: TSESTree.Token | null = token;

      do {
        currentToken = sourceCode.getTokenBefore(currentToken, {
          includeComments: true,
        });
      } while (currentToken && util.isCommentToken(currentToken));

      if (currentToken && util.isTokenOnSameLine(currentToken, token)) {
        return true;
      }

      currentToken = token;
      do {
        currentToken = sourceCode.getTokenAfter(currentToken, {
          includeComments: true,
        });
      } while (currentToken && util.isCommentToken(currentToken));

      if (currentToken && util.isTokenOnSameLine(token, currentToken)) {
        return true;
      }

      return false;
    }

    /**
     * Returns whether or not comments are inside a node type or not.
     */
    function isParentNodeType<T extends TSESTree.AST_NODE_TYPES>(
      parent: TSESTree.Node,
      nodeType: T,
    ): parent is Extract<TSESTree.Node, { type: T }> {
      return (
        parent.type === nodeType ||
        ('body' in parent &&
          !Array.isArray(parent.body) &&
          parent.body?.type === nodeType) ||
        ('consequent' in parent &&
          !Array.isArray(parent.consequent) &&
          parent.consequent.type === nodeType)
      );
    }

    /**
     * Returns the parent node that contains the given token.
     */
    function getParentNodeOfToken(token: TSESTree.Token): TSESTree.Node | null {
      const node = sourceCode.getNodeByRangeIndex(token.range[0]);

      /*
       * For the purpose of this rule, the comment token is in a `StaticBlock` node only
       * if it's inside the braces of that `StaticBlock` node.
       *
       * Example where this function returns `null`:
       *
       *   static
       *   // comment
       *   {
       *   }
       *
       * Example where this function returns `StaticBlock` node:
       *
       *   static
       *   {
       *   // comment
       *   }
       *
       */
      if (node && node.type === AST_NODE_TYPES.StaticBlock) {
        const openingBrace = sourceCode.getFirstToken(node, { skip: 1 })!; // skip the `static` token

        return token.range[0] >= openingBrace.range[0] ? node : null;
      }

      return node;
    }

    /**
     * Returns whether or not comments are at the parent start or not.
     */
    function isCommentAtParentStart(
      token: TSESTree.Token,
      nodeType: TSESTree.AST_NODE_TYPES,
    ): boolean {
      const parent = getParentNodeOfToken(token);

      if (parent && isParentNodeType(parent, nodeType)) {
        const parentStartNodeOrToken =
          parent.type === AST_NODE_TYPES.StaticBlock
            ? sourceCode.getFirstToken(parent, { skip: 1 })! // opening brace of the static block
            : parent;

        return (
          token.loc.start.line - parentStartNodeOrToken.loc.start.line === 1
        );
      }

      return false;
    }

    /**
     * Returns whether or not comments are at the parent end or not.
     */
    function isCommentAtParentEnd(
      token: TSESTree.Token,
      nodeType: TSESTree.AST_NODE_TYPES,
    ): boolean {
      const parent = getParentNodeOfToken(token);

      return (
        !!parent &&
        isParentNodeType(parent, nodeType) &&
        parent.loc.end.line - token.loc.end.line === 1
      );
    }

    /**
     * Returns whether or not comments are at the block start or not.
     */
    function isCommentAtBlockStart(token: TSESTree.Token): boolean {
      return (
        isCommentAtParentStart(token, AST_NODE_TYPES.ClassBody) ||
        isCommentAtParentStart(token, AST_NODE_TYPES.BlockStatement) ||
        isCommentAtParentStart(token, AST_NODE_TYPES.StaticBlock) ||
        isCommentAtParentStart(token, AST_NODE_TYPES.SwitchCase)
      );
    }

    /**
     * Returns whether or not comments are at the block end or not.
     */
    function isCommentAtBlockEnd(token: TSESTree.Token): boolean {
      return (
        isCommentAtParentEnd(token, AST_NODE_TYPES.ClassBody) ||
        isCommentAtParentEnd(token, AST_NODE_TYPES.BlockStatement) ||
        isCommentAtParentEnd(token, AST_NODE_TYPES.StaticBlock) ||
        isCommentAtParentEnd(token, AST_NODE_TYPES.SwitchCase) ||
        isCommentAtParentEnd(token, AST_NODE_TYPES.SwitchStatement)
      );
    }

    /**
     * Returns whether or not comments are at the class start or not.
     */
    function isCommentAtClassStart(token: TSESTree.Token): boolean {
      return isCommentAtParentStart(token, AST_NODE_TYPES.ClassBody);
    }

    /**
     * Returns whether or not comments are at the class end or not.
     */
    function isCommentAtClassEnd(token: TSESTree.Token): boolean {
      return isCommentAtParentEnd(token, AST_NODE_TYPES.ClassBody);
    }

    /**
     * Returns whether or not comments are at the object start or not.
     */
    function isCommentAtObjectStart(token: TSESTree.Token): boolean {
      return (
        isCommentAtParentStart(token, AST_NODE_TYPES.ObjectExpression) ||
        isCommentAtParentStart(token, AST_NODE_TYPES.ObjectPattern)
      );
    }

    /**
     * Returns whether or not comments are at the object end or not.
     */
    function isCommentAtObjectEnd(token: TSESTree.Token): boolean {
      return (
        isCommentAtParentEnd(token, AST_NODE_TYPES.ObjectExpression) ||
        isCommentAtParentEnd(token, AST_NODE_TYPES.ObjectPattern)
      );
    }

    /**
     * Returns whether or not comments are at the array start or not.
     */
    function isCommentAtArrayStart(token: TSESTree.Token): boolean {
      return (
        isCommentAtParentStart(token, AST_NODE_TYPES.ArrayExpression) ||
        isCommentAtParentStart(token, AST_NODE_TYPES.ArrayPattern)
      );
    }

    /**
     * Returns whether or not comments are at the array end or not.
     */
    function isCommentAtArrayEnd(token: TSESTree.Token): boolean {
      return (
        isCommentAtParentEnd(token, AST_NODE_TYPES.ArrayExpression) ||
        isCommentAtParentEnd(token, AST_NODE_TYPES.ArrayPattern)
      );
    }

    function checkForEmptyLine(
      token: TSESTree.Comment,
      opts: { before?: boolean; after?: boolean },
    ): void {
      if (
        options.applyDefaultIgnorePatterns !== false &&
        defaultIgnoreRegExp.test(token.value)
      ) {
        return;
      }

      if (options.ignorePattern && customIgnoreRegExp.test(token.value)) {
        return;
      }

      let after = opts.after,
        before = opts.before;

      const prevLineNum = token.loc.start.line - 1;
      const nextLineNum = token.loc.end.line + 1;

      // we ignore all inline comments
      if (codeAroundComment(token)) {
        return;
      }

      const blockStartAllowed =
          Boolean(options.allowBlockStart) &&
          isCommentAtBlockStart(token) &&
          !(options.allowClassStart === false && isCommentAtClassStart(token)),
        blockEndAllowed =
          Boolean(options.allowBlockEnd) &&
          isCommentAtBlockEnd(token) &&
          !(options.allowClassEnd === false && isCommentAtClassEnd(token)),
        classStartAllowed =
          Boolean(options.allowClassStart) && isCommentAtClassStart(token),
        classEndAllowed =
          Boolean(options.allowClassEnd) && isCommentAtClassEnd(token),
        objectStartAllowed =
          Boolean(options.allowObjectStart) && isCommentAtObjectStart(token),
        objectEndAllowed =
          Boolean(options.allowObjectEnd) && isCommentAtObjectEnd(token),
        arrayStartAllowed =
          Boolean(options.allowArrayStart) && isCommentAtArrayStart(token),
        arrayEndAllowed =
          Boolean(options.allowArrayEnd) && isCommentAtArrayEnd(token);

      const exceptionStartAllowed =
        blockStartAllowed ||
        classStartAllowed ||
        objectStartAllowed ||
        arrayStartAllowed;
      const exceptionEndAllowed =
        blockEndAllowed ||
        classEndAllowed ||
        objectEndAllowed ||
        arrayEndAllowed;

      // ignore top of the file and bottom of the file
      if (prevLineNum < 1) {
        before = false;
      }
      if (nextLineNum >= numLines) {
        after = false;
      }

      const previousTokenOrComment = sourceCode.getTokenBefore(token, {
        includeComments: true,
      });
      const nextTokenOrComment = sourceCode.getTokenAfter(token, {
        includeComments: true,
      });

      // check for newline before
      if (
        !exceptionStartAllowed &&
        before &&
        !commentAndEmptyLines.has(prevLineNum) &&
        !(
          util.isCommentToken(previousTokenOrComment!) &&
          util.isTokenOnSameLine(previousTokenOrComment, token)
        )
      ) {
        const lineStart = token.range[0] - token.loc.start.column;
        const range = [lineStart, lineStart] as const;

        context.report({
          node: token,
          messageId: 'before',
          fix(fixer) {
            return fixer.insertTextBeforeRange(range, '\n');
          },
        });
      }

      // check for newline after
      if (
        !exceptionEndAllowed &&
        after &&
        !commentAndEmptyLines.has(nextLineNum) &&
        !(
          util.isCommentToken(nextTokenOrComment!) &&
          util.isTokenOnSameLine(token, nextTokenOrComment)
        )
      ) {
        context.report({
          node: token,
          messageId: 'after',
          fix(fixer) {
            return fixer.insertTextAfter(token, '\n');
          },
        });
      }
    }

    return {
      Program(): void {
        comments.forEach(token => {
          if (token.type === AST_TOKEN_TYPES.Line) {
            if (options.beforeLineComment || options.afterLineComment) {
              checkForEmptyLine(token, {
                after: options.afterLineComment,
                before: options.beforeLineComment,
              });
            }
          } else if (token.type === AST_TOKEN_TYPES.Block) {
            if (options.beforeBlockComment || options.afterBlockComment) {
              checkForEmptyLine(token, {
                after: options.afterBlockComment,
                before: options.beforeBlockComment,
              });
            }
          }
        });
      },
    };
  },
});
