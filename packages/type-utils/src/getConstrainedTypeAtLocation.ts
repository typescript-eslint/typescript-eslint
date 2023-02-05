import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

/**
 * Resolves the given node's type. Will resolve to the type's generic constraint, if it has one.
 */
export function getConstrainedTypeAtLocation(
  services: ParserServicesWithTypeInformation,
  node: TSESTree.Node,
): ts.Type {
  const nodeType = services.getTypeAtLocation(node);
  const constrained = services.program
    .getTypeChecker()
    .getBaseConstraintOfType(nodeType);

  return constrained ?? nodeType;
}
