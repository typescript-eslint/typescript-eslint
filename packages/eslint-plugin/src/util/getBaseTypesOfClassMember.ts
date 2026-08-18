import type {
  TSESTree,
  ParserServicesWithTypeInformation,
} from '@typescript-eslint/utils';

import * as ts from 'typescript';

/**
 * Given a member of a class which extends another class or implements an interface,
 * yields the corresponding member type for each of the base class/interfaces.
 */
export function* getBaseTypesOfClassMember(
  services: ParserServicesWithTypeInformation,
  memberNode: TSESTree.MethodDefinition | TSESTree.PropertyDefinition,
): Generator<{
  baseType: ts.Type;
  baseMemberType: ts.Type;
  heritageToken: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword;
}> {
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
  const isStaticMember = memberNode.static;
  for (const clauseNode of classNode.heritageClauses ?? []) {
    if (
      isStaticMember &&
      clauseNode.token === ts.SyntaxKind.ImplementsKeyword
    ) {
      // `implements` constrains only the instance side of a class.
      continue;
    }
    for (const baseTypeNode of clauseNode.types) {
      const baseType = checker.getTypeAtLocation(
        isStaticMember ? baseTypeNode.expression : baseTypeNode,
      );
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
