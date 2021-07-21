import type { SyntaxKind } from 'typescript';

export type PunctuatorTokenValue =
  | '{'
  | '}'
  | '('
  | ')'
  | '['
  | ']'
  | '.'
  | '...'
  | ';'
  | ','
  | '?.'
  | '<'
  | '</'
  | '>'
  | '<='
  | '>='
  | '=='
  | '!='
  | '==='
  | '!=='
  | '=>'
  | '+'
  | '-'
  | '*'
  | '**'
  | '/'
  | '%'
  | '++'
  | '--'
  | '<<'
  | '>>'
  | '>>>'
  | '&'
  | '|'
  | '^'
  | '!'
  | '~'
  | '&&'
  | '||'
  | '?'
  | ':'
  | '@'
  | '??'
  | '`'
  //| '#'
  | '='
  | '+='
  | '-='
  | '*='
  | '**='
  | '/='
  | '%='
  | '<<='
  | '>>='
  | '>>>='
  | '&='
  | '|='
  //| '||='
  //| '&&='
  //| '??='
  | '^=';

// A mapping from the PunctuatorTokenValue strings to their corresponding ts.SyntaxKind enums.
// This mapping is only used by PunctuatorTokenValue.test.ts, but it is kept in this file to make
// it easier to keep in sync with the PunctuatorTokenValue list.
export interface PunctuatorTokenValueTestMap {
  '{': SyntaxKind.OpenBraceToken;
  '}': SyntaxKind.CloseBraceToken;
  '(': SyntaxKind.OpenParenToken;
  ')': SyntaxKind.CloseParenToken;
  '[': SyntaxKind.OpenBracketToken;
  ']': SyntaxKind.CloseBracketToken;
  '.': SyntaxKind.DotToken;
  '...': SyntaxKind.DotDotDotToken;
  ';': SyntaxKind.SemicolonToken;
  ',': SyntaxKind.CommaToken;
  '?.': SyntaxKind.QuestionDotToken;
  '<': SyntaxKind.LessThanToken;
  '</': SyntaxKind.LessThanSlashToken;
  '>': SyntaxKind.GreaterThanToken;
  '<=': SyntaxKind.LessThanEqualsToken;
  '>=': SyntaxKind.GreaterThanEqualsToken;
  '==': SyntaxKind.EqualsEqualsToken;
  '!=': SyntaxKind.ExclamationEqualsToken;
  '===': SyntaxKind.EqualsEqualsEqualsToken;
  '!==': SyntaxKind.ExclamationEqualsEqualsToken;
  '=>': SyntaxKind.EqualsGreaterThanToken;
  '+': SyntaxKind.PlusToken;
  '-': SyntaxKind.MinusToken;
  '*': SyntaxKind.AsteriskToken;
  '**': SyntaxKind.AsteriskAsteriskToken;
  '/': SyntaxKind.SlashToken;
  '%': SyntaxKind.PercentToken;
  '++': SyntaxKind.PlusPlusToken;
  '--': SyntaxKind.MinusMinusToken;
  '<<': SyntaxKind.LessThanLessThanToken;
  '>>': SyntaxKind.GreaterThanGreaterThanToken;
  '>>>': SyntaxKind.GreaterThanGreaterThanGreaterThanToken;
  '&': SyntaxKind.AmpersandToken;
  '|': SyntaxKind.BarToken;
  '^': SyntaxKind.CaretToken;
  '!': SyntaxKind.ExclamationToken;
  '~': SyntaxKind.TildeToken;
  '&&': SyntaxKind.AmpersandAmpersandToken;
  '||': SyntaxKind.BarBarToken;
  '?': SyntaxKind.QuestionToken;
  ':': SyntaxKind.ColonToken;
  '@': SyntaxKind.AtToken;
  '??': SyntaxKind.QuestionQuestionToken;
  '`': SyntaxKind.BacktickToken;
  // '#': SyntaxKind.HashToken; // new in PunctuationSyntaxKind in TS 4.4
  '=': SyntaxKind.EqualsToken;
  '+=': SyntaxKind.PlusEqualsToken;
  '-=': SyntaxKind.MinusEqualsToken;
  '*=': SyntaxKind.AsteriskEqualsToken;
  '**=': SyntaxKind.AsteriskAsteriskEqualsToken;
  '/=': SyntaxKind.SlashEqualsToken;
  '%=': SyntaxKind.PercentEqualsToken;
  '<<=': SyntaxKind.LessThanLessThanEqualsToken;
  '>>=': SyntaxKind.GreaterThanGreaterThanEqualsToken;
  '>>>=': SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken;
  '&=': SyntaxKind.AmpersandEqualsToken;
  '|=': SyntaxKind.BarEqualsToken;
  //  '||=': SyntaxKind.BarBarEqualsToken; // included in PunctuationSyntaxKind in TS 4.4
  //  '&&=': SyntaxKind.AmpersandAmpersandEqualsToken; // included in PunctuationSyntaxKind in TS 4.4
  //  '??=': SyntaxKind.QuestionQuestionEqualsToken; // included in PunctuationSyntaxKind in TS 4.4
  '^=': SyntaxKind.CaretEqualsToken;
}
