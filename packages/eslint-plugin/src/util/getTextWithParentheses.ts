import type { TSESTree } from '@typescript-eslint/utils';
import type { SourceCode } from '@typescript-eslint/utils/ts-eslint';

import {
  isClosingParenToken,
  isOpeningParenToken,
  isParenthesized,
  nullThrows,
  NullThrowsReasons,
} from '.';

export function getTextWithParentheses(
  sourceCode: Readonly<SourceCode>,
  node: TSESTree.Node,
): string {
  // Capture parentheses before and after the node
  let beforeCount = 0;
  let afterCount = 0;

  if (isParenthesized(node, sourceCode)) {
    const bodyOpeningParen = sourceCode.getTokenBefore(
      node,
      isOpeningParenToken,
    );
    nullThrows(bodyOpeningParen, NullThrowsReasons.MissingToken('(', 'node'));
    const bodyClosingParen = sourceCode.getTokenAfter(
      node,
      isClosingParenToken,
    );
    nullThrows(bodyClosingParen, NullThrowsReasons.MissingToken(')', 'node'));

    beforeCount = node.range[0] - bodyOpeningParen.range[0];
    afterCount = bodyClosingParen.range[1] - node.range[1];
  }

  return sourceCode.getText(node, beforeCount, afterCount);
}
