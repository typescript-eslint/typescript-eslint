import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { ASTUtils, ESLintUtils } from '@typescript-eslint/utils';

/**
 * Gets the range of the node including any parentheses around it.
 *
 * For example, given a function node like `() => ({})`,
 * calling this on `function.body` would return the range of `({})` instead of just `{}`.
 */
export function getRangeWithParens(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): TSESTree.Range {
  let startToken = ESLintUtils.nullThrows(
    sourceCode.getFirstToken(node),
    ESLintUtils.NullThrowsReasons.MissingToken('first token', node.type),
  );
  let endToken = ESLintUtils.nullThrows(
    sourceCode.getLastToken(node),
    ESLintUtils.NullThrowsReasons.MissingToken('last token', node.type),
  );

  for (;;) {
    const prevToken = sourceCode.getTokenBefore(startToken);
    const nextToken = sourceCode.getTokenAfter(endToken);
    if (prevToken == null || nextToken == null) {
      break;
    }
    if (
      !ASTUtils.isOpeningParenToken(prevToken) ||
      !ASTUtils.isClosingParenToken(nextToken)
    ) {
      break;
    }
    startToken = prevToken;
    endToken = nextToken;
  }

  return [startToken.range[0], endToken.range[1]];
}
