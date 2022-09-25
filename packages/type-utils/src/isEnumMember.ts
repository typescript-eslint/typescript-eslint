import type { EnumMember, Node } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isEnumMember(node: Node): node is EnumMember {
  return node.kind === SyntaxKind.EnumMember;
}
