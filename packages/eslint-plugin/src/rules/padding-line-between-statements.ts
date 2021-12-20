import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

/**
 * This rule is a replica of padding-line-between-statements.
 *
 * Ideally we would want to extend the rule support typescript specific support.
 * But since not all the state is exposed by the eslint and eslint has frozen stylistic rules,
 * (see - https://eslint.org/blog/2020/05/changes-to-rules-policies for details.)
 * we are forced to re-implement the rule here.
 *
 * We have tried to keep the implementation as close as possible to the eslint implementation, to make
 * patching easier for future contributors.
 *
 * Reference rule - https://github.com/eslint/eslint/blob/main/lib/rules/padding-line-between-statements.js
 */

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

const LT = `[${Array.from(
  new Set(['\r\n', '\r', '\n', '\u2028', '\u2029']),
).join('')}]`;
const PADDING_LINE_SEQUENCE = new RegExp(
  String.raw`^(\s*?${LT})\s*${LT}(\s*;?)$`,
  'u',
);

/**
 * Creates tester which check if a node starts with specific keyword with the
 * appropriate AST_NODE_TYPES.
 * @param keyword The keyword to test.
 * @returns the created tester.
 * @private
 */
function newKeywordTester(
  type: AST_NODE_TYPES | AST_NODE_TYPES[],
  keyword: string,
): NodeTestObject {
  return {
    test(node, sourceCode): boolean {
      const isSameKeyword = sourceCode.getFirstToken(node)?.value === keyword;
      const isSameType = Array.isArray(type)
        ? type.some(val => val === node.type)
        : type === node.type;

      return isSameKeyword && isSameType;
    },
  };
}

/**
 * Creates tester which check if a node starts with specific keyword and spans a single line.
 * @param keyword The keyword to test.
 * @returns the created tester.
 * @private
 */
function newSinglelineKeywordTester(keyword: string): NodeTestObject {
  return {
    test(node, sourceCode): boolean {
      return (
        node.loc.start.line === node.loc.end.line &&
        sourceCode.getFirstToken(node)!.value === keyword
      );
    },
  };
}

/**
 * Creates tester which check if a node starts with specific keyword and spans multiple lines.
 * @param keyword The keyword to test.
 * @returns the created tester.
 * @private
 */
function newMultilineKeywordTester(keyword: string): NodeTestObject {
  return {
    test(node, sourceCode): boolean {
      return (
        node.loc.start.line !== node.loc.end.line &&
        sourceCode.getFirstToken(node)!.value === keyword
      );
    },
  };
}

/**
 * Creates tester which check if a node is specific type.
 * @param type The node type to test.
 * @returns the created tester.
 * @private
 */
function newNodeTypeTester(type: AST_NODE_TYPES): NodeTestObject {
  return {
    test: (node): boolean => node.type === type,
  };
}

/**
 * Skips a chain expression node
 * @param node The node to test
 * @returnsA non-chain expression
 * @private
 */
function skipChainExpression(node: TSESTree.Node): TSESTree.Node {
  return node && node.type === AST_NODE_TYPES.ChainExpression
    ? node.expression
    : node;
}

/**
 * Checks the given node is an expression statement of IIFE.
 * @param node The node to check.
 * @returns `true` if the node is an expression statement of IIFE.
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
 * @param node The node to check.
 * @returns `true` if the node is a CommonJS require statement.
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
 * Checks whether the given node is a block-like statement.
 * This checks the last token of the node is the closing brace of a block.
 * @param sourceCode The source code to get tokens.
 * @param node The node to check.
 * @returns `true` if the node is a block-like statement.
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
 * @param node The node to check.
 * @param sourceCode The source code object to get tokens.
 * @returns `true` if the node is a directive.
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
 * @param node The node to check.
 * @param sourceCode The source code object to get tokens.
 * @returns `true` if the node is a part of directive prologue.
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
 * Checks the given node is a CommonJS export statement
 * @param node The node to check.
 * @returns `true` if the node is a CommonJS export statement.
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
 * Check whether the given node is an expression
 * @param node The node to check.
 * @param sourceCode The source code object to get tokens.
 * @returns `true` if the node is an expression
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
 * @param sourceCode The source code to get tokens.
 * @param node The node to get.
 * @returns The actual last token.
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
 * @param _ Unused. Whole matched string.
 * @param trailingSpaces The trailing spaces of the first line.
 * @param indentSpaces The indentation spaces of the last line.
 * @returns The concatenation of trailingSpaces and indentSpaces.
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
 *
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
 * @param context The rule context to report.
 * @param _ Unused. The previous node to check.
 * @param nextNode The next node to check.
 * @param paddingLines The array of token pairs that blank
 * lines exist between the pair.
 *
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
 * @param context The rule context to report.
 * @param prevNode The previous node to check.
 * @param nextNode The next node to check.
 * @param paddingLines The array of token pairs that blank
 * lines exist between the pair.
 *
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
           * @param token The token to check.
           * @returns `true` if the token is not a trailing comment.
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

  'multiline-block-like': {
    test: (node, sourceCode) =>
      node.loc.start.line !== node.loc.end.line &&
      isBlockLikeStatement(node, sourceCode),
  },
  'multiline-expression': {
    test: (node, sourceCode) =>
      node.loc.start.line !== node.loc.end.line &&
      node.type === AST_NODE_TYPES.ExpressionStatement &&
      !isDirectivePrologue(node, sourceCode),
  },

  'multiline-const': newMultilineKeywordTester('const'),
  'multiline-let': newMultilineKeywordTester('let'),
  'multiline-var': newMultilineKeywordTester('var'),
  'singleline-const': newSinglelineKeywordTester('const'),
  'singleline-let': newSinglelineKeywordTester('let'),
  'singleline-var': newSinglelineKeywordTester('var'),

  block: newNodeTypeTester(AST_NODE_TYPES.BlockStatement),
  empty: newNodeTypeTester(AST_NODE_TYPES.EmptyStatement),
  function: newNodeTypeTester(AST_NODE_TYPES.FunctionDeclaration),

  break: newKeywordTester(AST_NODE_TYPES.BreakStatement, 'break'),
  case: newKeywordTester(AST_NODE_TYPES.SwitchCase, 'case'),
  class: newKeywordTester(AST_NODE_TYPES.ClassDeclaration, 'class'),
  const: newKeywordTester(AST_NODE_TYPES.VariableDeclaration, 'const'),
  continue: newKeywordTester(AST_NODE_TYPES.ContinueStatement, 'continue'),
  debugger: newKeywordTester(AST_NODE_TYPES.DebuggerStatement, 'debugger'),
  default: newKeywordTester(
    [AST_NODE_TYPES.SwitchCase, AST_NODE_TYPES.ExportDefaultDeclaration],
    'default',
  ),
  do: newKeywordTester(AST_NODE_TYPES.DoWhileStatement, 'do'),
  export: newKeywordTester(
    [
      AST_NODE_TYPES.ExportDefaultDeclaration,
      AST_NODE_TYPES.ExportNamedDeclaration,
    ],
    'export',
  ),
  for: newKeywordTester(
    [
      AST_NODE_TYPES.ForStatement,
      AST_NODE_TYPES.ForInStatement,
      AST_NODE_TYPES.ForOfStatement,
    ],
    'for',
  ),
  if: newKeywordTester(AST_NODE_TYPES.IfStatement, 'if'),
  import: newKeywordTester(AST_NODE_TYPES.ImportDeclaration, 'import'),
  let: newKeywordTester(AST_NODE_TYPES.VariableDeclaration, 'let'),
  return: newKeywordTester(AST_NODE_TYPES.ReturnStatement, 'return'),
  switch: newKeywordTester(AST_NODE_TYPES.SwitchStatement, 'switch'),
  throw: newKeywordTester(AST_NODE_TYPES.ThrowStatement, 'throw'),
  try: newKeywordTester(AST_NODE_TYPES.TryStatement, 'try'),
  var: newKeywordTester(AST_NODE_TYPES.VariableDeclaration, 'var'),
  while: newKeywordTester(
    [AST_NODE_TYPES.WhileStatement, AST_NODE_TYPES.DoWhileStatement],
    'while',
  ),
  with: newKeywordTester(AST_NODE_TYPES.WithStatement, 'with'),

  // Additional Typescript constructs
  interface: newKeywordTester(
    AST_NODE_TYPES.TSInterfaceDeclaration,
    'interface',
  ),
  type: newKeywordTester(AST_NODE_TYPES.TSTypeAliasDeclaration, 'type'),
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
      recommended: false,
      extendsBaseRule: true,
    },
    fixable: 'whitespace',
    hasSuggestions: true,
    schema: {
      definitions: {
        paddingType: {
          enum: Object.keys(PaddingTypes),
        },
        statementType: {
          anyOf: [
            { enum: Object.keys(StatementTypes) },
            {
              type: 'array',
              items: { enum: Object.keys(StatementTypes) },
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
     *
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
     *
     * @private
     */
    function exitScope(): void {
      if (scopeInfo) {
        scopeInfo = scopeInfo.upper;
      }
    }

    /**
     * Checks whether the given node matches the given type.
     * @param node The statement node to check.
     * @param type The statement type to check.
     * @returns `true` if the statement node matched the type.
     * @private
     */
    function match(node: TSESTree.Node, type: string | string[]): boolean {
      let innerStatementNode = node;

      while (innerStatementNode.type === AST_NODE_TYPES.LabeledStatement) {
        innerStatementNode = innerStatementNode.body;
      }

      if (Array.isArray(type)) {
        return type.some(match.bind(null, innerStatementNode));
      }

      return StatementTypes[type].test(innerStatementNode, sourceCode);
    }

    /**
     * Finds the last matched configure from configureList.
     * @paramprevNode The previous statement to match.
     * @paramnextNode The current statement to match.
     * @returns The tester of the last matched configure.
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
     * @paramprevNode The previous statement to count.
     * @paramnextNode The current statement to count.
     * @returns The array of token pairs.
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
     * @param node The node to verify.
     *
     * @private
     */
    function verify(node: TSESTree.Node): void {
      if (
        !node.parent ||
        ![
          AST_NODE_TYPES.BlockStatement,
          AST_NODE_TYPES.Program,
          AST_NODE_TYPES.SwitchCase,
          AST_NODE_TYPES.SwitchStatement,
          AST_NODE_TYPES.TSModuleBlock,
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
     * @param node The node to verify.
     *
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
      TSModuleBlock: enterScope,
      'Program:exit': exitScope,
      'BlockStatement:exit': exitScope,
      'SwitchStatement:exit': exitScope,
      'TSModuleBlock:exit': exitScope,

      ':statement': verify,

      SwitchCase: verifyThenEnterScope,
      'SwitchCase:exit': exitScope,
    };
  },
});
