import type { NewExpression, Node } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isNewExpression(node: Node): node is NewExpression {
  return node.kind === SyntaxKind.NewExpression;
}
