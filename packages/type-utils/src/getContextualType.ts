import {
  isBinaryExpression,
  isCallExpression,
  isIdentifier,
  isJsxExpression,
  isNewExpression,
  isParameterDeclaration,
  isPropertyAssignment,
  isPropertyDeclaration,
  isVariableDeclaration,
} from 'tsutils';
import * as ts from 'typescript';

/**
 * Returns the contextual type of a given node.
 * Contextual type is the type of the target the node is going into.
 * i.e. the type of a called function's parameter, or the defined type of a variable declaration
 */
export function getContextualType(
  checker: ts.TypeChecker,
  node: ts.Expression,
): ts.Type | undefined {
  const parent = node.parent;
  if (!parent) {
    return;
  }

  if (isCallExpression(parent) || isNewExpression(parent)) {
    if (node === parent.expression) {
      // is the callee, so has no contextual type
      return;
    }
  } else if (
    isVariableDeclaration(parent) ||
    isPropertyDeclaration(parent) ||
    isParameterDeclaration(parent)
  ) {
    return parent.type ? checker.getTypeFromTypeNode(parent.type) : undefined;
  } else if (isJsxExpression(parent)) {
    return checker.getContextualType(parent);
  } else if (isPropertyAssignment(parent) && isIdentifier(node)) {
    return checker.getContextualType(node);
  } else if (
    isBinaryExpression(parent) &&
    parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
    parent.right === node
  ) {
    // is RHS of assignment
    return checker.getTypeAtLocation(parent.left);
  } else if (
    ![ts.SyntaxKind.TemplateSpan, ts.SyntaxKind.JsxExpression].includes(
      parent.kind,
    )
  ) {
    // parent is not something we know we can get the contextual type of
    return;
  }
  // TODO - support return statement checking

  return checker.getContextualType(node);
}
