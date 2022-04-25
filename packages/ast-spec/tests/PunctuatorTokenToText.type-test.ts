import type { PunctuationSyntaxKind } from 'typescript';

import type { PunctuatorTokenToText } from '../src';

// @ts-expect-error: purposely unused
type _Test = {
  readonly [T in PunctuationSyntaxKind]: PunctuatorTokenToText[T];
  // If there are any PunctuationSyntaxKind members that don't have a
  // corresponding PunctuatorTokenToText, then this line will error with
  // "Type 'T' cannot be used to index type 'PunctuatorTokenToText'."
};
