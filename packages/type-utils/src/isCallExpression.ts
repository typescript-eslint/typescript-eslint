import type { CallExpression, Node } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isCallExpression(node: Node): node is CallExpression {
  return node.kind === SyntaxKind.CallExpression;
}
