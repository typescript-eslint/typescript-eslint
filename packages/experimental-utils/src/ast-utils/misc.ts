import { TSESTree } from '../ts-estree';

const LINEBREAK_MATCHER = /\r\n|[\r\n\u2028\u2029]/;

/**
 * Determines whether two adjacent tokens are on the same line
 */
function isTokenOnSameLine(
  left: TSESTree.Token | TSESTree.Comment,
  right: TSESTree.Token | TSESTree.Comment,
): boolean {
  return left.loc.end.line === right.loc.start.line;
}

export { isTokenOnSameLine, LINEBREAK_MATCHER };
