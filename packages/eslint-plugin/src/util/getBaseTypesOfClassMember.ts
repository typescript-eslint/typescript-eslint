import type {
  TSESTree,
  ParserServicesWithTypeInformation,
} from '@typescript-eslint/utils';
import type * as ts from 'typescript';

/**
 * Given a member of a class which extends another class or implements an interface,
 * yields the corresponding member type for each of the base class/interfaces.
 */
export function* getBaseTypesOfClassMember(
  services: ParserServicesWithTypeInformation,
  memberNode:
    | TSESTree.AccessorProperty
    | TSESTree.MethodDefinition
    | TSESTree.PropertyDefinition,
): Generator<{
  baseType: ts.Type;
  baseMemberType: ts.Type;
  heritageToken: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword;
}> {
  // The base types below are instance types, which don't have static members
  if (memberNode.static) {
    return;
  }
  const memberTsNode = services.esTreeNodeToTSNodeMap.get(memberNode);
  if (memberTsNode.name == null) {
    return;
  }
  const checker = services.program.getTypeChecker();
  const memberSymbol = checker.getSymbolAtLocation(memberTsNode.name);
  if (memberSymbol == null) {
    return;
  }
  const classNode = memberTsNode.parent as ts.ClassLikeDeclaration;
  for (const clauseNode of classNode.heritageClauses ?? []) {
    for (const baseTypeNode of clauseNode.types) {
      const baseType = checker.getTypeAtLocation(baseTypeNode);
      const baseMemberSymbol = checker.getPropertyOfType(
        baseType,
        memberSymbol.name,
      );
      if (baseMemberSymbol == null) {
        continue;
      }
      const baseMemberType = checker.getTypeOfSymbolAtLocation(
        baseMemberSymbol,
        memberTsNode,
      );
      const heritageToken = clauseNode.token;
      yield { baseMemberType, baseType, heritageToken };
    }
  }
}
