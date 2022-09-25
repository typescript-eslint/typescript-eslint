import type { Node, PropertyDeclaration } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isPropertyDeclaration(node: Node): node is PropertyDeclaration {
  return node.kind === SyntaxKind.PropertyDeclaration;
}
