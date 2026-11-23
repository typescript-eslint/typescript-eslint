import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { isParenthesized } from './astUtils';
import { isStartOfArrowFunctionBodyNeedingParentheses } from './isStartOfArrowFunctionBodyNeedingParentheses';
import {
  isFunctionOrClassStartToken,
  isStartOfExpressionStatementNeedingParentheses,
} from './isStartOfExpressionStatementNeedingParentheses';

/**
 * Whether code whose first token is `firstToken`, placed at `node`'s position,
 * would stop being an expression and so needs parentheses:
 * - at the start of an expression statement, a leading `{`, `class`,
 *   `function` or `async function` would start a block or a declaration
 * - at the start of an arrow function's body, a leading `{` would start a
 *   block body
 * - at the start of an `export default`, a leading `class`, `function` or
 *   `async function` would start a declaration
 * @param node The node whose position the code will start at.
 * @param firstToken The token that will start the code.
 */
export function isExpressionStartNeedingParentheses(
  node: TSESTree.Node,
  firstToken: TSESTree.Token,
  sourceCode: Readonly<TSESLint.SourceCode>,
): boolean {
  return (
    isStartOfExpressionStatementNeedingParentheses(
      node,
      firstToken,
      sourceCode,
    ) ||
    isStartOfArrowFunctionBodyNeedingParentheses(
      node,
      firstToken,
      sourceCode,
    ) ||
    (isFunctionOrClassStartToken(firstToken, sourceCode) &&
      isStartOfExportDefaultDeclaration(node, sourceCode))
  );
}

/**
 * Whether replacing `node` with the source text of `replacement`, such as
 * replacing `void 'use strict'` with `'use strict'`, would turn the statement
 * into a directive.
 * @param node The node being replaced.
 * @param replacement The node whose text, including any parentheses around
 * it, replaces `node`.
 */
export function wouldBecomeDirective(
  node: TSESTree.Node,
  replacement: TSESTree.Node,
  sourceCode: Readonly<TSESLint.SourceCode>,
): boolean {
  return (
    replacement.type === AST_NODE_TYPES.Literal &&
    typeof replacement.value === 'string' &&
    !isParenthesized(replacement, sourceCode) &&
    isDirectivePrologueExpression(node, sourceCode)
  );
}

/**
 * Whether `node` is the whole, unparenthesized expression of a statement in a
 * directive prologue, where a string literal replacing it would become a
 * directive.
 */
export function isDirectivePrologueExpression(
  node: TSESTree.Node,
  sourceCode: Readonly<TSESLint.SourceCode>,
): boolean {
  const statement = node.parent;
  if (
    statement?.type !== AST_NODE_TYPES.ExpressionStatement ||
    isParenthesized(node, sourceCode)
  ) {
    return false;
  }

  // The parser also marks directives in these blocks.
  const block = statement.parent;
  if (
    block.type !== AST_NODE_TYPES.Program &&
    block.type !== AST_NODE_TYPES.StaticBlock &&
    block.type !== AST_NODE_TYPES.TSModuleBlock &&
    !(
      block.type === AST_NODE_TYPES.BlockStatement &&
      (block.parent.type === AST_NODE_TYPES.ArrowFunctionExpression ||
        block.parent.type === AST_NODE_TYPES.FunctionDeclaration ||
        block.parent.type === AST_NODE_TYPES.FunctionExpression)
    )
  ) {
    return false;
  }

  const body: readonly TSESTree.Node[] = block.body;
  return body
    .slice(0, body.indexOf(statement))
    .every(
      sibling =>
        sibling.type === AST_NODE_TYPES.ExpressionStatement &&
        sibling.directive != null,
    );
}

/**
 * Whether the node starts the declaration of an `export default`, where a
 * leading `function` or `class` would make a declaration.
 */
function isStartOfExportDefaultDeclaration(
  node: TSESTree.Node,
  sourceCode: Readonly<TSESLint.SourceCode>,
): boolean {
  let current = node;
  while (!isParenthesized(current, sourceCode)) {
    const { parent } = current;
    if (parent == null) {
      return false;
    }
    if (parent.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
      return true;
    }
    if (parent.range[0] !== current.range[0]) {
      return false;
    }
    current = parent;
  }
  return false;
}
