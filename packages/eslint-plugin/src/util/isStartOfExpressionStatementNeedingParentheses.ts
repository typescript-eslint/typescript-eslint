import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { isTokenOnSameLine } from '@typescript-eslint/utils/ast-utils';

import { isStartOfExpressionStatement } from './isStartOfExpressionStatement';

/**
 * Whether an expression whose first token is `firstToken`, placed at `node`'s
 * position, would be parsed as a block or a declaration instead of an
 * expression statement: a leading `{`, `class` or `function`, or, when
 * `sourceCode` is given, `async function`.
 * @param node The node whose position the expression will start at.
 * @param firstToken The token that will start the statement.
 * @param sourceCode Pass it to also detect `async function`, which needs the
 * token after `firstToken`.
 */
export function isStartOfExpressionStatementNeedingParentheses(
  node: TSESTree.Node,
  firstToken: TSESTree.Token,
  sourceCode?: Readonly<TSESLint.SourceCode>,
): boolean {
  return (
    (['{', 'class', 'function'].includes(firstToken.value) ||
      (sourceCode != null && isAsyncFunctionStart(sourceCode, firstToken))) &&
    isStartOfExpressionStatement(node)
  );
}

function isAsyncFunctionStart(
  sourceCode: Readonly<TSESLint.SourceCode>,
  firstToken: TSESTree.Token,
): boolean {
  if (firstToken.value !== 'async') {
    return false;
  }

  const nextToken = sourceCode.getTokenAfter(firstToken);

  // `async` followed by a line break is an identifier, not a modifier.
  return (
    nextToken?.value === 'function' && isTokenOnSameLine(firstToken, nextToken)
  );
}
