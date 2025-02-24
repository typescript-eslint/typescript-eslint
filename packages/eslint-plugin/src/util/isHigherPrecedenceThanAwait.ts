import * as ts from 'typescript';

import { getOperatorPrecedence } from './getOperatorPrecedence';

export function isHigherPrecedenceThanAwait(tsNode: ts.Node): boolean {
  const operator = ts.isBinaryExpression(tsNode)
    ? tsNode.operatorToken.kind
    : ts.SyntaxKind.Unknown;
  const nodePrecedence = getOperatorPrecedence(tsNode.kind, operator);
  const awaitPrecedence = getOperatorPrecedence(
    ts.SyntaxKind.AwaitExpression,
    ts.SyntaxKind.Unknown,
  );
  return nodePrecedence > awaitPrecedence;
}
