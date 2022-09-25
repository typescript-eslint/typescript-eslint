import type {
  Node,
  NoSubstitutionTemplateLiteral,
  NumericLiteral,
  StringLiteral,
} from 'typescript';
import { SyntaxKind } from 'typescript';

export function isNumericOrStringLikeLiteral(
  node: Node,
): node is NumericLiteral | StringLiteral | NoSubstitutionTemplateLiteral {
  switch (node.kind) {
    case SyntaxKind.StringLiteral:
    case SyntaxKind.NumericLiteral:
    case SyntaxKind.NoSubstitutionTemplateLiteral:
      return true;
    default:
      return false;
  }
}
