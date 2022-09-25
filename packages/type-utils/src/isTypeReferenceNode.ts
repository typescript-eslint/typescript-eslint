import type { Node, TypeReferenceNode } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isTypeReferenceNode(node: Node): node is TypeReferenceNode {
  return node.kind === SyntaxKind.TypeReference;
}
