import type { Node, PropertyAssignment } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isPropertyAssignment(node: Node): node is PropertyAssignment {
  return node.kind === SyntaxKind.PropertyAssignment;
}
