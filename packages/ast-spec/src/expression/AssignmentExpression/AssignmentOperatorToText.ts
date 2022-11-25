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
  [SyntaxKind.BarBarEqualsToken]: '||=';
  [SyntaxKind.AmpersandAmpersandEqualsToken]: '&&=';
  [SyntaxKind.QuestionQuestionEqualsToken]: '??=';
  [SyntaxKind.CaretEqualsToken]: '^=';
}
