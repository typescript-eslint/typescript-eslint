import assert from 'assert';
import * as ts from 'typescript';

/**
 * Given a member of a class which extends another class or implements an interface,
 * yields the corresponding member type for each of the base class/interfaces.
 */
export function* getBaseTypesOfClassMember(
  checker: ts.TypeChecker,
  memberTsNode: ts.PropertyDeclaration | ts.MethodDeclaration,
  heritageToken: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword,
): Generator<{ baseType: ts.Type; baseMemberType: ts.Type }> {
  assert(ts.isClassLike(memberTsNode.parent));
  const memberSymbol = checker.getSymbolAtLocation(memberTsNode.name);
  if (memberSymbol == null) {
    return;
  }
  for (const clauseNode of memberTsNode.parent.heritageClauses ?? []) {
    if (clauseNode.token !== heritageToken) {
      continue;
    }
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
      yield { baseType, baseMemberType };
    }
  }
}
