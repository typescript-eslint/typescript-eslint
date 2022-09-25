import type { Node, VariableDeclaration } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isVariableDeclaration(node: Node): node is VariableDeclaration {
  return node.kind === SyntaxKind.VariableDeclaration;
}
