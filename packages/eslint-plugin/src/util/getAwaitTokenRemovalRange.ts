import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

export function getAwaitTokenRemovalRange(
  sourceCode: TSESLint.SourceCode,
  awaitToken: TSESTree.IdentifierToken & { value: 'await' },
): TSESTree.Range {
  const startAt = awaitToken.range[0];
  let endAt = awaitToken.range[1];
  // Also remove any extraneous whitespace after `await`, if there is any.
  const nextToken = sourceCode.getTokenAfter(awaitToken, {
    includeComments: true,
  });
  if (nextToken) {
    endAt = nextToken.range[0];
  }

  return [startAt, endAt];
}
