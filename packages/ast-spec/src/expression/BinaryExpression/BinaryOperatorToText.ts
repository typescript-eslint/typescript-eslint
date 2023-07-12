import type { SyntaxKind } from 'typescript';

// the members of ts.BinaryOperator
export interface BinaryOperatorToText {
  [SyntaxKind.InstanceOfKeyword]: 'instanceof';
  [SyntaxKind.InKeyword]: 'in';

  // math
  [SyntaxKind.AsteriskAsteriskToken]: '**';
  [SyntaxKind.AsteriskToken]: '*';
  [SyntaxKind.SlashToken]: '/';
  [SyntaxKind.PercentToken]: '%';
  [SyntaxKind.PlusToken]: '+';
  [SyntaxKind.MinusToken]: '-';

  // bitwise
  [SyntaxKind.AmpersandToken]: '&';
  [SyntaxKind.BarToken]: '|';
  [SyntaxKind.CaretToken]: '^';
  [SyntaxKind.LessThanLessThanToken]: '<<';
  [SyntaxKind.GreaterThanGreaterThanToken]: '>>';
  [SyntaxKind.GreaterThanGreaterThanGreaterThanToken]: '>>>';

  // logical
  [SyntaxKind.AmpersandAmpersandToken]: '&&';
  [SyntaxKind.BarBarToken]: '||';
  [SyntaxKind.LessThanToken]: '<';
  [SyntaxKind.LessThanEqualsToken]: '<=';
  [SyntaxKind.GreaterThanToken]: '>';
  [SyntaxKind.GreaterThanEqualsToken]: '>=';
  [SyntaxKind.EqualsEqualsToken]: '==';
  [SyntaxKind.EqualsEqualsEqualsToken]: '===';
  [SyntaxKind.ExclamationEqualsEqualsToken]: '!==';
  [SyntaxKind.ExclamationEqualsToken]: '!=';
}
