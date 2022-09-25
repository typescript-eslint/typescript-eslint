import type { JsxExpression, Node } from 'typescript';
import { SyntaxKind } from 'typescript';

export function isJsxExpression(node: Node): node is JsxExpression {
  return node.kind === SyntaxKind.JsxExpression;
}
