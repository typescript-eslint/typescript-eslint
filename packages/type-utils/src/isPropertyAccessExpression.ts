import type { Node, PropertyAccessExpression } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isPropertyAccessExpression(
  node: Node,
): node is PropertyAccessExpression {
  return node.kind === SyntaxKind.PropertyAccessExpression;
}
