import type { TSESTree } from '@typescript-eslint/utils';

import { isStartOfExpressionStatement } from './isStartOfExpressionStatement';

export function isStartOfExpressionStatementNeedingParentheses(
  node: TSESTree.Node,
  firstToken: TSESTree.Token,
): boolean {
  return (
    ['{', 'class', 'function'].includes(firstToken.value) &&
    isStartOfExpressionStatement(node)
  );
}
