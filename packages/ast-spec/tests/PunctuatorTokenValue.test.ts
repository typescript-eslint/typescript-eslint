import type { PunctuationSyntaxKind } from 'typescript';

import type {
  PunctuatorTokenValue,
  PunctuatorTokenValueTestMap,
} from '../src/token/PunctuatorToken/PunctuatorTokenValue';

// The keys of PunctuatorTokenValueTestMap ('{', '}', '('...) should be the same as
// the members of our PunctuatorTokenValue union.
type InferredPunctuatorTokenValue = keyof PunctuatorTokenValueTestMap;

// The values of PunctuatorTokenValueTestMap (SyntaxKind.OpenBraceToken,
// SyntaxKind.CloseBraceToken, SyntaxKind.OpenParenToken...) should be the same as
// the members of TypeScript's PunctuationSyntaxKind union.
type InferredPunctuationSyntaxKind =
  PunctuatorTokenValueTestMap[keyof PunctuatorTokenValueTestMap];

// If this function compiles without errors, it asserts that InferredPunctuationSyntaxKind and PunctuationSyntaxKind
// have the same elements.
export function testPunctuationSyntaxKind(
  x: InferredPunctuationSyntaxKind,
  y: PunctuationSyntaxKind,
): void {
  testPunctuationSyntaxKind(y, x);
}

// If this function compiles without errors, it asserts that InferredPunctuatorTokenValue and PunctuatorTokenValue
// have the same elements.
export function testPunctuatorTokenValue(
  x: InferredPunctuatorTokenValue,
  y: PunctuatorTokenValue,
): void {
  testPunctuatorTokenValue(y, x);
}
