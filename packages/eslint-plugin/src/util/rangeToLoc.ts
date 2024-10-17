import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export function rangeToLoc(
  sourceCode: TSESLint.SourceCode,
  range: TSESLint.AST.Range,
): TSESTree.SourceLocation {
  return {
    end: sourceCode.getLocFromIndex(range[1]),
    start: sourceCode.getLocFromIndex(range[0]),
  };
}
