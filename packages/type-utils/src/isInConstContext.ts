import type {
  AssertionExpression,
  Expression,
  Node,
  PrefixUnaryExpression,
  PropertyAssignment,
} from 'typescript';
import { SyntaxKind } from 'typescript';

import { isConstAssertion } from './isConstAssertion';

export function isInConstContext(node: Expression): boolean {
  let current: Node = node;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const parent = current.parent;

    outer: switch (parent.kind) {
      case SyntaxKind.TypeAssertionExpression:
      case SyntaxKind.AsExpression:
        return isConstAssertion(<AssertionExpression>parent);
      case SyntaxKind.PrefixUnaryExpression:
        if (current.kind !== SyntaxKind.NumericLiteral) {
          return false;
        }

        switch ((<PrefixUnaryExpression>parent).operator) {
          case SyntaxKind.PlusToken:
          case SyntaxKind.MinusToken:
            current = parent;
            break outer;
          default:
            return false;
        }
      case SyntaxKind.PropertyAssignment:
        if ((<PropertyAssignment>parent).initializer !== current) {
          return false;
        }

        current = parent.parent!;
        break;
      case SyntaxKind.ShorthandPropertyAssignment:
        current = parent.parent!;
        break;
      case SyntaxKind.ParenthesizedExpression:
      case SyntaxKind.ArrayLiteralExpression:
      case SyntaxKind.ObjectLiteralExpression:
      case SyntaxKind.TemplateExpression:
        current = parent;
        break;
      default:
        return false;
    }
  }
}
