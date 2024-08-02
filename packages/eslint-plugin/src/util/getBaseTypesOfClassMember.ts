import assert from 'assert';
import * as ts from 'typescript';

/**
 * Given a member of a class which extends another class or implements an interface,
 * returns the corresponding member type for each of the base class/interfaces.
 */
export function getBaseTypesOfClassMember(
  checker: ts.TypeChecker,
  memberTsNode: ts.PropertyDeclaration | ts.MethodDeclaration,
  heritageToken: ts.SyntaxKind.ExtendsKeyword | ts.SyntaxKind.ImplementsKeyword,
): ts.Type[] {
  assert(ts.isClassLike(memberTsNode.parent));
  const memberSymbol = checker.getSymbolAtLocation(memberTsNode.name);
  if (memberSymbol == null) {
    return [];
  }
  return (memberTsNode.parent.heritageClauses ?? [])
    .filter(clauseNode => clauseNode.token === heritageToken)
    .flatMap(clauseNode => clauseNode.types)
    .map(baseTypeNode => checker.getTypeAtLocation(baseTypeNode))
    .map(baseType => checker.getPropertyOfType(baseType, memberSymbol.name))
    .filter(baseMemberSymbol => baseMemberSymbol != null)
    .map(baseMemberSymbol =>
      checker.getTypeOfSymbolAtLocation(baseMemberSymbol, memberTsNode),
    );
}
