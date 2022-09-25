import type { BinaryExpression, Node } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isBinaryExpression(node: Node): node is BinaryExpression {
  return node.kind === SyntaxKind.BinaryExpression;
}
