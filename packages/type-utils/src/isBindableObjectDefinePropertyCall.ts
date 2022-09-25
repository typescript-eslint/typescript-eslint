// TODO: Remove tsutils function
import { isIdentifier } from 'tsutils';
import type { CallExpression } from 'typescript';

import { isEntityNameExpression } from './isEntityNameExpression';
import { isNumericOrStringLikeLiteral } from './isNumericOrStringLikeLiteral';
import { isPropertyAccessExpression } from './isPropertyAccessExpression';

export function isBindableObjectDefinePropertyCall(
  node: CallExpression,
): boolean {
  return (
    node.arguments.length === 3 &&
    isEntityNameExpression(node.arguments[0]) &&
    isNumericOrStringLikeLiteral(node.arguments[1]) &&
    isPropertyAccessExpression(node.expression) &&
    node.expression.name.escapedText === 'defineProperty' &&
    isIdentifier(node.expression.expression) &&
    node.expression.expression.escapedText === 'Object'
  );
}
