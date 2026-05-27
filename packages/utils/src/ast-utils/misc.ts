import type { TSESTree } from '../ts-estree';

/**
 * A regular expression to match line terminators.
 * @see https://tc39.es/ecma262/multipage/ecmascript-language-lexical-grammar.html#prod-LineTerminator
 */
export const LINEBREAK_MATCHER = /\r\n|[\r\n\u2028\u2029]/;

/**
 * Determines whether two adjacent tokens are on the same line
 */
export function isTokenOnSameLine(
  left: TSESTree.Node | TSESTree.Token,
  right: TSESTree.Node | TSESTree.Token,
): boolean {
  return left.loc.end.line === right.loc.start.line;
}
