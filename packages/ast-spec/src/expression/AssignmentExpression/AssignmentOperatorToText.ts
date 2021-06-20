import type { SyntaxKind } from 'typescript';

export interface AssignmentOperatorToText {
  [SyntaxKind.EqualsToken]: '=';
  [SyntaxKind.PlusEqualsToken]: '+=';
  [SyntaxKind.MinusEqualsToken]: '-=';
  [SyntaxKind.AsteriskEqualsToken]: '*=';
  [SyntaxKind.AsteriskAsteriskEqualsToken]: '**=';
  [SyntaxKind.SlashEqualsToken]: '/=';
  [SyntaxKind.PercentEqualsToken]: '%=';
  [SyntaxKind.LessThanLessThanEqualsToken]: '<<=';
  [SyntaxKind.GreaterThanGreaterThanEqualsToken]: '>>=';
  [SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken]: '>>>=';
  [SyntaxKind.AmpersandEqualsToken]: '&=';
  [SyntaxKind.BarEqualsToken]: '|=';
  [SyntaxKind.BarBarEqualsToken]: '||='; // included in PunctuationSyntaxKind in TS 4.4
  [SyntaxKind.AmpersandAmpersandEqualsToken]: '&&='; // included in PunctuationSyntaxKind in TS 4.4
  [SyntaxKind.QuestionQuestionEqualsToken]: '??='; // included in PunctuationSyntaxKind in TS 4.4
  [SyntaxKind.CaretEqualsToken]: '^=';
}
