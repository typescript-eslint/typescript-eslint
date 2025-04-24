import type * as ts from 'typescript';

/**
 * Given a member of a class which extends another class or implements an interface,
 * yields the corresponding member type for each of the base class/interfaces.
 */
export function* getBaseTypesOfClassMember(
  checker: ts.TypeChecker,
  memberTsNode: ts.MethodDeclaration | ts.PropertyDeclaration,
): Generator<{
  baseType: ts.Type;
  baseMemberType: ts.Type;
  heritageToken: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword;
}> {
  const classNode = memberTsNode.parent as ts.ClassLikeDeclaration;
  const memberSymbol = checker.getSymbolAtLocation(memberTsNode.name);
  if (memberSymbol == null) {
    return;
  }
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
