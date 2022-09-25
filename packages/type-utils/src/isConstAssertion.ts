import type { AssertionExpression } from 'typescript';
import { SyntaxKind } from 'typescript';

import { isTypeReferenceNode } from './isTypeReferenceNode';

export function isConstAssertion(node: AssertionExpression): boolean {
  return (
    isTypeReferenceNode(node.type) &&
    node.type.typeName.kind === SyntaxKind.Identifier &&
    node.type.typeName.escapedText === 'const'
  );
}
