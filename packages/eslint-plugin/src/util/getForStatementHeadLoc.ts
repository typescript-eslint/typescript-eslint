import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { nullThrows } from '@typescript-eslint/utils/eslint-utils';

/**
 * Gets the location of the head of the given for statement variant for reporting.
 *
 * - `for (const foo in bar) expressionOrBlock`
 *    ^^^^^^^^^^^^^^^^^^^^^^
 *
 * - `for (const foo of bar) expressionOrBlock`
 *    ^^^^^^^^^^^^^^^^^^^^^^
 *
 * - `for await (const foo of bar) expressionOrBlock`
 *    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * - `for (let i = 0; i < 10; i++) expressionOrBlock`
 *    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 */
export function getForStatementHeadLoc(
  sourceCode: TSESLint.SourceCode,
  node:
    | TSESTree.ForInStatement
    | TSESTree.ForOfStatement
    | TSESTree.ForStatement,
): TSESTree.SourceLocation {
  const closingParens = nullThrows(
    sourceCode.getTokenBefore(node.body, token => token.value === ')'),
    'for statement must have a closing parenthesis.',
  );
  return {
    start: structuredClone(node.loc.start),
    end: structuredClone(closingParens.loc.end),
  };
}
