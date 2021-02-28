import type { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';
import escapeRegExp from 'lodash/escapeRegExp';

// deeply re-export, for convenience
export * from '@typescript-eslint/experimental-utils/dist/ast-utils';

// The following is copied from `eslint`'s source code since it doesn't exist in eslint@5.
// https://github.com/eslint/eslint/blob/145aec1ab9052fbca96a44d04927c595951b1536/lib/rules/utils/ast-utils.js#L1751-L1779
// Could be export { getNameLocationInGlobalDirectiveComment } from 'eslint/lib/rules/utils/ast-utils'
/**
 * Get the `loc` object of a given name in a `/*globals` directive comment.
 * @param {SourceCode} sourceCode The source code to convert index to loc.
 * @param {Comment} comment The `/*globals` directive comment which include the name.
 * @param {string} name The name to find.
 * @returns {SourceLocation} The `loc` object.
 */
export function getNameLocationInGlobalDirectiveComment(
  sourceCode: TSESLint.SourceCode,
  comment: TSESTree.Comment,
  name: string,
): TSESTree.SourceLocation {
  const namePattern = new RegExp(
    `[\\s,]${escapeRegExp(name)}(?:$|[\\s,:])`,
    'gu',
  );

  // To ignore the first text "global".
  namePattern.lastIndex = comment.value.indexOf('global') + 6;

  // Search a given variable name.
  const match = namePattern.exec(comment.value);

  // Convert the index to loc.
  const start = sourceCode.getLocFromIndex(
    comment.range[0] + '/*'.length + (match ? match.index + 1 : 0),
  );
  const end = {
    line: start.line,
    column: start.column + (match ? name.length : 1),
  };

  return { start, end };
}
