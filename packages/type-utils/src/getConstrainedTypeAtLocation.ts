import type * as ts from 'typescript';

/**
 * Resolves the given node's type. Will resolve to the type's generic constraint, if it has one.
 */
export function getConstrainedTypeAtLocation(
  checker: ts.TypeChecker,
  node: ts.Node,
): ts.Type {
  const nodeType = checker.getTypeAtLocation(node);
  const constrained = checker.getBaseConstraintOfType(nodeType);

  return constrained ?? nodeType;
}
