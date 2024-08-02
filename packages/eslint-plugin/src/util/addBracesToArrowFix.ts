import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { getRangeWithParens } from './getRangeWithParens';

export function addBracesToArrowFix(
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  funcNode: TSESTree.ArrowFunctionExpression,
): TSESLint.RuleFix {
  const funcBody = funcNode.body;
  const newFuncBodyText = `{ ${sourceCode.getText(funcBody)}; }`;
  const range = getRangeWithParens(funcBody, sourceCode);
  return fixer.replaceTextRange(range, newFuncBodyText);
}
