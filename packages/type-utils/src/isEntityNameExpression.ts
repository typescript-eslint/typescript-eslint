import type { EntityNameExpression, Node } from 'typescript';
import { SyntaxKind } from 'typescript';

import { isPropertyAccessExpression } from './isPropertyAccessExpression';

export function isEntityNameExpression(
  node: Node,
): node is EntityNameExpression {
  return (
    node.kind === SyntaxKind.Identifier ||
    (isPropertyAccessExpression(node) &&
      isEntityNameExpression(node.expression))
  );
}
