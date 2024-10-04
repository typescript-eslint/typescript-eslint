import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export function rangeToLoc(
  sourceCode: TSESLint.SourceCode,
  range: TSESLint.AST.Range,
): TSESTree.SourceLocation {
  return {
    start: sourceCode.getLocFromIndex(range[0]),
    end: sourceCode.getLocFromIndex(range[1]),
  };
}
