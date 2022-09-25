import type { Node, ParameterDeclaration } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isParameterDeclaration(
  node: Node,
): node is ParameterDeclaration {
  return node.kind === SyntaxKind.Parameter;
}
