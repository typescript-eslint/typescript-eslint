import type { TSESTree } from '@typescript-eslint/utils';
import type { SourceCode } from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import {
  isClosingBraceToken,
  isClosingParenToken,
} from '@typescript-eslint/utils/ast-utils';

// The following is adapted from `eslint`'s source code.
// https://github.com/eslint/eslint/blob/3a4eaf921543b1cd5d1df4ea9dec02fab396af2a/lib/rules/utils/ast-utils.js#L1043-L1132
// Could be export { isStartOfExpressionStatement } from 'eslint/lib/rules/utils/ast-utils'

const BREAK_OR_CONTINUE = new Set([
  AST_NODE_TYPES.BreakStatement,
  AST_NODE_TYPES.ContinueStatement,
]);

// Declaration types that must contain a string Literal node at the end.
const DECLARATIONS = new Set([
  AST_NODE_TYPES.ExportAllDeclaration,
  AST_NODE_TYPES.ExportNamedDeclaration,
  AST_NODE_TYPES.ImportDeclaration,
]);

const IDENTIFIER_OR_KEYWORD = new Set([
  AST_NODE_TYPES.Identifier,
  AST_TOKEN_TYPES.Keyword,
]);

// Keywords that can immediately precede an ExpressionStatement node, mapped to the their node types.
const NODE_TYPES_BY_KEYWORD: Record<string, TSESTree.AST_NODE_TYPES | null> = {
  __proto__: null,
  break: AST_NODE_TYPES.BreakStatement,
  continue: AST_NODE_TYPES.ContinueStatement,
  debugger: AST_NODE_TYPES.DebuggerStatement,
  do: AST_NODE_TYPES.DoWhileStatement,
  else: AST_NODE_TYPES.IfStatement,
  return: AST_NODE_TYPES.ReturnStatement,
  yield: AST_NODE_TYPES.YieldExpression,
};

/*
 * Before an opening parenthesis, postfix `++` and `--` always trigger ASI;
 * the tokens `:`, `;`, `{` and `=>` don't expect a semicolon, as that would count as an empty statement.
 */
const PUNCTUATORS = new Set(['--', ';', ':', '{', '++', '=>']);

/*
 * Statements that can contain an `ExpressionStatement` after a closing parenthesis.
 * DoWhileStatement is an exception in that it always triggers ASI after the closing parenthesis.
 */
const STATEMENTS = new Set([
  AST_NODE_TYPES.DoWhileStatement,
  AST_NODE_TYPES.ForInStatement,
  AST_NODE_TYPES.ForOfStatement,
  AST_NODE_TYPES.ForStatement,
  AST_NODE_TYPES.IfStatement,
  AST_NODE_TYPES.WhileStatement,
  AST_NODE_TYPES.WithStatement,
]);

/**
 * Determines whether an opening parenthesis `(`, bracket `[` or backtick ``` ` ``` needs to be preceded by a semicolon.
 * This opening parenthesis or bracket should be at the start of an `ExpressionStatement`, a `MethodDefinition` or at
 * the start of the body of an `ArrowFunctionExpression`.
 * @param sourceCode The source code object.
 * @param node A node at the position where an opening parenthesis or bracket will be inserted.
 * @returns Whether a semicolon is required before the opening parenthesis or bracket.
 */
export function needsPrecedingSemicolon(
  sourceCode: SourceCode,
  node: TSESTree.Node,
): boolean {
  const prevToken = sourceCode.getTokenBefore(node);

  if (
    !prevToken ||
    (prevToken.type === AST_TOKEN_TYPES.Punctuator &&
      PUNCTUATORS.has(prevToken.value))
  ) {
    return false;
  }

  const prevNode = sourceCode.getNodeByRangeIndex(prevToken.range[0]);

  if (!prevNode) {
    return false;
  }

  if (isClosingParenToken(prevToken)) {
    return !STATEMENTS.has(prevNode.type);
  }

  if (isClosingBraceToken(prevToken)) {
    return (
      (prevNode.type === AST_NODE_TYPES.BlockStatement &&
        prevNode.parent.type === AST_NODE_TYPES.FunctionExpression &&
        prevNode.parent.parent.type !== AST_NODE_TYPES.MethodDefinition) ||
      (prevNode.type === AST_NODE_TYPES.ClassBody &&
        prevNode.parent.type === AST_NODE_TYPES.ClassExpression) ||
      prevNode.type === AST_NODE_TYPES.ObjectExpression
    );
  }

  if (!prevNode.parent) {
    return false;
  }

  if (IDENTIFIER_OR_KEYWORD.has(prevToken.type)) {
    if (BREAK_OR_CONTINUE.has(prevNode.parent.type)) {
      return false;
    }

    const keyword = prevToken.value;
    const nodeType = NODE_TYPES_BY_KEYWORD[keyword];

    return prevNode.type !== nodeType;
  }

  if (prevToken.type === AST_TOKEN_TYPES.String) {
    return !DECLARATIONS.has(prevNode.parent.type);
  }

  return true;
}
