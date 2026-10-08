import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { isOpeningBraceToken, isParenthesized } from './astUtils';

export function isStartOfArrowFunctionBodyNeedingParentheses(
  node: TSESTree.Node,
  firstToken: TSESTree.Token,
  sourceCode: TSESLint.SourceCode,
): boolean {
  return (
    isOpeningBraceToken(firstToken) &&
    isStartOfArrowFunctionBody(node, sourceCode)
  );
}

function isStartOfArrowFunctionBody(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): boolean {
  let current: TSESTree.Node = node;
  while (true) {
    if (isParenthesized(current, sourceCode)) {
      return false;
    }
    const { parent } = current;
    if (parent == null) {
      return false;
    }
    if (
      parent.type === AST_NODE_TYPES.ArrowFunctionExpression &&
      parent.body === current
    ) {
      return true;
    }
    if (parent.range[0] !== current.range[0]) {
      return false;
    }
    current = parent;
  }
}
