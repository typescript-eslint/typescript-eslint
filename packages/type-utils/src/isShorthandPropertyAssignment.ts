import type { Node, ShorthandPropertyAssignment } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isShorthandPropertyAssignment(
  node: Node,
): node is ShorthandPropertyAssignment {
  return node.kind === SyntaxKind.ShorthandPropertyAssignment;
}
