import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

//------------------------------------------------------------------------------
// Local Types
//------------------------------------------------------------------------------

type NodeTest = (
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
) => boolean;
interface NodeTestObject {
  test: NodeTest;
}
interface PaddingOption {
  blankLine: keyof typeof PaddingTypes;
  prev: string | string[];
  next: string | string[];
}
type MessageIds = 'expectedBlankLine' | 'unexpectedBlankLine';
type Options = PaddingOption[];

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const LT = `[${Array.from(
  new Set(['\r\n', '\r', '\n', '\u2028', '\u2029']),
).join('')}]`;
const PADDING_LINE_SEQUENCE = new RegExp(
  String.raw`^(\s*?${LT})\s*${LT}(\s*;?)$`,
  'u',
);

/**
 * Skips a chain expression node
 * @param {TSESTree.Node} node The node to test
 * @returns {TSESTree.Node} A non-chain expression
 * @private
 */
function skipChainExpression(node: TSESTree.Node): TSESTree.Node {
  return node && node.type === AST_NODE_TYPES.ChainExpression
    ? node.expression
    : node;
}

/**
 * Creates tester which check if a node starts with specific keyword.
 * @param {string} keyword The keyword to test.
 * @returns {Object} the created tester.
 * @private
 */
function newKeywordTester(keyword: string): NodeTestObject {
  return {
    test(node, sourceCode): boolean {
      const keywords = keyword.split(' ');
      return keywords.every(
        (keyword, i) => sourceCode.getFirstToken(node, i)?.value === keyword,
      );
    },
  };
}

/**
 * Creates tester which check if a node is specific type.
 * @param {AST_NODE_TYPES} type The node type to test.
 * @returns {Object} the created tester.
 * @private
 */
function newNodeTypeTester(type: AST_NODE_TYPES): NodeTestObject {
  return {
    test: (node): boolean => node.type === type,
  };
}

/**
 * Checks the given node is an expression statement of IIFE.
 * @param {TSESTree.Node} node The node to check.
 * @returns {boolean} `true` if the node is an expression statement of IIFE.
 * @private
 */
function isIIFEStatement(node: TSESTree.Node): boolean {
  if (node.type === AST_NODE_TYPES.ExpressionStatement) {
    let expression = skipChainExpression(node.expression);
    if (expression.type === AST_NODE_TYPES.UnaryExpression) {
      expression = skipChainExpression(expression.argument);
    }
    if (expression.type === AST_NODE_TYPES.CallExpression) {
      let node: TSESTree.Node = expression.callee;
      while (node.type === AST_NODE_TYPES.SequenceExpression) {
        node = node.expressions[node.expressions.length - 1];
      }
      return util.isFunction(node);
    }
  }
  return false;
}

/**
 * Checks the given node is a CommonJS require statement
 * @param {TSESTree.Node} node The node to check.
 * @returns {boolean} `true` if the node is a CommonJS require statement.
 * @private
 */
function isCJSRequire(node: TSESTree.Node): boolean {
  if (node.type === AST_NODE_TYPES.VariableDeclaration) {
    const declaration = node.declarations[0];
    if (declaration?.init) {
      let call = declaration?.init;
      while (call.type === AST_NODE_TYPES.MemberExpression) {
        call = call.object;
      }
      if (
        call.type === AST_NODE_TYPES.CallExpression &&
        call.callee.type === AST_NODE_TYPES.Identifier
      ) {
        return call.callee.name === 'require';
      }
    }
  }
  return false;
}

/**
 * Checks the given node is a CommonJS export statement
 * @param {TSESTree.Node} node The node to check.
 * @returns {boolean} `true` if the node is a CommonJS export statement.
 * @private
 */
function isCJSExport(node: TSESTree.Node): boolean {
  if (node.type === AST_NODE_TYPES.ExpressionStatement) {
    const expression = node.expression;
    if (expression.type === AST_NODE_TYPES.AssignmentExpression) {
      let left = expression.left;
      if (left.type === AST_NODE_TYPES.MemberExpression) {
        while (left.object.type === AST_NODE_TYPES.MemberExpression) {
          left = left.object;
        }
        return (
          left.object.type === AST_NODE_TYPES.Identifier &&
          (left.object.name === 'exports' ||
            (left.object.name === 'module' &&
              left.property.type === AST_NODE_TYPES.Identifier &&
              left.property.name === 'exports'))
        );
      }
    }
  }
  return false;
}

/**
 * Checks whether the given node is a block-like statement.
 * This checks the last token of the node is the closing brace of a block.
 * @param {TSESLint.SourceCode} sourceCode The source code to get tokens.
 * @param {TSESTree.Node} node The node to check.
 * @returns {boolean} `true` if the node is a block-like statement.
 * @private
 */
function isBlockLikeStatement(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): boolean {
  // do-while with a block is a block-like statement.
  if (
    node.type === AST_NODE_TYPES.DoWhileStatement &&
    node.body.type === AST_NODE_TYPES.BlockStatement
  ) {
    return true;
  }

  /**
   * IIFE is a block-like statement specially from
   * JSCS#disallowPaddingNewLinesAfterBlocks.
   */
  if (isIIFEStatement(node)) {
    return true;
  }

  // Checks the last token is a closing brace of blocks.
  const lastToken = sourceCode.getLastToken(node, util.isNotSemicolonToken);
  const belongingNode =
    lastToken && util.isClosingBraceToken(lastToken)
      ? sourceCode.getNodeByRangeIndex(lastToken.range[0])
      : null;

  return (
    !!belongingNode &&
    (belongingNode.type === AST_NODE_TYPES.BlockStatement ||
      belongingNode.type === AST_NODE_TYPES.SwitchStatement)
  );
}

/**
 * Check whether the given node is a directive or not.
 * @param {TSESTree.Node} node The node to check.
 * @param {TSESLint.SourceCode} sourceCode The source code object to get tokens.
 * @returns {boolean} `true` if the node is a directive.
 */
function isDirective(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): boolean {
  return (
    node.type === AST_NODE_TYPES.ExpressionStatement &&
    (node.parent?.type === AST_NODE_TYPES.Program ||
      (node.parent?.type === AST_NODE_TYPES.BlockStatement &&
        util.isFunction(node.parent.parent))) &&
    node.expression.type === AST_NODE_TYPES.Literal &&
    typeof node.expression.value === 'string' &&
    !util.isParenthesized(node.expression, sourceCode)
  );
}

/**
 * Check whether the given node is a part of directive prologue or not.
 * @param {TSESTree.Node} node The node to check.
 * @param {TSESLint.SourceCode} sourceCode The source code object to get tokens.
 * @returns {boolean} `true` if the node is a part of directive prologue.
 */
function isDirectivePrologue(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): boolean {
  if (
    isDirective(node, sourceCode) &&
    node.parent &&
    'body' in node.parent &&
    Array.isArray(node.parent.body)
  ) {
    for (const sibling of node.parent.body) {
      if (sibling === node) {
        break;
      }
      if (!isDirective(sibling, sourceCode)) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * Check whether the given node is an expression
 * @param {TSESTree.Node} node The node to check.
 * @param {TSESLint.SourceCode} sourceCode The source code object to get tokens.
 * @returns {boolean} `true` if the node is an expression
 */
function isExpression(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): boolean {
  return (
    node.type === AST_NODE_TYPES.ExpressionStatement &&
    !isDirectivePrologue(node, sourceCode)
  );
}

/**
 * Gets the actual last token.
 *
 * If a semicolon is semicolon-less style's semicolon, this ignores it.
 * For example:
 *
 *     foo()
 *     ;[1, 2, 3].forEach(bar)
 * @param {TSESLint.SourceCode} sourceCode The source code to get tokens.
 * @param {TSESTree.Node} node The node to get.
 * @returns {Token} The actual last token.
 * @private
 */
function getActualLastToken(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): TSESTree.Token | null {
  const semiToken = sourceCode.getLastToken(node)!;
  const prevToken = sourceCode.getTokenBefore(semiToken);
  const nextToken = sourceCode.getTokenAfter(semiToken);
  const isSemicolonLessStyle =
    prevToken &&
    nextToken &&
    prevToken.range[0] >= node.range[0] &&
    util.isSemicolonToken(semiToken) &&
    semiToken.loc.start.line !== prevToken.loc.end.line &&
    semiToken.loc.end.line === nextToken.loc.start.line;

  return isSemicolonLessStyle ? prevToken : semiToken;
}

/**
 * This returns the concatenation of the first 2 captured strings.
 * @param {string} _ Unused. Whole matched string.
 * @param {string} trailingSpaces The trailing spaces of the first line.
 * @param {string} indentSpaces The indentation spaces of the last line.
 * @returns {string} The concatenation of trailingSpaces and indentSpaces.
 * @private
 */
function replacerToRemovePaddingLines(
  _: string,
  trailingSpaces: string,
  indentSpaces: string,
): string {
  return trailingSpaces + indentSpaces;
}

/**
 * Check and report statements for `any` configuration.
 * It does nothing.
 * @returns {void}
 * @private
 */
function verifyForAny(): void {
  // Empty
}

/**
 * Check and report statements for `never` configuration.
 * This autofix removes blank lines between the given 2 statements.
 * However, if comments exist between 2 blank lines, it does not remove those
 * blank lines automatically.
 * @param {TSESLint.RuleContext} context The rule context to report.
 * @param {TSESTree.Node} _ Unused. The previous node to check.
 * @param {TSESTree.Node} nextNode The next node to check.
 * @param {Array<Token[]>} paddingLines The array of token pairs that blank
 * lines exist between the pair.
 * @returns {void}
 * @private
 */
function verifyForNever(
  context: TSESLint.RuleContext<MessageIds, Options>,
  _: TSESTree.Node,
  nextNode: TSESTree.Node,
  paddingLines: [TSESTree.Token, TSESTree.Token][],
): void {
  if (paddingLines.length === 0) {
    return;
  }

  context.report({
    node: nextNode,
    messageId: 'unexpectedBlankLine',
    fix(fixer) {
      if (paddingLines.length >= 2) {
        return null;
      }

      const prevToken = paddingLines[0][0];
      const nextToken = paddingLines[0][1];
      const start = prevToken.range[1];
      const end = nextToken.range[0];
      const text = context
        .getSourceCode()
        .text.slice(start, end)
        .replace(PADDING_LINE_SEQUENCE, replacerToRemovePaddingLines);

      return fixer.replaceTextRange([start, end], text);
    },
  });
}

/**
 * Check and report statements for `always` configuration.
 * This autofix inserts a blank line between the given 2 statements.
 * If the `prevNode` has trailing comments, it inserts a blank line after the
 * trailing comments.
 * @param {TSESLint.RuleContext} context The rule context to report.
 * @param {TSESTree.Node} prevNode The previous node to check.
 * @param {TSESTree.Node} nextNode The next node to check.
 * @param {Array<Token[]>} paddingLines The array of token pairs that blank
 * lines exist between the pair.
 * @returns {void}
 * @private
 */
function verifyForAlways(
  context: TSESLint.RuleContext<MessageIds, Options>,
  prevNode: TSESTree.Node,
  nextNode: TSESTree.Node,
  paddingLines: [TSESTree.Token, TSESTree.Token][],
): void {
  if (paddingLines.length > 0) {
    return;
  }

  context.report({
    node: nextNode,
    messageId: 'expectedBlankLine',
    fix(fixer) {
      const sourceCode = context.getSourceCode();
      let prevToken = getActualLastToken(
        prevNode,
        sourceCode,
      ) as TSESTree.Token;
      const nextToken =
        (sourceCode.getFirstTokenBetween(prevToken, nextNode, {
          includeComments: true,

          /**
           * Skip the trailing comments of the previous node.
           * This inserts a blank line after the last trailing comment.
           *
           * For example:
           *
           *     foo(); // trailing comment.
           *     // comment.
           *     bar();
           *
           * Get fixed to:
           *
           *     foo(); // trailing comment.
           *
           *     // comment.
           *     bar();
           * @param {Token} token The token to check.
           * @returns {boolean} `true` if the token is not a trailing comment.
           * @private
           */
          filter(token) {
            if (util.isTokenOnSameLine(prevToken, token)) {
              prevToken = token;
              return false;
            }
            return true;
          },
        }) as TSESTree.Token) || nextNode;
      const insertText = util.isTokenOnSameLine(prevToken, nextToken)
        ? '\n\n'
        : '\n';

      return fixer.insertTextAfter(prevToken, insertText);
    },
  });
}

/**
 * Types of blank lines.
 * `any`, `never`, and `always` are defined.
 * Those have `verify` method to check and report statements.
 * @private
 */
const PaddingTypes = {
  any: { verify: verifyForAny },
  never: { verify: verifyForNever },
  always: { verify: verifyForAlways },
};

/**
 * Types of statements.
 * Those have `test` method to check it matches to the given statement.
 * @private
 */
const StatementTypes: Record<string, NodeTestObject> = {
  '*': { test: (): boolean => true },
  'block-like': { test: isBlockLikeStatement },
  exports: { test: isCJSExport },
  require: { test: isCJSRequire },
  directive: { test: isDirectivePrologue },
  expression: { test: isExpression },
  iife: { test: isIIFEStatement },

  block: newNodeTypeTester(AST_NODE_TYPES.BlockStatement),
  empty: newNodeTypeTester(AST_NODE_TYPES.EmptyStatement),
  function: newNodeTypeTester(AST_NODE_TYPES.FunctionDeclaration),

  break: newKeywordTester('break'),
  case: newKeywordTester('case'),
  class: newKeywordTester('class'),
  const: newKeywordTester('const'),
  continue: newKeywordTester('continue'),
  debugger: newKeywordTester('debugger'),
  default: newKeywordTester('default'),
  do: newKeywordTester('do'),
  export: newKeywordTester('export'),
  for: newKeywordTester('for'),
  if: newKeywordTester('if'),
  import: newKeywordTester('import'),
  let: newKeywordTester('let'),
  return: newKeywordTester('return'),
  switch: newKeywordTester('switch'),
  throw: newKeywordTester('throw'),
  try: newKeywordTester('try'),
  var: newKeywordTester('var'),
  while: newKeywordTester('while'),
  with: newKeywordTester('with'),
};

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default util.createRule<Options, MessageIds>({
  name: 'padding-line-between-statements',
  meta: {
    type: 'layout',
    docs: {
      description: 'require or disallow padding lines between statements',
      category: 'Stylistic Issues',
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    schema: {
      definitions: {
        paddingType: {
          enum: Object.keys(PaddingTypes),
        },
        statementType: {
          anyOf: [
            { type: 'string' },
            {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              uniqueItems: true,
              additionalItems: false,
            },
          ],
        },
      },
      type: 'array',
      items: {
        type: 'object',
        properties: {
          blankLine: { $ref: '#/definitions/paddingType' },
          prev: { $ref: '#/definitions/statementType' },
          next: { $ref: '#/definitions/statementType' },
        },
        additionalProperties: false,
        required: ['blankLine', 'prev', 'next'],
      },
      additionalItems: false,
    },
    messages: {
      unexpectedBlankLine: 'Unexpected blank line before this statement.',
      expectedBlankLine: 'Expected blank line before this statement.',
    },
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    const configureList = context.options || [];

    type Scope = null | {
      upper: Scope;
      prevNode: TSESTree.Node | null;
    };

    let scopeInfo: Scope = null;

    /**
     * Processes to enter to new scope.
     * This manages the current previous statement.
     * @returns {void}
     * @private
     */
    function enterScope(): void {
      scopeInfo = {
        upper: scopeInfo,
        prevNode: null,
      };
    }

    /**
     * Processes to exit from the current scope.
     * @returns {void}
     * @private
     */
    function exitScope(): void {
      if (scopeInfo) {
        scopeInfo = scopeInfo.upper;
      }
    }

    /**
     * Checks whether the given node matches the given type.
     * @param {TSESTree.Node} node The statement node to check.
     * @param {string|string[]} type The statement type to check.
     * @returns {boolean} `true` if the statement node matched the type.
     * @private
     */
    function match(node: TSESTree.Node, type: string | string[]): boolean {
      let innerStatementNode = node;

      while (innerStatementNode.type === AST_NODE_TYPES.LabeledStatement) {
        innerStatementNode = innerStatementNode.body;
      }

      const types = !Array.isArray(type) ? [type] : type;

      return types.some(type => {
        if (/^singleline-/.test(type)) {
          if (node.loc.start.line !== node.loc.end.line) {
            return false;
          }
          type = type.slice(11);
        }
        if (/^multiline-/.test(type)) {
          if (node.loc.start.line === node.loc.end.line) {
            return false;
          }
          type = type.slice(10);
        }
        return type in StatementTypes
          ? StatementTypes[type].test(innerStatementNode, sourceCode)
          : newKeywordTester(type).test(innerStatementNode, sourceCode);
      });
    }

    /**
     * Finds the last matched configure from configureList.
     * @param {TSESTree.Node} prevNode The previous statement to match.
     * @param {TSESTree.Node} nextNode The current statement to match.
     * @returns {Object} The tester of the last matched configure.
     * @private
     */
    function getPaddingType(
      prevNode: TSESTree.Node,
      nextNode: TSESTree.Node,
    ): typeof PaddingTypes[keyof typeof PaddingTypes] {
      for (let i = configureList.length - 1; i >= 0; --i) {
        const configure = configureList[i];
        if (
          match(prevNode, configure.prev) &&
          match(nextNode, configure.next)
        ) {
          return PaddingTypes[configure.blankLine];
        }
      }
      return PaddingTypes.any;
    }

    /**
     * Gets padding line sequences between the given 2 statements.
     * Comments are separators of the padding line sequences.
     * @param {TSESTree.Node} prevNode The previous statement to count.
     * @param {TSESTree.Node} nextNode The current statement to count.
     * @returns {Array<Token[]>} The array of token pairs.
     * @private
     */
    function getPaddingLineSequences(
      prevNode: TSESTree.Node,
      nextNode: TSESTree.Node,
    ): [TSESTree.Token, TSESTree.Token][] {
      const pairs: [TSESTree.Token, TSESTree.Token][] = [];
      let prevToken: TSESTree.Token = getActualLastToken(prevNode, sourceCode)!;

      if (nextNode.loc.start.line - prevToken.loc.end.line >= 2) {
        do {
          const token: TSESTree.Token = sourceCode.getTokenAfter(prevToken, {
            includeComments: true,
          })!;

          if (token.loc.start.line - prevToken.loc.end.line >= 2) {
            pairs.push([prevToken, token]);
          }
          prevToken = token;
        } while (prevToken.range[0] < nextNode.range[0]);
      }

      return pairs;
    }

    /**
     * Verify padding lines between the given node and the previous node.
     * @param {TSESTree.Node} node The node to verify.
     * @returns {void}
     * @private
     */
    function verify(node: TSESTree.Node): void {
      if (
        !node.parent ||
        ![
          AST_NODE_TYPES.SwitchStatement,
          AST_NODE_TYPES.BlockStatement,
          AST_NODE_TYPES.Program,
          AST_NODE_TYPES.SwitchCase,
        ].includes(node.parent.type)
      ) {
        return;
      }

      // Save this node as the current previous statement.
      const prevNode = scopeInfo!.prevNode;

      // Verify.
      if (prevNode) {
        const type = getPaddingType(prevNode, node);
        const paddingLines = getPaddingLineSequences(prevNode, node);

        type.verify(context, prevNode, node, paddingLines);
      }

      scopeInfo!.prevNode = node;
    }

    /**
     * Verify padding lines between the given node and the previous node.
     * Then process to enter to new scope.
     * @param {TSESTree.Node} node The node to verify.
     * @returns {void}
     * @private
     */
    function verifyThenEnterScope(node: TSESTree.Node): void {
      verify(node);
      enterScope();
    }

    return {
      Program: enterScope,
      BlockStatement: enterScope,
      SwitchStatement: enterScope,
      'Program:exit': exitScope,
      'BlockStatement:exit': exitScope,
      'SwitchStatement:exit': exitScope,

      ':statement': verify,

      SwitchCase: verifyThenEnterScope,
      'SwitchCase:exit': exitScope,
    };
  },
});
